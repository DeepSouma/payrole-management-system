import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        designations: true,
        employees: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, status: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, departments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, description } = body;

    const existing = await prisma.department.findFirst({
      where: { OR: [{ code: code.toUpperCase() }, { name }] },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Department code or name already exists' }, { status: 400 });
    }

    const dept = await prisma.department.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
      },
    });

    await logAuditEvent({
      action: 'CREATE_DEPARTMENT',
      module: 'ORGANIZATION',
      recordId: dept.id,
      recordName: dept.name,
      newValue: dept,
    });

    return NextResponse.json({ success: true, department: dept });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
