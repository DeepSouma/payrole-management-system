import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const run = await prisma.payrollRun.findUnique({ where: { id } });

    if (!run) {
      return NextResponse.json({ success: false, error: 'Payroll run not found' }, { status: 404 });
    }

    const updated = await prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'UNDER_REVIEW',
      },
    });

    await logAuditEvent({
      action: 'SUBMIT_PAYROLL_FOR_REVIEW',
      module: 'PAYROLL',
      recordId: id,
      recordName: `Period ${run.periodMonth}/${run.periodYear}`,
      previousValue: { status: run.status },
      newValue: { status: 'UNDER_REVIEW' },
    });

    return NextResponse.json({
      success: true,
      run: updated,
      message: 'Payroll run submitted for manager review.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
