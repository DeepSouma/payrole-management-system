'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'SUPER_ADMIN' | 'PAYROLL_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  avatarUrl?: string;
  employeeCode?: string;
  departmentName?: string;
  designationTitle?: string;
}

export const DEMO_USERS: Record<UserRole, UserSession> = {
  SUPER_ADMIN: {
    id: 'user-super-admin',
    name: 'Super Admin (System)',
    email: 'admin@apex-innovations.io',
    role: 'SUPER_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  PAYROLL_ADMIN: {
    id: 'user-payroll-admin',
    name: 'Ananya Sharma',
    email: 'payroll.admin@apex-innovations.io',
    role: 'PAYROLL_ADMIN',
    employeeId: 'emp-002',
    employeeCode: 'EMP-002',
    departmentName: 'Human Resources',
    designationTitle: 'HR & Payroll Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  MANAGER: {
    id: 'user-manager',
    name: 'Vikram Aditya',
    email: 'manager@apex-innovations.io',
    role: 'MANAGER',
    employeeId: 'emp-001',
    employeeCode: 'EMP-001',
    departmentName: 'Engineering & Technology',
    designationTitle: 'VP of Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  EMPLOYEE: {
    id: 'user-employee',
    name: 'Rahul Verma',
    email: 'rahul.verma@apex-innovations.io',
    role: 'EMPLOYEE',
    employeeId: 'emp-003',
    employeeCode: 'EMP-003',
    departmentName: 'Engineering & Technology',
    designationTitle: 'Lead Frontend Architect',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
};

interface AuthContextType {
  user: UserSession;
  setRole: (role: UserRole) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  canManagePayroll: boolean;
  canApprovePayroll: boolean;
  canManageEmployees: boolean;
  canViewReports: boolean;
  isEmployeeOnly: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('PAYROLL_ADMIN');
  const [currentUser, setCurrentUser] = useState<UserSession>(DEMO_USERS.PAYROLL_ADMIN);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('payroll_user_session');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed?.role) {
          setCurrentRole(parsed.role);
          setCurrentUser(parsed);
          return;
        }
      }
      const savedRole = localStorage.getItem('payroll_demo_role') as UserRole;
      if (savedRole && DEMO_USERS[savedRole]) {
        setCurrentRole(savedRole);
        setCurrentUser(DEMO_USERS[savedRole]);
      }
    } catch (e) {}
  }, []);

  const handleSetRole = (role: UserRole) => {
    setIsLoading(true);
    setCurrentRole(role);
    const updated = DEMO_USERS[role] || DEMO_USERS.PAYROLL_ADMIN;
    setCurrentUser(updated);
    localStorage.setItem('payroll_demo_role', role);
    localStorage.setItem('payroll_user_session', JSON.stringify(updated));
    setTimeout(() => setIsLoading(false), 200);
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Authentication failed' };
      }

      setCurrentRole(data.user.role);
      setCurrentUser(data.user);
      localStorage.setItem('payroll_demo_role', data.user.role);
      localStorage.setItem('payroll_user_session', JSON.stringify(data.user));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('payroll_user_session');
    localStorage.removeItem('payroll_demo_role');
    window.location.href = '/login';
  };

  const canManagePayroll = currentRole === 'SUPER_ADMIN' || currentRole === 'PAYROLL_ADMIN';
  const canApprovePayroll = currentRole === 'SUPER_ADMIN' || currentRole === 'MANAGER';
  const canManageEmployees = currentRole === 'SUPER_ADMIN' || currentRole === 'PAYROLL_ADMIN';
  const canViewReports = currentRole === 'SUPER_ADMIN' || currentRole === 'PAYROLL_ADMIN' || currentRole === 'MANAGER';
  const isEmployeeOnly = currentRole === 'EMPLOYEE';

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        setRole: handleSetRole,
        login,
        logout,
        isLoading,
        canManagePayroll,
        canApprovePayroll,
        canManageEmployees,
        canViewReports,
        isEmployeeOnly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
