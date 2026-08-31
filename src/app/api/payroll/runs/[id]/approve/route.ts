import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { action, comments, approvedByUserId } = body;

    const run = await prisma.payrollRun.findUnique({ where: { id } });
    if (!run) {
      return NextResponse.json({ success: false, error: 'Payroll run not found' }, { status: 404 });
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updated = await prisma.payrollRun.update({
      where: { id },
      data: {
        status: newStatus,
        approvalComments: comments || null,
        approvalDate: new Date(),
        approvedById: approvedByUserId || null,
      },
      include: {
        approvedBy: { select: { name: true, email: true } },
      },
    });

    await logAuditEvent({
      action: action === 'APPROVE' ? 'APPROVE_PAYROLL' : 'REJECT_PAYROLL',
      module: 'PAYROLL_APPROVAL',
      recordId: id,
      recordName: `Period ${run.periodMonth}/${run.periodYear}`,
      previousValue: { status: run.status },
      newValue: { status: newStatus, comments },
    });

    return NextResponse.json({
      success: true,
      run: updated,
      message: action === 'APPROVE' ? 'Payroll run successfully approved!' : 'Payroll run rejected and returned for correction.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
