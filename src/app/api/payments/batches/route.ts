import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const batches = await prisma.paymentBatch.findMany({
      include: {
        bankAccount: true,
        payrollRun: true,
        transactions: {
          take: 20,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, batches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
