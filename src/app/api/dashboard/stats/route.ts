import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalEmployees = await prisma.employee.count();
    const activeEmployees = await prisma.employee.count({
      where: { status: 'ACTIVE' },
    });

    const pendingApprovalsCount = await prisma.payrollRun.count({
      where: { status: 'UNDER_REVIEW' },
    });

    const latestFinalizedRun = await prisma.payrollRun.findFirst({
      where: {
        status: { in: ['APPROVED', 'FINALIZED'] },
      },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    });

    const recentRuns = await prisma.payrollRun.findMany({
      take: 5,
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
      include: {
        processedBy: { select: { name: true, email: true } },
        approvedBy: { select: { name: true, email: true } },
      },
    });

    const departments = await prisma.department.findMany({
      include: {
        employees: {
          include: {
            salaryAssignments: {
              where: { status: 'ACTIVE' },
              take: 1,
            },
          },
        },
      },
    });

    const departmentStats = departments.map((dept) => {
      const empCount = dept.employees.length;
      const totalDeptCost = dept.employees.reduce((acc, emp) => {
        const assignment = emp.salaryAssignments[0];
        return acc + (assignment?.basicSalary ? assignment.basicSalary * 1.5 : 0);
      }, 0);
      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        employeeCount: empCount,
        estimatedMonthlyCost: Math.round(totalDeptCost),
      };
    });

    const settings = await prisma.organizationSetting.findFirst();

    return NextResponse.json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        pendingApprovalsCount,
        latestPayroll: {
          month: latestFinalizedRun?.periodMonth || 8,
          year: latestFinalizedRun?.periodYear || 2026,
          totalGross: latestFinalizedRun?.totalGross || 0,
          totalDeductions: latestFinalizedRun?.totalDeductions || 0,
          totalNet: latestFinalizedRun?.totalNet || 0,
          status: latestFinalizedRun?.status || 'NOT_STARTED',
        },
      },
      departmentStats,
      recentRuns,
      settings,
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load dashboard statistics' },
      { status: 500 }
    );
  }
}
