import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { HDFCBankingAdapter, DisburseBeneficiary } from '@/lib/banking/hdfc-adapter';
import { ICICIbankingAdapter } from '@/lib/banking/icici-adapter';
import { HostToHostEngine } from '@/lib/banking/h2h-engine';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payrollRunId, bankAccountId, method } = body;

    const run = await prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
      include: {
        records: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!run) {
      return NextResponse.json({ success: false, error: 'Payroll run not found' }, { status: 404 });
    }

    if (run.status !== 'APPROVED' && run.status !== 'FINALIZED') {
      return NextResponse.json(
        { success: false, error: 'Payroll must be in APPROVED or FINALIZED status before triggering bank disbursements.' },
        { status: 400 }
      );
    }

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!bankAccount) {
      return NextResponse.json({ success: false, error: 'Corporate bank account not found' }, { status: 404 });
    }

    if (bankAccount.availableBalance < run.totalNet) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient corporate treasury balance. Required: ₹${run.totalNet.toLocaleString()}, Available: ₹${bankAccount.availableBalance.toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    const beneficiaries: DisburseBeneficiary[] = run.records.map((r) => ({
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

    const batchNumber = `BATCH-${run.periodYear}${String(run.periodMonth).padStart(2, '0')}-${bankAccount.bankCode}-${Date.now().toString().slice(-4)}`;

    let disburseResult: any;

    if (method === 'HDFC_API') {
      const hdfc = new HDFCBankingAdapter(bankAccount.corporateId || undefined, bankAccount.accountNumber);
      disburseResult = await hdfc.executeDirectAPIDisbursement(batchNumber, beneficiaries);
    } else if (method === 'ICICI_API') {
      const icici = new ICICIbankingAdapter(bankAccount.corporateId || undefined, bankAccount.accountNumber);
      disburseResult = await icici.executeCompositeAPIDisbursement(batchNumber, beneficiaries);
    } else {
      // H2H SFTP Automated Workflow
      const h2h = new HostToHostEngine();
      const nachFile = h2h.generateNACH306File(batchNumber, bankAccount.accountNumber, beneficiaries);
      
      // Simulate H2H immediate settlement with UTRs
      disburseResult = {
        success: true,
        batchReference: batchNumber,
        bankRefNumber: `H2H-SFTP-${Date.now().toString().slice(-8)}`,
        totalDisbursed: run.totalNet,
        transactions: beneficiaries.map((b, i) => ({
          payrollRecordId: b.payrollRecordId,
          beneficiaryName: b.name,
          accountNumber: b.accountNumber,
          ifscCode: b.ifscCode,
          amount: b.amount,
          paymentMode: 'NEFT' as const,
          utrNumber: `H2HUTR${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(Math.floor(10000000 + Math.random() * 90000000))}`,
          status: 'PAID' as const,
          responseCode: '00',
          responseMessage: 'Disbursed via Automated Corporate Host-to-Host SFTP Clearing Queue',
        })),
        h2hFileName: nachFile.fileName,
        h2hContent: nachFile.content,
      };
    }

    // 1. Create PaymentBatch Record
    const paymentBatch = await prisma.paymentBatch.create({
      data: {
        batchNumber,
        payrollRunId: run.id,
        bankAccountId: bankAccount.id,
        method: method || 'HDFC_API',
        totalAmount: run.totalNet,
        totalRecords: beneficiaries.length,
        successCount: disburseResult.transactions.length,
        status: 'SETTLED',
        bankRefNumber: disburseResult.bankRefNumber,
        settledAt: new Date(),
      },
    });

    // 2. Create PaymentTransaction Records & Update PayrollRecords
    for (const tx of disburseResult.transactions) {
      await prisma.paymentTransaction.create({
        data: {
          paymentBatchId: paymentBatch.id,
          payrollRecordId: tx.payrollRecordId,
          beneficiaryName: tx.beneficiaryName,
          accountNumber: tx.accountNumber,
          ifscCode: tx.ifscCode,
          bankName: bankAccount.bankName,
          amount: tx.amount,
          paymentMode: tx.paymentMode,
          utrNumber: tx.utrNumber,
          status: 'PAID',
          responseCode: tx.responseCode,
          responseMessage: tx.responseMessage,
          executedAt: new Date(),
        },
      });

      // Update Payroll Record
      await prisma.payrollRecord.update({
        where: { id: tx.payrollRecordId },
        data: {
          paymentStatus: 'PAID',
          paymentDate: new Date(),
          paymentReference: tx.utrNumber,
          paymentMethod: method,
        },
      });
    }

    // 3. Deduct from Corporate Bank Account Balance
    await prisma.bankAccount.update({
      where: { id: bankAccount.id },
      data: {
        availableBalance: bankAccount.availableBalance - run.totalNet,
      },
    });

    // 4. If H2H was generated, store the H2HFile
    if (disburseResult.h2hFileName) {
      await prisma.h2HFile.create({
        data: {
          paymentBatchId: paymentBatch.id,
          fileName: disburseResult.h2hFileName,
          fileFormat: 'NACH_306_TXT',
          fileSize: disburseResult.h2hContent.length,
          fileContent: disburseResult.h2hContent,
          status: 'RECONCILED',
          transmittedAt: new Date(),
        },
      });
    }

    await logAuditEvent({
      action: 'EXECUTE_PAYROLL_DISBURSEMENT',
      module: 'PAYMENTS',
      recordId: paymentBatch.id,
      recordName: `Batch ${batchNumber} via ${method} (Total ₹${run.totalNet})`,
      newValue: {
        batchNumber,
        bank: bankAccount.bankName,
        totalNet: run.totalNet,
        count: beneficiaries.length,
      },
    });

    return NextResponse.json({
      success: true,
      paymentBatch,
      disburseResult,
      message: `Successfully processed salary disbursement of ₹${run.totalNet.toLocaleString()} across ${beneficiaries.length} employee accounts via ${method}.`,
    });
  } catch (error: any) {
    console.error('Payment disburse error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
