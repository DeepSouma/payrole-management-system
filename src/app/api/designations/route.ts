import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const designations = await prisma.designation.findMany({
      include: {
        department: true,
        employees: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true },
        },
      },
      orderBy: { title: 'asc' },
    });

    return NextResponse.json({ success: true, designations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, title, departmentId, minSalary, maxSalary } = body;

    const designation = await prisma.designation.create({
      data: {
        code: code.toUpperCase(),
        title,
        departmentId,
        minSalary: Number(minSalary) || 0,
        maxSalary: Number(maxSalary) || 0,
      },
      include: {
        department: true,
      },
    });

    await logAuditEvent({
      action: 'CREATE_DESIGNATION',
      module: 'ORGANIZATION',
      recordId: designation.id,
      recordName: designation.title,
      newValue: designation,
    });

    return NextResponse.json({ success: true, designation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
