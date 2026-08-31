import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'monthly-summary';
    const month = parseInt(searchParams.get('month') || '8', 10);
    const year = parseInt(searchParams.get('year') || '2026', 10);

    if (type === 'monthly-summary') {
      const runs = await prisma.payrollRun.findMany({
        include: {
          processedBy: { select: { name: true } },
          approvedBy: { select: { name: true } },
        },
        orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
      });
      return NextResponse.json({ success: true, type, data: runs });
    }

    if (type === 'department-cost') {
      const departments = await prisma.department.findMany({
        include: {
          employees: {
            include: {
              payrollRecords: {
                where: {
                  payrollRun: { periodMonth: month, periodYear: year },
                },
              },
            },
          },
        },
      });

      const report = departments.map((dept) => {
        let gross = 0;
        let deductions = 0;
        let net = 0;
        let count = 0;

        for (const emp of dept.employees) {
          const rec = emp.payrollRecords[0];
          if (rec) {
            count++;
            gross += rec.grossSalary;
            deductions += rec.totalDeductions;
            net += rec.netSalary;
          }
        }

        return {
          departmentId: dept.id,
          departmentName: dept.name,
          departmentCode: dept.code,
          employeeCount: dept.employees.length,
          processedEmployees: count,
          totalGross: Math.round(gross * 100) / 100,
          totalDeductions: Math.round(deductions * 100) / 100,
          totalNet: Math.round(net * 100) / 100,
        };
      });

      return NextResponse.json({ success: true, type, data: report, month, year });
    }

    if (type === 'tax-pf-summary') {
      const records = await prisma.payrollRecord.findMany({
        where: {
          payrollRun: { periodMonth: month, periodYear: year },
        },
        include: {
          employee: {
            include: { department: true, designation: true },
          },
        },
      });

      let totalTax = 0;
      let totalPF = 0;
      let totalGross = 0;

      const items = records.map((r) => {
        totalTax += r.taxDeduction;
        totalPF += r.pfDeduction;
        totalGross += r.grossSalary;

        return {
          employeeCode: r.employee.employeeCode,
          employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
          panNumber: r.employee.panNumber || 'N/A',
          grossSalary: r.grossSalary,
          pfDeduction: r.pfDeduction,
          taxDeduction: r.taxDeduction,
          netSalary: r.netSalary,
        };
      });

      return NextResponse.json({
        success: true,
        type,
        month,
        year,
        summary: {
          totalGross: Math.round(totalGross * 100) / 100,
          totalTax: Math.round(totalTax * 100) / 100,
          totalPF: Math.round(totalPF * 100) / 100,
        },
        items,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown report type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
