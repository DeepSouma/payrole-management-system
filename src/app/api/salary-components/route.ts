import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const components = await prisma.salaryComponent.findMany({
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ success: true, components });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, type, calculationType, defaultAmount, percentageValue, isTaxable, isMandatory, description } = body;

    const existing = await prisma.salaryComponent.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Component code already exists' }, { status: 400 });
    }

    const component = await prisma.salaryComponent.create({
      data: {
        name,
        code: code.toUpperCase(),
        type: type || 'EARNING',
        calculationType: calculationType || 'FIXED',
        defaultAmount: Number(defaultAmount) || 0,
        percentageValue: Number(percentageValue) || 0,
        isTaxable: isTaxable !== false,
        isMandatory: isMandatory || false,
        description,
      },
    });

    await logAuditEvent({
      action: 'CREATE_SALARY_COMPONENT',
      module: 'SALARY_CONFIG',
      recordId: component.id,
      recordName: `${component.name} (${component.code})`,
      newValue: component,
    });

    return NextResponse.json({ success: true, component });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
