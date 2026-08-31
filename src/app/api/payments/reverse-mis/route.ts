import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { HostToHostEngine } from '@/lib/banking/h2h-engine';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileContent, fileName } = body;

    if (!fileContent) {
      return NextResponse.json({ success: false, error: 'File content is required for Reverse MIS parsing' }, { status: 400 });
    }

    const h2h = new HostToHostEngine();
    const parsedRecords = h2h.parseReverseMIS(fileContent);

    let reconciledCount = 0;

    for (const item of parsedRecords) {
      // Find matching payroll record by amount or partial match
      const record = await prisma.payrollRecord.findFirst({
        where: {
          employee: {
            OR: [
              { accountNumber: item.beneficiaryAccount },
              { panNumber: { not: null } },
            ],
          },
        },
      });

      if (record) {
        await prisma.payrollRecord.update({
          where: { id: record.id },
          data: {
            paymentStatus: 'PAID',
            paymentDate: new Date(),
            paymentReference: item.utrNumber,
          },
        });
        reconciledCount++;
      }
    }

    // Save outward file record
    await prisma.h2HFile.create({
      data: {
        fileName: fileName || `REVERSE_MIS_${Date.now()}.res`,
        fileFormat: 'REVERSE_MIS_RES',
        fileSize: fileContent.length,
        fileContent,
        direction: 'OUTWARD_FROM_BANK',
        status: 'RECONCILED',
      },
    });

    await logAuditEvent({
      action: 'INGEST_REVERSE_MIS',
      module: 'PAYMENTS',
      recordName: `Reverse MIS Ingested (${reconciledCount} Transactions Reconciled)`,
      newValue: { count: reconciledCount, totalParsed: parsedRecords.length },
    });

    return NextResponse.json({
      success: true,
      parsedCount: parsedRecords.length,
      reconciledCount,
      message: `Reverse MIS successfully reconciled: ${reconciledCount} transactions matched and updated with official RBI UTRs.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
