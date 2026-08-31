/**
 * HDFC Bank Corporate Banking API & E-CMS Salary Upload File (SUF) Adapter
 * Conforms to HDFC Corporate Banking & E-CMS specifications for India.
 */

export interface DisburseBeneficiary {
  employeeCode: string;
  name: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  amount: number;
  email: string;
  phone?: string;
  payrollRecordId: string;
}

export interface HDFCDisburseResult {
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

export class HDFCBankingAdapter {
  corporateId: string;
  accountNumber: string;

  constructor(corporateId = 'HDFC_CORP_998871', accountNumber = '50200099887711') {
    this.corporateId = corporateId;
    this.accountNumber = accountNumber;
  }

  /**
   * Generates HDFC E-CMS Bulk Salary Upload File (SUF) format
   * Standard CSV format consumed by HDFC E-CMS SFTP Host-to-Host gateway
   */
  generateSUFFile(batchId: string, beneficiaries: DisburseBeneficiary[]): { fileName: string; content: string } {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `HDFC_PAYROLL_SUF_${batchId}_${dateStr}.csv`;

    const header = 'REC_TYPE,BEN_CODE,DEBIT_ACC,BEN_ACC,AMOUNT,BEN_NAME,PAYMENT_MODE,BEN_IFSC,CORP_REF,EMAIL,MOBILE';
    const rows = beneficiaries.map((b, idx) => {
      const isInternal = b.ifscCode.toUpperCase().startsWith('HDFC');
      const mode = isInternal ? 'IFT' : b.amount > 200000 ? 'RTGS' : 'NEFT';
      const corpRef = `REF-${batchId.slice(0, 8)}-${String(idx + 1).padStart(3, '0')}`;
      return [
        'D', // Detail record
        b.employeeCode,
        this.accountNumber,
        b.accountNumber,
        b.amount.toFixed(2),
        `"${b.name.replace(/"/g, '""')}"`,
        mode,
        b.ifscCode,
        corpRef,
        b.email || 'payroll@apex-innovations.io',
        b.phone || '9876543210',
      ].join(',');
    });

    const content = [header, ...rows].join('\r\n');
    return { fileName, content };
  }

  /**
   * Executes simulated Real-Time Corporate Direct API Salary Batch Payout
   */
  async executeDirectAPIDisbursement(
    batchNumber: string,
    beneficiaries: DisburseBeneficiary[]
  ): Promise<HDFCDisburseResult> {
    const timestamp = Date.now();
    const bankRefNumber = `HDFC-PAY-${timestamp.toString().slice(-8)}`;

    let total = 0;
    const transactions = beneficiaries.map((b, index) => {
      total += b.amount;
      const isInternal = b.ifscCode.toUpperCase().startsWith('HDFC');
      const paymentMode: 'IFT' | 'NEFT' | 'RTGS' | 'IMPS' = isInternal
        ? 'IFT'
        : b.amount > 200000
        ? 'RTGS'
        : 'NEFT';

      // Generate realistic RBI UTR number format for HDFC (e.g. HDFCR52026082800019284)
      const utrPrefix = isInternal ? 'HDFCBK' : 'HDFCR5';
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
        responseMessage: 'Transaction Processed Successfully via HDFC SmartHub Corporate Core Gateway',
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
