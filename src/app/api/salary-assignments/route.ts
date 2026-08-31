import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;

    const assignments = await prisma.employeeSalaryAssignment.findMany({
      where,
      include: {
        employee: {
          include: { department: true, designation: true },
        },
        salaryStructure: {
          include: {
            items: { include: { component: true } },
          },
        },
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    return NextResponse.json({ success: true, assignments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, salaryStructureId, basicSalary, allowancesJson, deductionsJson, effectiveFrom, remarks } = body;

    // Deactivate previous active assignment for this employee
    await prisma.employeeSalaryAssignment.updateMany({
      where: { employeeId, status: 'ACTIVE' },
      data: { status: 'SUPERSEDED', effectiveTo: new Date() },
    });

    const assignment = await prisma.employeeSalaryAssignment.create({
      data: {
        employeeId,
        salaryStructureId,
        basicSalary: Number(basicSalary),
        allowancesJson: typeof allowancesJson === 'string' ? allowancesJson : JSON.stringify(allowancesJson || []),
        deductionsJson: typeof deductionsJson === 'string' ? deductionsJson : JSON.stringify(deductionsJson || []),
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        status: 'ACTIVE',
        remarks,
      },
      include: {
        employee: true,
        salaryStructure: true,
      },
    });

    await logAuditEvent({
      action: 'ASSIGN_SALARY_STRUCTURE',
      module: 'SALARY_ASSIGNMENT',
      recordId: assignment.id,
      recordName: `${assignment.employee.firstName} ${assignment.employee.lastName} -> ${assignment.salaryStructure.name}`,
      newValue: assignment,
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
