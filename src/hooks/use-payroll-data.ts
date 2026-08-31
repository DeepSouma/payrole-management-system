'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// --- Dashboard ---
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });
}

// --- Employees ---
export function useEmployees(filters?: { search?: string; departmentId?: string; status?: string }) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.departmentId) params.set('departmentId', filters.departmentId);
      if (filters?.status) params.set('status', filters.status);
      const res = await fetch(`/api/employees?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch employees');
      return res.json();
    },
  });
}

export function useEmployeeDetails(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/employees/${id}`);
      if (!res.ok) throw new Error('Failed to fetch employee details');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create employee');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update employee');
      return json;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    },
  });
}

// --- Departments & Designations ---
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await fetch('/api/departments');
      if (!res.ok) throw new Error('Failed to fetch departments');
      return res.json();
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create department');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useDesignations() {
  return useQuery({
    queryKey: ['designations'],
    queryFn: async () => {
      const res = await fetch('/api/designations');
      if (!res.ok) throw new Error('Failed to fetch designations');
      return res.json();
    },
  });
}

export function useCreateDesignation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/designations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create designation');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

// --- Salary Structures & Components ---
export function useSalaryComponents() {
  return useQuery({
    queryKey: ['salary-components'],
    queryFn: async () => {
      const res = await fetch('/api/salary-components');
      if (!res.ok) throw new Error('Failed to fetch salary components');
      return res.json();
    },
  });
}

export function useCreateSalaryComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/salary-components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create component');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-components'] });
    },
  });
}

export function useSalaryStructures() {
  return useQuery({
    queryKey: ['salary-structures'],
    queryFn: async () => {
      const res = await fetch('/api/salary-structures');
      if (!res.ok) throw new Error('Failed to fetch salary structures');
      return res.json();
    },
  });
}

export function useCreateSalaryStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/salary-structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create structure');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
    },
  });
}

export function useAssignSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/salary-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to assign salary');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['salary-assignments'] });
    },
  });
}

// --- Attendance ---
export function useAttendance(month = 8, year = 2026) {
  return useQuery({
    queryKey: ['attendance', month, year],
    queryFn: async () => {
      const res = await fetch(`/api/attendance?month=${month}&year=${year}`);
      if (!res.ok) throw new Error('Failed to fetch attendance');
      return res.json();
    },
  });
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, year, records }: { month: number; year: number; records: any[] }) => {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year, records }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save attendance');
      return json;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.month, variables.year] });
    },
  });
}

// --- Payroll Runs ---
export function usePayrollRuns() {
  return useQuery({
    queryKey: ['payroll-runs'],
    queryFn: async () => {
      const res = await fetch('/api/payroll/runs');
      if (!res.ok) throw new Error('Failed to fetch payroll runs');
      return res.json();
    },
  });
}

export function usePayrollRunDetails(id: string) {
  return useQuery({
    queryKey: ['payroll-run', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/payroll/runs/${id}`);
      if (!res.ok) throw new Error('Failed to fetch payroll run details');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCalculatePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { month: number; year: number; processedByUserId?: string }) => {
      const res = await fetch('/api/payroll/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to calculate payroll');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useSubmitPayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/payroll/runs/${id}/submit`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to submit payroll');
      return json;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-run', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useApprovePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, comments, approvedByUserId }: { id: string; action: 'APPROVE' | 'REJECT'; comments?: string; approvedByUserId?: string }) => {
      const res = await fetch(`/api/payroll/runs/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comments, approvedByUserId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to process approval');
      return json;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-run', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useFinalizePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/payroll/runs/${id}/finalize`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to finalize payroll');
      return json;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-run', id] });
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// --- Payslips ---
export function usePayslips(filters?: { employeeId?: string; runId?: string }) {
  return useQuery({
    queryKey: ['payslips', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.employeeId) params.set('employeeId', filters.employeeId);
      if (filters?.runId) params.set('runId', filters.runId);
      const res = await fetch(`/api/payslips?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch payslips');
      return res.json();
    },
  });
}

export function usePayslipDetails(id: string) {
  return useQuery({
    queryKey: ['payslip', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/payslips/${id}`);
      if (!res.ok) throw new Error('Failed to fetch payslip details');
      return res.json();
    },
    enabled: !!id,
  });
}

// --- Reports & Analytics ---
export function useReports(type = 'monthly-summary', month = 8, year = 2026) {
  return useQuery({
    queryKey: ['reports', type, month, year],
    queryFn: async () => {
      const res = await fetch(`/api/reports?type=${type}&month=${month}&year=${year}`);
      if (!res.ok) throw new Error('Failed to fetch report');
      return res.json();
    },
  });
}

// --- Audit Logs ---
export function useAuditLogs(module?: string) {
  return useQuery({
    queryKey: ['audit-logs', module],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (module) params.set('module', module);
      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      return res.json();
    },
  });
}

// --- Settings ---
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update settings');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// --- Bank Accounts & Disbursements ---
export function useBankAccounts() {
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const res = await fetch('/api/bank-accounts');
      if (!res.ok) throw new Error('Failed to fetch bank accounts');
      return res.json();
    },
  });
}

export function usePaymentBatches() {
  return useQuery({
    queryKey: ['payment-batches'],
    queryFn: async () => {
      const res = await fetch('/api/payments/batches');
      if (!res.ok) throw new Error('Failed to fetch payment batches');
      return res.json();
    },
  });
}

export function useH2HFiles() {
  return useQuery({
    queryKey: ['h2h-files'],
    queryFn: async () => {
      const res = await fetch('/api/payments/h2h-files');
      if (!res.ok) throw new Error('Failed to fetch H2H files');
      return res.json();
    },
  });
}

export function useDisbursePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { payrollRunId: string; bankAccountId: string; method: string }) => {
      const res = await fetch('/api/payments/disburse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Disbursement failed');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batches'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
    },
  });
}

export function useGenerateH2HFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { payrollRunId: string; format: string; bankAccountId?: string }) => {
      const res = await fetch('/api/payments/h2h-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to generate H2H file');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['h2h-files'] });
    },
  });
}

export function useIngestReverseMIS() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { fileContent: string; fileName?: string }) => {
      const res = await fetch('/api/payments/reverse-mis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to ingest Reverse MIS');
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['h2h-files'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-runs'] });
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
    },
  });
}

