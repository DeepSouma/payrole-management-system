import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const runId = searchParams.get('runId');

    const where: any = {};
    if (employeeId) {
      where.payrollRecord = { employeeId };
    }
    if (runId) {
      where.payrollRecord = { ...(where.payrollRecord || {}), payrollRunId: runId };
    }

    const payslips = await prisma.payslip.findMany({
      where,
      include: {
        payrollRecord: {
          include: {
            payrollRun: true,
            employee: {
              include: {
                department: true,
                designation: true,
              },
            },
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, payslips });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
