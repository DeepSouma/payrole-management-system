import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const departmentId = searchParams.get('departmentId') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: true,
        designation: true,
        reportingManager: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true },
        },
        salaryAssignments: {
          where: { status: 'ACTIVE' },
          include: { salaryStructure: true },
          take: 1,
        },
      },
      orderBy: { employeeCode: 'asc' },
    });

    return NextResponse.json({ success: true, employees });
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      employeeCode,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      departmentId,
      designationId,
      joiningDate,
      employmentType,
      reportingManagerId,
      panNumber,
      bankName,
      accountNumber,
      ifscCode,
      salaryStructureId,
      basicSalary,
    } = body;

    // Check duplicate code or email
    const existing = await prisma.employee.findFirst({
      where: {
        OR: [{ employeeCode }, { email }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Employee code or email already in use.' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        employeeCode,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        departmentId,
        designationId,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        employmentType: employmentType || 'FULL_TIME',
        reportingManagerId: reportingManagerId || null,
        panNumber,
        bankName,
        accountNumber,
        ifscCode,
      },
      include: {
        department: true,
        designation: true,
      },
    });

    // If salary structure is provided, create initial salary assignment
    if (salaryStructureId && basicSalary) {
      const parsedBasic = Number(basicSalary);
      await prisma.employeeSalaryAssignment.create({
        data: {
          employeeId: employee.id,
          salaryStructureId,
          basicSalary: parsedBasic,
          allowancesJson: JSON.stringify([
            { code: 'HRA', name: 'House Rent Allowance', amount: parsedBasic * 0.5 },
            { code: 'TRA', name: 'Transport Allowance', amount: 3000 },
            { code: 'SPL', name: 'Special Allowance', amount: 10000 },
          ]),
          deductionsJson: JSON.stringify([
            { code: 'PF', name: 'Provident Fund (PF)', amount: parsedBasic * 0.12 },
            { code: 'INS', name: 'Health Insurance', amount: 1200 },
            { code: 'PT', name: 'Professional Tax', amount: 200 },
          ]),
          effectiveFrom: new Date(),
          status: 'ACTIVE',
        },
      });
    }

    // Default attendance record for current month
    await prisma.attendanceRecord.create({
      data: {
        employeeId: employee.id,
        month: 8,
        year: 2026,
        totalWorkingDays: 30,
        presentDays: 30,
        absentDays: 0,
        paidLeaves: 0,
        unpaidLeaves: 0,
        overtimeHours: 0,
      },
    });

    await logAuditEvent({
      action: 'CREATE_EMPLOYEE',
      module: 'EMPLOYEE',
      recordId: employee.id,
      recordName: `${employee.firstName} ${employee.lastName} (${employee.employeeCode})`,
      newValue: { code: employee.employeeCode, email: employee.email, dept: employee.department.name },
    });

    return NextResponse.json({ success: true, employee });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
