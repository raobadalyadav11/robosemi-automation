import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'operator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, deviceId, value } = await request.json();

    const response = {
      success: true,
      action,
      deviceId,
      value,
      timestamp: new Date(),
      message: `Device ${deviceId} ${action} successfully`
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Admin control API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}