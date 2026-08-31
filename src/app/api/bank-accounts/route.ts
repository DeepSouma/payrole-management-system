import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bankAccounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, bankAccounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bankName, bankCode, accountName, accountNumber, ifscCode, branchName, availableBalance, corporateId, sftpHost, sftpUsername } = body;

    const account = await prisma.bankAccount.create({
      data: {
        bankName,
        bankCode: bankCode.toUpperCase(),
        accountName,
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        branchName,
        availableBalance: Number(availableBalance) || 5000000,
        corporateId,
        sftpHost: sftpHost || 'sftp.bankgateway.com',
        sftpUsername,
      },
    });

    await logAuditEvent({
      action: 'ADD_CORPORATE_BANK_ACCOUNT',
      module: 'PAYMENTS',
      recordId: account.id,
      recordName: `${account.bankName} (${account.accountNumber})`,
      newValue: account,
    });

    return NextResponse.json({ success: true, bankAccount: account });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
