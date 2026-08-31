/**
 * ICICI Bank Corporate Internet Banking (CIB) API & 15-Column Bulk Salary File Adapter
 * Conforms to ICICI CIB Connected Banking specifications for Indian Corporate Payouts.
 */

import { DisburseBeneficiary } from './hdfc-adapter';

export interface ICICIDisburseResult {
  success: boolean;
  batchReference: string;
  bankRefNumber: string;
  totalDisbursed: number;
  transactions: Array<{
    payrollRecordId: string;
    beneficiaryName: string;
    accountNumber: string;
    ifscCode: string;
    amount: number;
    paymentMode: 'IFT' | 'NEFT' | 'RTGS' | 'IMPS';
    utrNumber: string;
    status: 'PAID' | 'FAILED';
    responseCode: string;
    responseMessage: string;
  }>;
}

export class ICICIbankingAdapter {
  corporateId: string;
  accountNumber: string;

  constructor(corporateId = 'ICICI_CORP_44321', accountNumber = '000405012345') {
    this.corporateId = corporateId;
    this.accountNumber = accountNumber;
  }

  /**
   * Generates ICICI 15-Column Standard Bulk Salary CSV File format
   * Conforms to ICICI CIB SFTP Host-to-Host specifications
   */
  generateCIB15ColFile(batchId: string, beneficiaries: DisburseBeneficiary[]): { fileName: string; content: string } {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `ICICI_CIB_SALARY_${batchId}_${dateStr}.csv`;

    const headers = [
      'TRAN_TYPE',
      'CORP_ACCOUNT_NO',
      'BEN_NAME',
      'BEN_ACCOUNT_NO',
      'BEN_IFSC',
      'AMOUNT',
      'CURRENCY',
      'PAYMENT_DATE',
      'REMARKS',
      'CUSTOM_REF',
      'EMAIL',
      'PHONE',
      'VALUE_DATE',
      'AUTH_FLAG',
      'HASH_CHECKSUM',
    ].join(',');

    const rows = beneficiaries.map((b, idx) => {
      const isInternal = b.ifscCode.toUpperCase().startsWith('ICIC');
      const tranType = isInternal ? 'WIB' : 'NEFT';
      const customRef = `ICIC-${batchId.slice(0, 8)}-${String(idx + 1).padStart(3, '0')}`;
      const checksum = `SHA256_${b.accountNumber.slice(-4)}_${b.amount}`;

      return [
        tranType,
        this.accountNumber,
        `"${b.name.replace(/"/g, '""')}"`,
        b.accountNumber,
        b.ifscCode,
        b.amount.toFixed(2),
        'INR',
        new Date().toLocaleDateString('en-GB'),
        'SALARY DISBURSEMENT',
        customRef,
        b.email || 'payroll@apex-innovations.io',
        b.phone || '9876543210',
        new Date().toLocaleDateString('en-GB'),
        'Y',
        checksum,
      ].join(',');
    });

    const content = [headers, ...rows].join('\r\n');
    return { fileName, content };
  }

  /**
   * Executes simulated ICICI Corporate Internet Banking Composite Payment API
   */
  async executeCompositeAPIDisbursement(
    batchNumber: string,
    beneficiaries: DisburseBeneficiary[]
  ): Promise<ICICIDisburseResult> {
    const timestamp = Date.now();
    const bankRefNumber = `ICICI-CIB-${timestamp.toString().slice(-8)}`;

    let total = 0;
    const transactions = beneficiaries.map((b) => {
      total += b.amount;
      const isInternal = b.ifscCode.toUpperCase().startsWith('ICIC');
      const paymentMode: 'IFT' | 'NEFT' | 'RTGS' | 'IMPS' = isInternal
        ? 'IFT'
        : b.amount > 200000
        ? 'RTGS'
        : 'NEFT';

      // Generate realistic RBI UTR number format for ICICI (e.g. ICICR52026082800098412)
      const utrPrefix = isInternal ? 'ICICBK' : 'ICICR5';
      const utrNumber = `${utrPrefix}${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(
        Math.floor(10000000 + Math.random() * 90000000)
      )}`;

      return {
        payrollRecordId: b.payrollRecordId,
        beneficiaryName: b.name,
        accountNumber: b.accountNumber,
        ifscCode: b.ifscCode,
        amount: b.amount,
        paymentMode,
        utrNumber,
        status: 'PAID' as const,
        responseCode: '00',
        responseMessage: 'Authorized and Disbursed via ICICI Connected Banking CIB Composite Gateway',
      };
    });

    return {
      success: true,
      batchReference: batchNumber,
      bankRefNumber,
      totalDisbursed: total,
      transactions,
    };
  }
}
