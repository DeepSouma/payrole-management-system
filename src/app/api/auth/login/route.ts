import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide both email and password.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        employee: {
          include: {
            department: true,
            designation: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address or user not found.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'This user account is currently deactivated.' },
        { status: 403 }
      );
    }

    await logAuditEvent({
      userId: user.id,
      userName: user.name,
      action: 'USER_LOGIN',
      module: 'AUTH',
      recordName: `${user.name} (${user.role})`,
    });

    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      avatarUrl: user.avatarUrl,
      employeeCode: user.employee?.employeeCode,
      departmentName: user.employee?.department?.name,
      designationTitle: user.employee?.designation?.title,
    };

    return NextResponse.json({
      success: true,
      user: userSession,
      token: `demo_jwt_token_${user.id}_${Date.now()}`,
      message: 'Login successful',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
