'use client';

import React, { useState } from 'react';
import { Building2, Plus, Users, Shield, X, Briefcase } from 'lucide-react';
import {
  useDepartments,
  useDesignations,
  useCreateDepartment,
  useCreateDesignation,
} from '@/hooks/use-payroll-data';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { GuideTooltip } from '@/components/ui/guide-tooltip';
import { SandboxBeacon } from '@/components/ui/sandbox-beacon';

export default function DepartmentsPage() {
  const { canManageEmployees } = useAuth();
  const { data: deptData, isLoading } = useDepartments();
  const { data: desigData } = useDesignations();

  const createDeptMutation = useCreateDepartment();
  const createDesigMutation = useCreateDesignation();

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showDesigModal, setShowDesigModal] = useState(false);

  const [deptForm, setDeptForm] = useState({ code: '', name: '', description: '' });
  const [desigForm, setDesigForm] = useState({
    code: '',
    title: '',
    departmentId: '',
    minSalary: 50000,
    maxSalary: 120000,
  });

  const departments = deptData?.departments || [];
  const designations = desigData?.designations || [];

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeptMutation.mutateAsync(deptForm);
      setDeptForm({ code: '', name: '', description: '' });
      setShowDeptModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create department');
    }
  };

  const handleCreateDesig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDesigMutation.mutateAsync(desigForm);
      setDesigForm({ code: '', title: '', departmentId: '', minSalary: 50000, maxSalary: 120000 });
      setShowDesigModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create designation');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Organizational Structure</span>
            <SandboxBeacon
              title="Departments & Salary Bands"
              description="Establish cost-center hierarchies and defined minimum-to-maximum compensation bands for each designation."
              category="workflow"
              variant="pill"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight mt-1">
            Departments & Designations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Organize corporate units, assign role titles, and define salary bands.
          </p>
        </div>

        {canManageEmployees && (
          <div className="flex items-center gap-3">
            <GuideTooltip
              title="Create Department"
              description="Registers a new business cost center (e.g. Sales, Marketing, AI Research)."
              category="action"
              position="bottom"
            >
              <button
                onClick={() => setShowDeptModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Add Department</span>
              </button>
            </GuideTooltip>

            <GuideTooltip
              title="Add Role Designation"
              description="Creates a job title with designated minimum and maximum salary boundary bands."
              category="action"
              position="bottom"
            >
              <button
                onClick={() => {
                  setDesigForm((prev) => ({ ...prev, departmentId: departments[0]?.id || '' }));
                  setShowDesigModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2 border border-slate-700 transition-all"
              >
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>Add Designation</span>
              </button>
            </GuideTooltip>
          </div>
        )}
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept: any) => (
          <div
            key={dept.id}
            className="glass-panel glass-panel-hover p-6 rounded-3xl space-y-5 border border-slate-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold dark:text-white text-slate-900">{dept.name}</h2>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                      {dept.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{dept.description || 'Core organizational unit'}</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>{dept.employees?.length || 0} Staff</span>
              </div>
            </div>

            {/* Designations in this department */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Designations & Salary Bands
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dept.designations?.map((desig: any) => (
                  <div
                    key={desig.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="font-semibold text-slate-200 truncate">{desig.title}</div>
                    <div className="text-[11px] text-slate-400">
                      Band: {formatCurrency(desig.minSalary)} - {formatCurrency(desig.maxSalary)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold dark:text-white text-slate-900">Add New Department</h2>
              <button
                onClick={() => setShowDeptModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department Code</label>
                <input
                  required
                  placeholder="e.g. ENG, FIN, MKT"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department Name</label>
                <input
                  required
                  placeholder="e.g. Artificial Intelligence & Analytics"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDeptMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
                >
                  {createDeptMutation.isPending ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Designation Modal */}
      {showDesigModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold dark:text-white text-slate-900">Add New Designation</h2>
              <button
                onClick={() => setShowDesigModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDesig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <select
                  required
                  value={desigForm.departmentId}
                  onChange={(e) => setDesigForm({ ...desigForm, departmentId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                >
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Designation Code</label>
                <input
                  required
                  placeholder="e.g. SRE-LEAD"
                  value={desigForm.code}
                  onChange={(e) => setDesigForm({ ...desigForm, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  required
                  placeholder="e.g. Site Reliability Engineering Lead"
                  value={desigForm.title}
                  onChange={(e) => setDesigForm({ ...desigForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Salary (₹)</label>
                  <input
                    type="number"
                    value={desigForm.minSalary}
                    onChange={(e) => setDesigForm({ ...desigForm, minSalary: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Salary (₹)</label>
                  <input
                    type="number"
                    value={desigForm.maxSalary}
                    onChange={(e) => setDesigForm({ ...desigForm, maxSalary: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDesigModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDesigMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
                >
                  {createDesigMutation.isPending ? 'Saving...' : 'Save Designation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
