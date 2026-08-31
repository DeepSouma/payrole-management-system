export interface ComponentItem {
  code: string;
  name: string;
  amount: number;
  type: 'EARNING' | 'DEDUCTION';
  isTaxable?: boolean;
}

export interface EmployeePayrollInput {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  designationTitle: string;
  departmentName: string;
  basicSalary: number;
  allowances: ComponentItem[];
  deductions: ComponentItem[];
  totalWorkingDays: number;
  presentDays: number;
  unpaidLeaves: number; // LOP
  overtimeHours: number;
  customBonus?: number;
  pfRate?: number; // default 12%
  taxRate?: number; // default 10%
}

export interface CalculatedPayrollItem {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  designationTitle: string;
  departmentName: string;
  basicSalary: number;
  workingDays: number;
  presentDays: number;
  lopDays: number;
  lopDeduction: number;
  overtimeHours: number;
  overtimeAmount: number;
  customBonus: number;
  earnings: ComponentItem[];
  deductions: ComponentItem[];
  grossSalary: number;
  pfDeduction: number;
  taxDeduction: number;
  totalDeductions: number;
  netSalary: number;
}

export function calculateEmployeePayroll(input: EmployeePayrollInput): CalculatedPayrollItem {
  const workingDays = input.totalWorkingDays > 0 ? input.totalWorkingDays : 30;
  const basic = Number(input.basicSalary) || 0;
  const lopDays = Math.max(0, Number(input.unpaidLeaves) || 0);
  const overtimeHours = Math.max(0, Number(input.overtimeHours) || 0);
  const customBonus = Math.max(0, Number(input.customBonus) || 0);

  // Daily & Hourly rates based on Basic Salary
  const dailyRate = workingDays > 0 ? basic / workingDays : 0;
  const hourlyRate = dailyRate / 8;

  // Overtime pay (1.5x standard hourly rate)
  const overtimeAmount = Math.round(overtimeHours * hourlyRate * 1.5 * 100) / 100;

  // LOP Deduction (deducted from Basic proportional to unpaid days)
  const lopDeduction = Math.round(lopDays * dailyRate * 100) / 100;

  // Compile Earnings Breakdown
  const earningsList: ComponentItem[] = [
    { code: 'BASIC', name: 'Basic Salary', amount: basic, type: 'EARNING', isTaxable: true },
  ];

  let totalAllowances = 0;
  for (const item of input.allowances || []) {
    const amt = Number(item.amount) || 0;
    totalAllowances += amt;
    earningsList.push({
      code: item.code,
      name: item.name,
      amount: amt,
      type: 'EARNING',
      isTaxable: item.isTaxable !== false,
    });
  }

  if (overtimeAmount > 0) {
    earningsList.push({
      code: 'OT',
      name: `Overtime Pay (${overtimeHours} hrs @ 1.5x)`,
      amount: overtimeAmount,
      type: 'EARNING',
      isTaxable: true,
    });
  }

  if (customBonus > 0) {
    earningsList.push({
      code: 'PERF_BONUS',
      name: 'Performance Bonus',
      amount: customBonus,
      type: 'EARNING',
      isTaxable: true,
    });
  }

  const grossSalary = Math.round((basic + totalAllowances + overtimeAmount + customBonus) * 100) / 100;

  // Deductions calculation
  const pfPercentage = input.pfRate !== undefined ? input.pfRate : 12.0;
  const pfDeduction = Math.round(((basic * pfPercentage) / 100) * 100) / 100;

  const deductionsList: ComponentItem[] = [];

  let standardDeductionsSum = 0;
  for (const item of input.deductions || []) {
    // Skip if PF or TDS is already in the list to avoid duplicate calculation
    if (item.code === 'PF' || item.code === 'TDS') continue;
    const amt = Number(item.amount) || 0;
    standardDeductionsSum += amt;
    deductionsList.push({
      code: item.code,
      name: item.name,
      amount: amt,
      type: 'DEDUCTION',
    });
  }

  // Statutory PF
  deductionsList.push({
    code: 'PF',
    name: `Provident Fund (${pfPercentage}%)`,
    amount: pfDeduction,
    type: 'DEDUCTION',
  });

  // Loss of Pay (LOP) deduction
  if (lopDeduction > 0) {
    deductionsList.push({
      code: 'LOP',
      name: `Loss of Pay (${lopDays} day${lopDays > 1 ? 's' : ''})`,
      amount: lopDeduction,
      type: 'DEDUCTION',
    });
  }

  // Tax (TDS) calculated on taxable earnings
  const taxPercentage = input.taxRate !== undefined ? input.taxRate : 10.0;
  const taxableBase = Math.max(0, grossSalary - lopDeduction);
  const taxDeduction = Math.round(((taxableBase * taxPercentage) / 100) * 100) / 100;

  deductionsList.push({
    code: 'TDS',
    name: `Income Tax TDS (${taxPercentage}%)`,
    amount: taxDeduction,
    type: 'DEDUCTION',
  });

  const totalDeductions = Math.round((standardDeductionsSum + pfDeduction + lopDeduction + taxDeduction) * 100) / 100;
  const netSalary = Math.max(0, Math.round((grossSalary - totalDeductions) * 100) / 100);

  return {
    employeeId: input.employeeId,
    employeeCode: input.employeeCode,
    employeeName: input.employeeName,
    designationTitle: input.designationTitle,
    departmentName: input.departmentName,
    basicSalary: basic,
    workingDays,
    presentDays: input.presentDays,
    lopDays,
    lopDeduction,
    overtimeHours,
    overtimeAmount,
    customBonus,
    earnings: earningsList,
    deductions: deductionsList,
    grossSalary,
    pfDeduction,
    taxDeduction,
    totalDeductions,
    netSalary,
  };
}
