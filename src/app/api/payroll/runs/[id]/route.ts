import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const run = await prisma.payrollRun.findUnique({
      where: { id },
      include: {
        processedBy: { select: { id: true, name: true, email: true, role: true } },
        approvedBy: { select: { id: true, name: true, email: true, role: true } },
        records: {
          include: {
            employee: {
              include: { department: true, designation: true },
            },
            payslip: true,
          },
          orderBy: { employee: { employeeCode: 'asc' } },
        },
      },
    });

    if (!run) {
      return NextResponse.json({ success: false, error: 'Payroll run not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, run });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const run = await prisma.payrollRun.findUnique({ where: { id } });
    if (!run) {
      return NextResponse.json({ success: false, error: 'Payroll run not found' }, { status: 404 });
    }

    if (run.status === 'FINALIZED') {
      return NextResponse.json({ success: false, error: 'Cannot delete a finalized payroll run' }, { status: 400 });
    }

    await prisma.payrollRun.delete({ where: { id } });

    await logAuditEvent({
      action: 'DELETE_PAYROLL_RUN',
      module: 'PAYROLL',
      recordId: id,
      recordName: `Period ${run.periodMonth}/${run.periodYear}`,
    });

    return NextResponse.json({ success: true, message: 'Payroll run deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
