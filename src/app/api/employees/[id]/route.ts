import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        designation: true,
        reportingManager: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, email: true },
        },
        subordinates: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, designation: true },
        },
        salaryAssignments: {
          include: { salaryStructure: true },
          orderBy: { effectiveFrom: 'desc' },
        },
        attendanceRecords: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 12,
        },
        payrollRecords: {
          include: {
            payrollRun: true,
            payslip: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, employee });
  } catch (error: any) {
    console.error('Error fetching employee detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    const previous = await prisma.employee.findUnique({ where: { id } });
    if (!previous) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : previous.dateOfBirth,
        gender: body.gender,
        address: body.address,
        departmentId: body.departmentId,
        designationId: body.designationId,
        employmentType: body.employmentType,
        status: body.status,
        reportingManagerId: body.reportingManagerId || null,
        panNumber: body.panNumber,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        ifscCode: body.ifscCode,
      },
      include: {
        department: true,
        designation: true,
      },
    });

    await logAuditEvent({
      action: 'UPDATE_EMPLOYEE',
      module: 'EMPLOYEE',
      recordId: updated.id,
      recordName: `${updated.firstName} ${updated.lastName} (${updated.employeeCode})`,
      previousValue: previous,
      newValue: updated,
    });

    return NextResponse.json({ success: true, employee: updated });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const employee = await prisma.employee.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    await logAuditEvent({
      action: 'DEACTIVATE_EMPLOYEE',
      module: 'EMPLOYEE',
      recordId: employee.id,
      recordName: `${employee.firstName} ${employee.lastName}`,
    });

    return NextResponse.json({ success: true, message: 'Employee deactivated successfully' });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
