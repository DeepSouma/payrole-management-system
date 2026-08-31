import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const payslip = await prisma.payslip.findUnique({
      where: { id },
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
    });

    if (!payslip) {
      return NextResponse.json({ success: false, error: 'Payslip not found' }, { status: 404 });
    }

    const setting = await prisma.organizationSetting.findFirst();

    return NextResponse.json({
      success: true,
      payslip,
      organization: setting,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
