import { prisma } from './prisma';

interface LogParams {
  userId?: string;
  userName?: string;
  action: string;
  module: string;
  recordId?: string;
  recordName?: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
}

export async function logAuditEvent(params: LogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userName: params.userName || 'System User',
        action: params.action,
        module: params.module,
        recordId: params.recordId || null,
        recordName: params.recordName || null,
        previousValueJson: params.previousValue ? JSON.stringify(params.previousValue) : null,
        newValueJson: params.newValue ? JSON.stringify(params.newValue) : null,
        ipAddress: params.ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
