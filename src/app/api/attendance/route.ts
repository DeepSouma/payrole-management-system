import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || '8', 10);
    const year = parseInt(searchParams.get('year') || '2026', 10);

    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      include: {
        department: true,
        designation: true,
        attendanceRecords: {
          where: { month, year },
        },
      },
      orderBy: { employeeCode: 'asc' },
    });

    const records = employees.map((emp) => {
      const att = emp.attendanceRecords[0];
      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department.name,
        designation: emp.designation.title,
        month,
        year,
        totalWorkingDays: att?.totalWorkingDays ?? 30,
        presentDays: att?.presentDays ?? 30,
        absentDays: att?.absentDays ?? 0,
        paidLeaves: att?.paidLeaves ?? 0,
        unpaidLeaves: att?.unpaidLeaves ?? 0,
        overtimeHours: att?.overtimeHours ?? 0,
        holidays: att?.holidays ?? 0,
        remarks: att?.remarks ?? '',
        id: att?.id ?? null,
      };
    });

    return NextResponse.json({ success: true, records, month, year });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { month, year, records } = body;

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (!Array.isArray(records)) {
      return NextResponse.json({ success: false, error: 'Records must be an array' }, { status: 400 });
    }

    const updated = [];
    for (const item of records) {
      const totalWorkingDays = Number(item.totalWorkingDays) || 30;
      const presentDays = Number(item.presentDays) || 0;
      const unpaidLeaves = Number(item.unpaidLeaves) || 0;
      const paidLeaves = Number(item.paidLeaves) || 0;
      const overtimeHours = Number(item.overtimeHours) || 0;
      const absentDays = Math.max(0, totalWorkingDays - presentDays - paidLeaves);

      const record = await prisma.attendanceRecord.upsert({
        where: {
          employeeId_month_year: {
            employeeId: item.employeeId,
            month: parsedMonth,
            year: parsedYear,
          },
        },
        update: {
          totalWorkingDays,
          presentDays,
          absentDays,
          paidLeaves,
          unpaidLeaves,
          overtimeHours,
          remarks: item.remarks || '',
        },
        create: {
          employeeId: item.employeeId,
          month: parsedMonth,
          year: parsedYear,
          totalWorkingDays,
          presentDays,
          absentDays,
          paidLeaves,
          unpaidLeaves,
          overtimeHours,
          remarks: item.remarks || '',
        },
      });
      updated.push(record);
    }

    await logAuditEvent({
      action: 'UPDATE_ATTENDANCE_BULK',
      module: 'ATTENDANCE',
      recordName: `Month ${parsedMonth}/${parsedYear} - ${updated.length} employees`,
      newValue: { count: updated.length, month: parsedMonth, year: parsedYear },
    });

    return NextResponse.json({ success: true, count: updated.length, records: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
