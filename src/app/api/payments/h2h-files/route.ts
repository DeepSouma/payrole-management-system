import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { HDFCBankingAdapter } from '@/lib/banking/hdfc-adapter';
import { ICICIbankingAdapter } from '@/lib/banking/icici-adapter';
import { HostToHostEngine } from '@/lib/banking/h2h-engine';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const files = await prisma.h2HFile.findMany({
      include: {
        paymentBatch: {
          include: {
            bankAccount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payrollRunId, format, bankAccountId } = body;

    const run = await prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        records: {
          include: { employee: true },
        },
      },
    });

    if (!run) {
      return NextResponse.json({ success: false, error: 'Payroll run not found' }, { status: 404 });
    }

    const bankAccount = await prisma.bankAccount.findFirst({
      where: bankAccountId ? { id: bankAccountId } : undefined,
    });

    const debitAccount = bankAccount?.accountNumber || '50200099887711';
    const ifsc = bankAccount?.ifscCode || 'HDFC0000128';

    const beneficiaries = run.records.map((r) => ({
      payrollRecordId: r.id,
      employeeCode: r.employee.employeeCode,
      name: `${r.employee.firstName} ${r.employee.lastName}`,
      accountNumber: r.employee.accountNumber || '5010099887766',
      ifscCode: r.employee.ifscCode || 'HDFC0001234',
      bankName: r.employee.bankName || 'HDFC Bank',
      amount: r.netSalary,
      email: r.employee.email,
      phone: r.employee.phone || '9876543210',
    }));

    let fileResult: { fileName: string; content: string };

    if (format === 'HDFC_SUF_CSV') {
      const hdfc = new HDFCBankingAdapter(bankAccount?.corporateId || undefined, debitAccount);
      fileResult = hdfc.generateSUFFile(run.id, beneficiaries);
    } else if (format === 'ICICI_CIB_15COL') {
      const icici = new ICICIbankingAdapter(bankAccount?.corporateId || undefined, debitAccount);
      fileResult = icici.generateCIB15ColFile(run.id, beneficiaries);
    } else if (format === 'ISO_20022_XML') {
      const h2h = new HostToHostEngine();
      fileResult = h2h.generateISO20022XML(run.id, debitAccount, ifsc, beneficiaries);
    } else {
      // Default: NACH 306 TXT
      const h2h = new HostToHostEngine();
      fileResult = h2h.generateNACH306File(run.id, debitAccount, beneficiaries);
    }

    const h2hFile = await prisma.h2HFile.create({
      data: {
        fileName: fileResult.fileName,
        fileFormat: format || 'NACH_306_TXT',
        fileSize: fileResult.content.length,
        fileContent: fileResult.content,
        direction: 'INWARD_TO_BANK',
        status: 'READY',
      },
    });

    await logAuditEvent({
      action: 'GENERATE_H2H_FILE',
      module: 'PAYMENTS',
      recordId: h2hFile.id,
      recordName: `${h2hFile.fileName} (${format})`,
    });

    return NextResponse.json({
      success: true,
      file: h2hFile,
      fileName: fileResult.fileName,
      content: fileResult.content,
      message: `Successfully generated ${format} payment file for ${beneficiaries.length} employees.`,
    });
  } catch (error: any) {
    console.error('H2H file generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
