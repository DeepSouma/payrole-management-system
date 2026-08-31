import { PrismaClient, UserRole, EmploymentType, EmployeeStatus, ComponentType, CalculationType, PayrollStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Payroll Management System...');

  // 1. Clean existing records in reverse dependency order
  await prisma.h2HFile.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.paymentBatch.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.payrollRecord.deleteMany();
  await prisma.payrollRun.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.employeeSalaryAssignment.deleteMany();
  await prisma.salaryStructureItem.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.salaryComponent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.designation.deleteMany();
  await prisma.department.deleteMany();
  await prisma.organizationSetting.deleteMany();

  // 1.1 Seed Corporate Bank Accounts
  await prisma.bankAccount.create({
    data: {
      bankName: 'HDFC Bank Ltd.',
      bankCode: 'HDFC',
      accountName: 'Apex Innovations Corp - Corporate Payroll Pool',
      accountNumber: '50200099887711',
      ifscCode: 'HDFC0000128',
      branchName: 'Indiranagar 100ft Road Branch, Bangalore',
      accountType: 'CURRENT_CORPORATE',
      availableBalance: 15000000,
      corporateId: 'HDFC_CORP_998871',
      clientId: 'HDFC_API_CLIENT_PROD',
      sftpHost: 'sftp.hdfcbank.com',
      sftpUsername: 'sftp_apex_h2h',
      status: 'ACTIVE',
    },
  });

  await prisma.bankAccount.create({
    data: {
      bankName: 'ICICI Bank Ltd.',
      bankCode: 'ICICI',
      accountName: 'Apex Innovations Corp - Connected Banking CIB',
      accountNumber: '000405012345',
      ifscCode: 'ICIC0000004',
      branchName: 'Koramangala Commercial Branch, Bangalore',
      accountType: 'CURRENT_CORPORATE',
      availableBalance: 8500000,
      corporateId: 'ICICI_CIB_44321',
      clientId: 'ICICI_CONNECTED_CLIENT',
      sftpHost: 'cibsftp.icicibank.com',
      sftpUsername: 'icici_sftp_user',
      status: 'ACTIVE',
    },
  });

  // 2. Organization Settings
  await prisma.organizationSetting.create({
    data: {
      companyName: 'Apex Innovations Corp.',
      companyEmail: 'payroll@apex-innovations.io',
      companyPhone: '+91 80 4123 9900',
      companyAddress: 'Plot 42, Silicon Valley Tech Zone, Bangalore, Karnataka 560100',
      taxId: 'GSTIN29AAAAA0000A1Z5',
      currencySymbol: '₹',
      currencyCode: 'INR',
      workingDaysPerMonth: 30,
      payrollCutoffDay: 25,
      pfPercentage: 12.0,
      defaultTaxRate: 10.0,
    },
  });

  // 3. Departments
  const deptEngineering = await prisma.department.create({
    data: { code: 'ENG', name: 'Engineering & Technology', description: 'Core software development, DevOps & infrastructure' },
  });
  const deptProduct = await prisma.department.create({
    data: { code: 'PROD', name: 'Product & Design', description: 'Product strategy, UI/UX design, research' },
  });
  const deptHR = await prisma.department.create({
    data: { code: 'HR', name: 'Human Resources', description: 'Talent acquisition, employee relations, payroll' },
  });
  const deptFinance = await prisma.department.create({
    data: { code: 'FIN', name: 'Finance & Accounts', description: 'Financial planning, accounting, tax audits' },
  });

  // 4. Designations
  const desigVPEng = await prisma.designation.create({
    data: { code: 'VP-ENG', title: 'VP of Engineering', departmentId: deptEngineering.id, minSalary: 180000, maxSalary: 350000 },
  });
  const desigSrBackend = await prisma.designation.create({
    data: { code: 'SR-BE', title: 'Senior Backend Engineer', departmentId: deptEngineering.id, minSalary: 100000, maxSalary: 180000 },
  });
  const desigFrontendLead = await prisma.designation.create({
    data: { code: 'FE-LEAD', title: 'Lead Frontend Architect', departmentId: deptEngineering.id, minSalary: 120000, maxSalary: 200000 },
  });
  const desigProductMgr = await prisma.designation.create({
    data: { code: 'PM-01', title: 'Senior Product Manager', departmentId: deptProduct.id, minSalary: 110000, maxSalary: 190000 },
  });
  const desigHRLead = await prisma.designation.create({
    data: { code: 'HR-LEAD', title: 'HR & Payroll Lead', departmentId: deptHR.id, minSalary: 75000, maxSalary: 130000 },
  });
  const desigFinanceAnalyst = await prisma.designation.create({
    data: { code: 'FIN-ANL', title: 'Senior Financial Analyst', departmentId: deptFinance.id, minSalary: 70000, maxSalary: 120000 },
  });

  // 5. Employees
  const empManager = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-001',
      firstName: 'Vikram',
      lastName: 'Aditya',
      email: 'vikram.aditya@apex-innovations.io',
      phone: '+91 98765 43210',
      dateOfBirth: new Date('1985-04-12'),
      gender: 'Male',
      address: 'Indiranagar 100ft Road, Bangalore',
      departmentId: deptEngineering.id,
      designationId: desigVPEng.id,
      joiningDate: new Date('2021-01-15'),
      employmentType: EmploymentType.FULL_TIME,
      status: EmployeeStatus.ACTIVE,
      panNumber: 'ABCDE1234F',
      bankName: 'HDFC Bank',
      accountNumber: '50100234567890',
      ifscCode: 'HDFC0001234',
    },
  });

  const empPayrollAdmin = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-002',
      firstName: 'Ananya',
      lastName: 'Sharma',
      email: 'ananya.sharma@apex-innovations.io',
      phone: '+91 98450 11223',
      dateOfBirth: new Date('1990-08-22'),
      gender: 'Female',
      address: 'Koramangala 4th Block, Bangalore',
      departmentId: deptHR.id,
      designationId: desigHRLead.id,
      joiningDate: new Date('2022-03-01'),
      employmentType: EmploymentType.FULL_TIME,
      status: EmployeeStatus.ACTIVE,
      reportingManagerId: empManager.id,
      panNumber: 'BNMKL9876Q',
      bankName: 'ICICI Bank',
      accountNumber: '102938475601',
      ifscCode: 'ICIC0000456',
    },
  });

  const empDev1 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-003',
      firstName: 'Rahul',
      lastName: 'Verma',
      email: 'rahul.verma@apex-innovations.io',
      phone: '+91 97112 33445',
      dateOfBirth: new Date('1994-11-05'),
      gender: 'Male',
      address: 'HSR Layout Sector 2, Bangalore',
      departmentId: deptEngineering.id,
      designationId: desigFrontendLead.id,
      joiningDate: new Date('2022-06-15'),
      employmentType: EmploymentType.FULL_TIME,
      status: EmployeeStatus.ACTIVE,
      reportingManagerId: empManager.id,
      panNumber: 'FGHIJ5678K',
      bankName: 'Axis Bank',
      accountNumber: '918010045678912',
      ifscCode: 'UTIB0000789',
    },
  });

  const empDev2 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-004',
      firstName: 'Priya',
      lastName: 'Nair',
      email: 'priya.nair@apex-innovations.io',
      phone: '+91 96321 88990',
      dateOfBirth: new Date('1996-02-18'),
      gender: 'Female',
      address: 'Whitefield Main Road, Bangalore',
      departmentId: deptEngineering.id,
      designationId: desigSrBackend.id,
      joiningDate: new Date('2023-01-10'),
      employmentType: EmploymentType.FULL_TIME,
      status: EmployeeStatus.ACTIVE,
      reportingManagerId: empManager.id,
      panNumber: 'ZXCVB3456P',
      bankName: 'State Bank of India',
      accountNumber: '30987654321',
      ifscCode: 'SBIN0001542',
    },
  });

  const empPM = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-005',
      firstName: 'Arjun',
      lastName: 'Kapoor',
      email: 'arjun.kapoor@apex-innovations.io',
      phone: '+91 95432 10987',
      dateOfBirth: new Date('1992-07-30'),
      gender: 'Male',
      address: 'MG Road, Residency Cross, Bangalore',
      departmentId: deptProduct.id,
      designationId: desigProductMgr.id,
      joiningDate: new Date('2022-09-01'),
      employmentType: EmploymentType.FULL_TIME,
      status: EmployeeStatus.ACTIVE,
      reportingManagerId: empManager.id,
      panNumber: 'LKJHG8765M',
      bankName: 'Kotak Mahindra Bank',
      accountNumber: '7712349876',
      ifscCode: 'KKBK0000123',
    },
  });

  const empFin = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-006',
      firstName: 'Sneha',
      lastName: 'Rao',
      email: 'sneha.rao@apex-innovations.io',
      phone: '+91 94488 22334',
      dateOfBirth: new Date('1995-05-14'),
      gender: 'Female',
      address: 'Jayanagar 5th Block, Bangalore',
      departmentId: deptFinance.id,
      designationId: desigFinanceAnalyst.id,
      joiningDate: new Date('2023-05-20'),
      employmentType: EmploymentType.FULL_TIME,
      status: EmployeeStatus.ACTIVE,
      reportingManagerId: empManager.id,
      panNumber: 'QWERT6543Z',
      bankName: 'HDFC Bank',
      accountNumber: '50100987654321',
      ifscCode: 'HDFC0001234',
    },
  });

  // 6. Users for Authentication & RBAC
  const passwordHash = await bcrypt.hash('password123', 10);

  // Super Admin
  await prisma.user.create({
    data: {
      email: 'admin@apex-innovations.io',
      name: 'Super Admin (System)',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Payroll Admin User
  const userPayrollAdmin = await prisma.user.create({
    data: {
      email: 'payroll.admin@apex-innovations.io',
      name: 'Ananya Sharma (Payroll Admin)',
      passwordHash,
      role: UserRole.PAYROLL_ADMIN,
      employeeId: empPayrollAdmin.id,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Manager / Approver User
  const userManager = await prisma.user.create({
    data: {
      email: 'manager@apex-innovations.io',
      name: 'Vikram Aditya (VP Eng / Approver)',
      passwordHash,
      role: UserRole.MANAGER,
      employeeId: empManager.id,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Regular Employee User
  await prisma.user.create({
    data: {
      email: 'rahul.verma@apex-innovations.io',
      name: 'Rahul Verma (Employee)',
      passwordHash,
      role: UserRole.EMPLOYEE,
      employeeId: empDev1.id,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 7. Salary Components
  const compBasic = await prisma.salaryComponent.create({
    data: { name: 'Basic Salary', code: 'BASIC', type: ComponentType.EARNING, calculationType: CalculationType.FIXED, isTaxable: true, isMandatory: true, description: 'Core basic monthly earnings' },
  });
  const compHRA = await prisma.salaryComponent.create({
    data: { name: 'House Rent Allowance', code: 'HRA', type: ComponentType.EARNING, calculationType: CalculationType.PERCENTAGE_OF_BASIC, percentageValue: 50.0, isTaxable: true, isMandatory: true, description: '50% of Basic Pay for rent assistance' },
  });
  const compTransport = await prisma.salaryComponent.create({
    data: { name: 'Transport Allowance', code: 'TRA', type: ComponentType.EARNING, calculationType: CalculationType.FIXED, defaultAmount: 4000, isTaxable: false, isMandatory: false, description: 'Commute and conveyance allowance' },
  });
  const compSpecial = await prisma.salaryComponent.create({
    data: { name: 'Special Allowance', code: 'SPL', type: ComponentType.EARNING, calculationType: CalculationType.FIXED, defaultAmount: 15000, isTaxable: true, isMandatory: false, description: 'Flexible organizational compensation' },
  });
  const compMedical = await prisma.salaryComponent.create({
    data: { name: 'Medical Allowance', code: 'MED', type: ComponentType.EARNING, calculationType: CalculationType.FIXED, defaultAmount: 2500, isTaxable: false, isMandatory: false, description: 'Medical expenses reimbursement allowance' },
  });
  const compBonus = await prisma.salaryComponent.create({
    data: { name: 'Performance Bonus', code: 'BONUS', type: ComponentType.EARNING, calculationType: CalculationType.FIXED, defaultAmount: 0, isTaxable: true, isMandatory: false, description: 'Variable monthly performance incentives' },
  });

  // Deductions
  const compPF = await prisma.salaryComponent.create({
    data: { name: 'Provident Fund (PF)', code: 'PF', type: ComponentType.DEDUCTION, calculationType: CalculationType.PERCENTAGE_OF_BASIC, percentageValue: 12.0, isTaxable: false, isMandatory: true, description: '12% statutory PF contribution' },
  });
  const compTDS = await prisma.salaryComponent.create({
    data: { name: 'Income Tax (TDS)', code: 'TDS', type: ComponentType.DEDUCTION, calculationType: CalculationType.PERCENTAGE_OF_GROSS, percentageValue: 10.0, isTaxable: false, isMandatory: true, description: 'Tax deducted at source based on tax bracket' },
  });
  const compInsurance = await prisma.salaryComponent.create({
    data: { name: 'Group Health Insurance', code: 'INS', type: ComponentType.DEDUCTION, calculationType: CalculationType.FIXED, defaultAmount: 1500, isTaxable: false, isMandatory: false, description: 'Family medical cover premium deduction' },
  });
  const compProfTax = await prisma.salaryComponent.create({
    data: { name: 'Professional Tax', code: 'PT', type: ComponentType.DEDUCTION, calculationType: CalculationType.FIXED, defaultAmount: 200, isTaxable: false, isMandatory: true, description: 'State professional statutory levy' },
  });

  // 8. Salary Structures
  const structExec = await prisma.salaryStructure.create({
    data: {
      name: 'Executive Leadership Grade (L6)',
      code: 'EXEC-L6',
      description: 'Standard executive remuneration package for VP and Director tiers',
      items: {
        create: [
          { componentId: compBasic.id, type: ComponentType.EARNING, calculationType: CalculationType.FIXED, value: 120000 },
          { componentId: compHRA.id, type: ComponentType.EARNING, calculationType: CalculationType.PERCENTAGE_OF_BASIC, value: 50.0 },
          { componentId: compTransport.id, type: ComponentType.EARNING, calculationType: CalculationType.FIXED, value: 8000 },
          { componentId: compSpecial.id, type: ComponentType.EARNING, calculationType: CalculationType.FIXED, value: 35000 },
          { componentId: compMedical.id, type: ComponentType.EARNING, calculationType: CalculationType.FIXED, value: 5000 },
          { componentId: compPF.id, type: ComponentType.DEDUCTION, calculationType: CalculationType.PERCENTAGE_OF_BASIC, value: 12.0 },
          { componentId: compTDS.id, type: ComponentType.DEDUCTION, calculationType: CalculationType.PERCENTAGE_OF_GROSS, value: 15.0 },
          { componentId: compInsurance.id, type: ComponentType.DEDUCTION, calculationType: CalculationType.FIXED, value: 2500 },
          { componentId: compProfTax.id, type: ComponentType.DEDUCTION, calculationType: CalculationType.FIXED, value: 200 },
        ],
      },
    },
  });

  const structSeniorEng = await prisma.salaryStructure.create({
    data: {
      name: 'Senior Engineering & Lead Grade (L4-L5)',
      code: 'SR-ENG-L4',
      description: 'Standard package for Staff, Lead, and Senior Engineers',
      items: {
        create: [
          { componentId: compBasic.id, type: ComponentType.EARNING, calculationType: CalculationType.FIXED, value: 65000 },
          { componentId: compHRA.id, type: ComponentType.EARNING, calculationType: CalculationType.PERCENTAGE_OF_BASIC, value: 50.0 },
          { componentId: compTransport.id, type: ComponentType.EARNING, calculationType: CalculationType.FIXED, value: 4000 },
          { componentId: compSpecial.id, type: ComponentType.EARNING, calculationType: CalculationType.FIXED, value: 18000 },
          { componentId: compMedical.id, type: ComponentType.EARNING, calculationType: CalculationType.FIXED, value: 3000 },
          { componentId: compPF.id, type: ComponentType.DEDUCTION, calculationType: CalculationType.PERCENTAGE_OF_BASIC, value: 12.0 },
          { componentId: compTDS.id, type: ComponentType.DEDUCTION, calculationType: CalculationType.PERCENTAGE_OF_GROSS, value: 10.0 },
          { componentId: compInsurance.id, type: ComponentType.DEDUCTION, calculationType: CalculationType.FIXED, value: 1500 },
          { componentId: compProfTax.id, type: ComponentType.DEDUCTION, calculationType: CalculationType.FIXED, value: 200 },
        ],
      },
    },
  });

  const structAssociate = await prisma.salaryStructure.create({
    data: {
      name: 'Professional & Specialist Grade (L2-L3)',
      code: 'PROF-L2',
      description: 'Standard package for HR, Finance, and Mid-level professionals',
      items: {
        create: [
          { componentId: compBasic.id, type: ComponentType.EARNING, calculationType: CalculationType.FIXED, value: 42000 },
          { componentId: compHRA.id, type: ComponentType.EARNING, calculationType: CalculationType.PERCENTAGE_OF_BASIC, value: 50.0 },
          { componentId: compTransport.id, type: ComponentType.EARNING, calculationType: CalculationType.FIXED, value: 3000 },
          { componentId: compSpecial.id, type: ComponentType.EARNING, calculationType: CalculationType.FIXED, value: 10000 },
          { componentId: compMedical.id, type: ComponentType.EARNING, calculationType: CalculationType.FIXED, value: 2000 },
          { componentId: compPF.id, type: ComponentType.DEDUCTION, calculationType: CalculationType.PERCENTAGE_OF_BASIC, value: 12.0 },
          { componentId: compTDS.id, type: ComponentType.DEDUCTION, calculationType: CalculationType.PERCENTAGE_OF_GROSS, value: 8.0 },
          { componentId: compInsurance.id, type: ComponentType.DEDUCTION, calculationType: CalculationType.FIXED, value: 1200 },
          { componentId: compProfTax.id, type: ComponentType.DEDUCTION, calculationType: CalculationType.FIXED, value: 200 },
        ],
      },
    },
  });

  // 9. Assign Salaries to Employees
  const employeesList = [
    { emp: empManager, struct: structExec, basic: 120000 },
    { emp: empPayrollAdmin, struct: structAssociate, basic: 45000 },
    { emp: empDev1, struct: structSeniorEng, basic: 70000 },
    { emp: empDev2, struct: structSeniorEng, basic: 62000 },
    { emp: empPM, struct: structSeniorEng, basic: 68000 },
    { emp: empFin, struct: structAssociate, basic: 40000 },
  ];

  for (const item of employeesList) {
    await prisma.employeeSalaryAssignment.create({
      data: {
        employeeId: item.emp.id,
        salaryStructureId: item.struct.id,
        basicSalary: item.basic,
        allowancesJson: JSON.stringify([
          { code: 'HRA', name: 'House Rent Allowance', amount: item.basic * 0.5 },
          { code: 'TRA', name: 'Transport Allowance', amount: 4000 },
          { code: 'SPL', name: 'Special Allowance', amount: 15000 },
          { code: 'MED', name: 'Medical Allowance', amount: 2500 },
        ]),
        deductionsJson: JSON.stringify([
          { code: 'PF', name: 'Provident Fund (PF)', amount: item.basic * 0.12 },
          { code: 'TDS', name: 'Income Tax (TDS)', amount: (item.basic * 1.5 + 21500) * 0.1 },
          { code: 'INS', name: 'Health Insurance', amount: 1500 },
          { code: 'PT', name: 'Professional Tax', amount: 200 },
        ]),
        effectiveFrom: new Date('2024-01-01'),
        status: 'ACTIVE',
        remarks: 'Initial onboarding salary configuration',
      },
    });
  }

  // 10. Attendance Records for current month (e.g. Month 8, 2026) and previous month (Month 7, 2026)
  const currentMonth = 8;
  const currentYear = 2026;

  const attendanceData = [
    { emp: empManager, present: 30, lop: 0, ot: 0, remarks: 'Full attendance' },
    { emp: empPayrollAdmin, present: 29, lop: 1, ot: 4, remarks: '1 day sick leave (unpaid)' },
    { emp: empDev1, present: 28, lop: 2, ot: 10, remarks: '2 days LOP, 10 hrs critical deployment OT' },
    { emp: empDev2, present: 30, lop: 0, ot: 6, remarks: '6 hrs sprint delivery OT' },
    { emp: empPM, present: 30, lop: 0, ot: 0, remarks: 'Full attendance' },
    { emp: empFin, present: 29, lop: 1, ot: 2, remarks: '1 day personal emergency LOP' },
  ];

  for (const att of attendanceData) {
    await prisma.attendanceRecord.create({
      data: {
        employeeId: att.emp.id,
        month: currentMonth,
        year: currentYear,
        totalWorkingDays: 30,
        presentDays: att.present,
        absentDays: 30 - att.present,
        paidLeaves: 0,
        unpaidLeaves: att.lop,
        overtimeHours: att.ot,
        holidays: 0,
        remarks: att.remarks,
      },
    });
  }

  // 11. Initial Audit Log Entry
  await prisma.auditLog.create({
    data: {
      userId: userPayrollAdmin.id,
      userName: 'Ananya Sharma',
      action: 'SYSTEM_INITIALIZATION',
      module: 'CORE',
      recordName: 'System Setup & Baseline Database Seed',
      newValueJson: JSON.stringify({ status: 'SUCCESS', employees: 6, structures: 3 }),
    },
  });

  console.log('✅ Payroll Management System Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
