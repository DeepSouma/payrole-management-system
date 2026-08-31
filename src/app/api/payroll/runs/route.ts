import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateEmployeePayroll } from '@/lib/payroll-engine';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const runs = await prisma.payrollRun.findMany({
      include: {
        processedBy: { select: { name: true, email: true, role: true } },
        approvedBy: { select: { name: true, email: true, role: true } },
        _count: { select: { records: true } },
      },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    });

    return NextResponse.json({ success: true, runs });
  } catch (error: any) {
    console.error('Error listing payroll runs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { month, year, processedByUserId, employeeIds } = body;

    const periodMonth = parseInt(month, 10);
    const periodYear = parseInt(year, 10);

    const settings = await prisma.organizationSetting.findFirst();
    const pfRate = settings?.pfPercentage ?? 12.0;
    const taxRate = settings?.defaultTaxRate ?? 10.0;

    // Fetch active employees with their active salary assignments & attendance for the given period
    const employeeWhere: any = { status: 'ACTIVE' };
    if (Array.isArray(employeeIds) && employeeIds.length > 0) {
      employeeWhere.id = { in: employeeIds };
    }

    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      include: {
        department: true,
        designation: true,
        salaryAssignments: {
          where: { status: 'ACTIVE' },
          include: { salaryStructure: true },
          take: 1,
        },
        attendanceRecords: {
          where: { month: periodMonth, year: periodYear },
        },
      },
    });

    if (employees.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active employees found to process payroll for this period.' },
        { status: 400 }
      );
    }

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    const calculatedRecords = [];

    for (const emp of employees) {
      const assignment = emp.salaryAssignments[0];
      const basicSalary = assignment ? assignment.basicSalary : 35000;

      let appliedAllowances = [];
      let appliedDeductions = [];

      try {
        if (assignment?.allowancesJson) {
          appliedAllowances = JSON.parse(assignment.allowancesJson);
        }
      } catch (e) {}

      try {
        if (assignment?.deductionsJson) {
          appliedDeductions = JSON.parse(assignment.deductionsJson);
        }
      } catch (e) {}

      const attendance = emp.attendanceRecords[0];
      const totalWorkingDays = attendance?.totalWorkingDays ?? (settings?.workingDaysPerMonth || 30);
      const presentDays = attendance?.presentDays ?? totalWorkingDays;
      const unpaidLeaves = attendance?.unpaidLeaves ?? 0;
      const overtimeHours = attendance?.overtimeHours ?? 0;

      const calc = calculateEmployeePayroll({
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        departmentName: emp.department.name,
        designationTitle: emp.designation.title,
        basicSalary,
        allowances: appliedAllowances,
        deductions: appliedDeductions,
        totalWorkingDays,
        presentDays,
        unpaidLeaves,
        overtimeHours,
        pfRate,
        taxRate,
      });

      totalGross += calc.grossSalary;
      totalDeductions += calc.totalDeductions;
      totalNet += calc.netSalary;

      calculatedRecords.push({
        employeeId: emp.id,
        basicSalary: calc.basicSalary,
        earningsBreakdownJson: JSON.stringify(calc.earnings),
        deductionsBreakdownJson: JSON.stringify(calc.deductions),
        grossSalary: calc.grossSalary,
        totalDeductions: calc.totalDeductions,
        netSalary: calc.netSalary,
        workingDays: calc.workingDays,
        presentDays: calc.presentDays,
        lopDays: calc.lopDays,
        lopDeduction: calc.lopDeduction,
        overtimeHours: calc.overtimeHours,
        overtimeAmount: calc.overtimeAmount,
        taxDeduction: calc.taxDeduction,
        pfDeduction: calc.pfDeduction,
      });
    }

    // Upsert PayrollRun
    const payrollRun = await prisma.payrollRun.upsert({
      where: {
        periodMonth_periodYear: {
          periodMonth,
          periodYear,
        },
      },
      update: {
        status: 'CALCULATED',
        totalEmployees: employees.length,
        totalGross: Math.round(totalGross * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        totalNet: Math.round(totalNet * 100) / 100,
        processedById: processedByUserId || null,
      },
      create: {
        periodMonth,
        periodYear,
        status: 'CALCULATED',
        totalEmployees: employees.length,
        totalGross: Math.round(totalGross * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        totalNet: Math.round(totalNet * 100) / 100,
        processedById: processedByUserId || null,
      },
    });

    // Delete existing records for recalculation
    await prisma.payrollRecord.deleteMany({
      where: { payrollRunId: payrollRun.id },
    });

    // Bulk create calculated records
    for (const rec of calculatedRecords) {
      await prisma.payrollRecord.create({
        data: {
          payrollRunId: payrollRun.id,
          employeeId: rec.employeeId,
          basicSalary: rec.basicSalary,
          earningsBreakdownJson: rec.earningsBreakdownJson,
          deductionsBreakdownJson: rec.deductionsBreakdownJson,
          grossSalary: rec.grossSalary,
          totalDeductions: rec.totalDeductions,
          netSalary: rec.netSalary,
          workingDays: rec.workingDays,
          presentDays: rec.presentDays,
          lopDays: rec.lopDays,
          lopDeduction: rec.lopDeduction,
          overtimeHours: rec.overtimeHours,
          overtimeAmount: rec.overtimeAmount,
          taxDeduction: rec.taxDeduction,
          pfDeduction: rec.pfDeduction,
        },
      });
    }

    await logAuditEvent({
      action: 'CALCULATE_PAYROLL',
      module: 'PAYROLL',
      recordId: payrollRun.id,
      recordName: `Payroll Run for Period ${periodMonth}/${periodYear}`,
      newValue: {
        month: periodMonth,
        year: periodYear,
        employees: employees.length,
        totalGross,
        totalNet,
      },
    });

    return NextResponse.json({
      success: true,
      payrollRun,
      message: `Successfully calculated payroll for ${employees.length} employees.`,
    });
  } catch (error: any) {
    console.error('Payroll calculation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
