'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Users,
  Plus,
  Eye,
  Edit2,
  Sliders,
  Building2,
  Calendar,
  X,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import {
  useEmployees,
  useEmployeeDetails,
  useCreateEmployee,
  useUpdateEmployee,
  useDepartments,
  useDesignations,
  useSalaryStructures,
  useAssignSalary,
} from '@/hooks/use-payroll-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

export default function EmployeesPage() {
  const { canManageEmployees } = useAuth();
  const { data: empData, isLoading } = useEmployees();
  const { data: deptData } = useDepartments();
  const { data: desigData } = useDesignations();
  const { data: structData } = useSalaryStructures();

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const assignSalaryMutation = useAssignSalary();

  // Modals state
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);

  // Add/Edit Form State
  const [form, setForm] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    departmentId: '',
    designationId: '',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    panNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    salaryStructureId: '',
    basicSalary: 50000,
  });

  // Salary Assignment Form State
  const [salaryForm, setSalaryForm] = useState({
    salaryStructureId: '',
    basicSalary: 60000,
    remarks: 'Annual revision',
  });

  const { data: empDetailsData } = useEmployeeDetails(selectedEmpId || '');
  const selectedEmployee = empDetailsData?.employee;

  const employees = empData?.employees || [];
  const departments = deptData?.departments || [];
  const designations = desigData?.designations || [];
  const structures = structData?.structures || [];

  const handleOpenAdd = () => {
    setForm({
      employeeCode: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: 'Male',
      departmentId: departments[0]?.id || '',
      designationId: designations[0]?.id || '',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      panNumber: 'ABCDE1234F',
      bankName: 'HDFC Bank',
      accountNumber: '50100987654321',
      ifscCode: 'HDFC0001234',
      salaryStructureId: structures[0]?.id || '',
      basicSalary: 55000,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp: any) => {
    setEditingEmp(emp);
    setForm({
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone || '',
      gender: emp.gender || 'Male',
      departmentId: emp.departmentId,
      designationId: emp.designationId,
      employmentType: emp.employmentType,
      status: emp.status,
      panNumber: emp.panNumber || '',
      bankName: emp.bankName || '',
      accountNumber: emp.accountNumber || '',
      ifscCode: emp.ifscCode || '',
      salaryStructureId: '',
      basicSalary: 0,
    });
    setShowEditModal(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(form);
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create employee');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({ id: editingEmp.id, data: form });
      setShowEditModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update employee');
    }
  };

  const handleSaveSalaryAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    try {
      await assignSalaryMutation.mutateAsync({
        employeeId: editingEmp.id,
        salaryStructureId: salaryForm.salaryStructureId,
        basicSalary: Number(salaryForm.basicSalary),
        remarks: salaryForm.remarks,
      });
      setShowSalaryModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to assign salary');
    }
  };

  // TanStack Table Columns Definition
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'employeeCode',
      header: () => (
        <div className="flex items-center gap-1.5">
          <span>Code</span>
          <SandboxBeacon
            title="Employee Code (Unique Identifier)"
            description="Enterprise internal payroll ID used for banking NACH files, PF ECR electronic returns, and Attendance punch sync."
            category="compliance"
          />
        </div>
      ),
      cell: ({ row }) => (
        <GuideTooltip
          title={`Employee ID: ${row.original.employeeCode}`}
          description="Click the eye icon on the right to view complete KYC, bank IFSC, and compensation revision history."
          category="feature"
          position="right"
        >
          <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20 cursor-pointer">
            {row.original.employeeCode}
          </span>
        </GuideTooltip>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Employee Name',
      cell: ({ row }) => {
        const emp = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
              {emp.firstName[0]}
              {emp.lastName[0]}
            </div>
            <div>
              <div className="font-semibold text-slate-100">
                {emp.firstName} {emp.lastName}
              </div>
              <div className="text-xs text-slate-400">{emp.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-200">{row.original.department?.name}</div>
          <div className="text-xs text-slate-400">{row.original.designation?.title}</div>
        </div>
      ),
    },
    {
      accessorKey: 'joiningDate',
      header: 'Joining Date',
      cell: ({ row }) => (
        <span className="text-xs text-slate-300 font-medium">
          {formatDate(row.original.joiningDate)}
        </span>
      ),
    },
    {
      accessorKey: 'salary',
      header: () => (
        <div className="flex items-center gap-1.5">
          <span>Assigned Basic Pay</span>
          <SandboxBeacon
            title="Base Salary Assignment"
            description="The foundational monthly basic pay from which HRA, DA, PF (12%), and ESI (0.75%) are computed according to statutory structures."
            category="formula"
            formula="EPF = min(Basic, 15000) * 12% | HRA = 40% to 50% of Basic"
          />
        </div>
      ),
      cell: ({ row }) => {
        const assignment = row.original.salaryAssignments?.[0];
        return (
          <GuideTooltip
            title="Assigned Salary Package"
            description={`Current Basic Salary: ${assignment ? formatCurrency(assignment.basicSalary) : 'Unassigned'} attached to structure: ${assignment?.salaryStructure?.name || 'Default'}.`}
            category="formula"
            tip="Use the Sliders button on the right to revise this employee's basic pay."
            position="top"
          >
            <div className="text-xs cursor-pointer">
              <div className="font-bold text-emerald-400">
                {assignment ? formatCurrency(assignment.basicSalary) : 'Unassigned'}
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {assignment?.salaryStructure?.name || 'Default Grade'}
              </div>
            </div>
          </GuideTooltip>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const color =
          status === 'ACTIVE'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : status === 'ON_LEAVE'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

        return (
          <GuideTooltip
            title={`Workforce Status: ${status}`}
            description={
              status === 'ACTIVE'
                ? 'Eligible for automatic attendance pull and monthly payroll calculation.'
                : status === 'ON_LEAVE'
                ? 'Active employee on extended statutory or unpaid leave.'
                : 'Excluded from monthly payroll engine batch runs.'
            }
            category="compliance"
            position="top"
          >
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border cursor-help ${color}`}>
              {status}
            </span>
          </GuideTooltip>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const emp = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <GuideTooltip
              title="View 360° Employee Profile"
              description="Open complete drawer with KYC (PAN, Aadhaar), Bank Account IFSC, Salary Structure components, and past payslips."
              category="feature"
              position="left"
            >
              <button
                onClick={() => setSelectedEmpId(emp.id)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="View 360° Profile"
              >
                <Eye className="w-4 h-4" />
              </button>
            </GuideTooltip>

            {canManageEmployees && (
              <>
                <GuideTooltip
                  title="Edit Profile & KYC Details"
                  description="Update contact info, department, designation, PAN number, or bank disbursement details."
                  category="action"
                  position="left"
                >
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Edit Information"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </GuideTooltip>

                <GuideTooltip
                  title="Revise Salary Structure"
                  description="Assign a new salary structure template or adjust the employee's monthly basic pay with effective date logging."
                  category="formula"
                  tip="Try revising basic salary to see automated EPF/ESI adjustments in the next payroll calculation."
                  position="left"
                >
                  <button
                    onClick={() => {
                      setEditingEmp(emp);
                      const currentAssign = emp.salaryAssignments?.[0];
                      setSalaryForm({
                        salaryStructureId: currentAssign?.salaryStructureId || structures[0]?.id || '',
                        basicSalary: currentAssign?.basicSalary || 50000,
                        remarks: 'Salary revision',
                      });
                      setShowSalaryModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 transition-colors"
                    title="Assign / Revise Salary"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                </GuideTooltip>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Workforce Management</span>
            <SandboxBeacon
              title="Employee Lifecycle & Master Data"
              description="Every employee profile stores KYC compliance data, banking payout routes, and dynamic salary structure assignments."
              category="workflow"
              variant="pill"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight mt-1">
            Employee Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage employee personal profiles, departmental designations, banking records, and salary structures.
          </p>
        </div>

        {canManageEmployees && (
          <GuideTooltip
            title="Create New Employee"
            description="Add an employee with KYC documents, bank IFSC details, and assigned salary structure template."
            category="action"
            tip="Fill in sample bank IFSC and basic salary to test new staff onboarding in sandbox."
            position="bottom"
          >
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Employee</span>
            </button>
          </GuideTooltip>
        )}
      </div>

      {/* TanStack Table */}
      <div id="tour-employees-table">
        <DataTable
          columns={columns}
          data={employees}
          searchPlaceholder="Search by name, code, or email..."
          isLoading={isLoading}
        />
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold dark:text-white text-slate-900">Create Employee Profile</h2>
                  <p className="text-xs text-slate-400">Add an employee with full payroll configuration</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Employee Code *</label>
                  <input
                    required
                    value={form.employeeCode}
                    onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
                  <input
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department *</label>
                  <select
                    required
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Designation *</label>
                  <select
                    required
                    value={form.designationId}
                    onChange={(e) => setForm({ ...form, designationId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    {designations.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Banking & Payroll Setup */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Banking & Initial Salary Structure
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">PAN / Tax ID</label>
                    <input
                      value={form.panNumber}
                      onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Name</label>
                    <input
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Salary Structure</label>
                    <select
                      value={form.salaryStructureId}
                      onChange={(e) => setForm({ ...form, salaryStructureId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    >
                      {structures.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Basic Monthly Pay (₹)</label>
                    <input
                      type="number"
                      value={form.basicSalary}
                      onChange={(e) => setForm({ ...form, basicSalary: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  {createMutation.isPending ? 'Saving...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold dark:text-white text-slate-900">Edit Employee: {editingEmp.employeeCode}</h2>
                <p className="text-xs text-slate-400">Update employee details</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ON_LEAVE">ON_LEAVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign / Revise Salary Modal */}
      {showSalaryModal && editingEmp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold dark:text-white text-slate-900">Assign Salary Structure</h2>
                <p className="text-xs text-slate-400">
                  {editingEmp.firstName} {editingEmp.lastName} ({editingEmp.employeeCode})
                </p>
              </div>
              <button
                onClick={() => setShowSalaryModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSalaryAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Salary Grade Structure</label>
                <select
                  value={salaryForm.salaryStructureId}
                  onChange={(e) => setSalaryForm({ ...salaryForm, salaryStructureId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                >
                  {structures.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Basic Monthly Salary (₹)</label>
                <input
                  type="number"
                  value={salaryForm.basicSalary}
                  onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Revision Remarks</label>
                <input
                  value={salaryForm.remarks}
                  onChange={(e) => setSalaryForm({ ...salaryForm, remarks: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  placeholder="e.g. Q3 Performance appraisal"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSalaryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignSalaryMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
                >
                  {assignSalaryMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 360 Employee Details Modal */}
      {selectedEmpId && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-lg">
                  {selectedEmployee.firstName[0]}
                  {selectedEmployee.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold dark:text-white text-slate-900">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-mono font-semibold">
                      {selectedEmployee.employeeCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedEmployee.designation?.title} • {selectedEmployee.department?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmpId(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Basic Pay</span>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {selectedEmployee.salaryAssignments?.[0]
                    ? formatCurrency(selectedEmployee.salaryAssignments[0].basicSalary)
                    : 'N/A'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Joined On</span>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  {formatDate(selectedEmployee.joiningDate)}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Bank Account</span>
                <div className="text-xs font-mono text-slate-300 mt-1">
                  {selectedEmployee.bankName || 'Bank'} • {selectedEmployee.accountNumber?.slice(-4) ? `****${selectedEmployee.accountNumber.slice(-4)}` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Historical Salary Assignment */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span>Salary Structure & Compensation History</span>
              </h3>
              <div className="space-y-2">
                {selectedEmployee.salaryAssignments?.map((assign: any) => (
                  <div
                    key={assign.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{assign.salaryStructure?.name}</div>
                      <div className="text-slate-400 text-[11px]">
                        Effective from {formatDate(assign.effectiveFrom)} {assign.remarks && `• ${assign.remarks}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">{formatCurrency(assign.basicSalary)}</div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400">{assign.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Recent Attendance Snapshot</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedEmployee.attendanceRecords?.slice(0, 4).map((att: any) => (
                  <div key={att.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="font-semibold text-slate-300">
                      Month {att.month}/{att.year}
                    </div>
                    <div className="text-emerald-400 font-medium">{att.presentDays} Present</div>
                    <div className="text-rose-400 text-[11px]">{att.unpaidLeaves} Unpaid (LOP)</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedEmpId(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
