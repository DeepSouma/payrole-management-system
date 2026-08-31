import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const structures = await prisma.salaryStructure.findMany({
      include: {
        items: {
          include: { component: true },
        },
        assignments: {
          select: { id: true, employeeId: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, structures });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, description, items } = body;

    const structure = await prisma.salaryStructure.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        items: {
          create: (items || []).map((item: any) => ({
            componentId: item.componentId,
            type: item.type,
            calculationType: item.calculationType,
            value: Number(item.value) || 0,
          })),
        },
      },
      include: {
        items: {
          include: { component: true },
        },
      },
    });

    await logAuditEvent({
      action: 'CREATE_SALARY_STRUCTURE',
      module: 'SALARY_CONFIG',
      recordId: structure.id,
      recordName: structure.name,
      newValue: structure,
    });

    return NextResponse.json({ success: true, structure });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
