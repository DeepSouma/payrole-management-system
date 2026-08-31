import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const run = await prisma.payrollRun.findUnique({
      where: { id },
      include: {
        records: {
          include: { employee: true },
        },
      },
    });

    if (!run) {
      return NextResponse.json({ success: false, error: 'Payroll run not found' }, { status: 404 });
    }

    if (run.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Only approved payroll runs can be finalized and locked.' },
        { status: 400 }
      );
    }

    // 1. Mark run as FINALIZED
    const updated = await prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'FINALIZED',
        finalizedDate: new Date(),
      },
    });

    // 2. Generate Payslips for each record in the run
    let payslipsGenerated = 0;
    for (let index = 0; index < run.records.length; index++) {
      const record = run.records[index];
      const payslipNumber = `PS-${run.periodYear}-${String(run.periodMonth).padStart(2, '0')}-${record.employee.employeeCode}-${String(index + 1).padStart(3, '0')}`;

      await prisma.payslip.upsert({
        where: { payrollRecordId: record.id },
        update: {
          payslipNumber,
          generatedAt: new Date(),
          status: 'GENERATED',
        },
        create: {
          payrollRecordId: record.id,
          payslipNumber,
          generatedAt: new Date(),
          status: 'GENERATED',
        },
      });

      // Update record payment status
      await prisma.payrollRecord.update({
        where: { id: record.id },
        data: {
          paymentStatus: 'PAID',
          paymentDate: new Date(),
          paymentReference: `NEFT-${Date.now().toString().slice(-8)}`,
        },
      });

      payslipsGenerated++;
    }

    await logAuditEvent({
      action: 'FINALIZE_PAYROLL_AND_GENERATE_PAYSLIPS',
      module: 'PAYROLL',
      recordId: id,
      recordName: `Period ${run.periodMonth}/${run.periodYear} Finalized (${payslipsGenerated} Payslips)`,
      newValue: { payslipsGenerated, status: 'FINALIZED' },
    });

    return NextResponse.json({
      success: true,
      run: updated,
      payslipsGenerated,
      message: `Payroll finalized successfully. ${payslipsGenerated} payslips generated.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
