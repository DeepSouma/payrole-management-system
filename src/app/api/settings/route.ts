import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let setting = await prisma.organizationSetting.findFirst();
    if (!setting) {
      setting = await prisma.organizationSetting.create({
        data: {},
      });
    }
    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    let setting = await prisma.organizationSetting.findFirst();

    const previous = setting;

    if (!setting) {
      setting = await prisma.organizationSetting.create({
        data: {
          companyName: body.companyName,
          companyEmail: body.companyEmail,
          companyPhone: body.companyPhone,
          companyAddress: body.companyAddress,
          taxId: body.taxId,
          currencySymbol: body.currencySymbol,
          currencyCode: body.currencyCode,
          workingDaysPerMonth: Number(body.workingDaysPerMonth) || 30,
          payrollCutoffDay: Number(body.payrollCutoffDay) || 25,
          pfPercentage: Number(body.pfPercentage) || 12.0,
          defaultTaxRate: Number(body.defaultTaxRate) || 10.0,
        },
      });
    } else {
      setting = await prisma.organizationSetting.update({
        where: { id: setting.id },
        data: {
          companyName: body.companyName,
          companyEmail: body.companyEmail,
          companyPhone: body.companyPhone,
          companyAddress: body.companyAddress,
          taxId: body.taxId,
          currencySymbol: body.currencySymbol,
          currencyCode: body.currencyCode,
          workingDaysPerMonth: Number(body.workingDaysPerMonth) || 30,
          payrollCutoffDay: Number(body.payrollCutoffDay) || 25,
          pfPercentage: Number(body.pfPercentage) || 12.0,
          defaultTaxRate: Number(body.defaultTaxRate) || 10.0,
        },
      });
    }

    await logAuditEvent({
      action: 'UPDATE_ORGANIZATION_SETTINGS',
      module: 'SETTINGS',
      recordId: setting.id,
      recordName: setting.companyName,
      previousValue: previous,
      newValue: setting,
    });

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
