import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Device from '@/models/Device';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const devices = await Device.find({}).populate('userId', 'name email role');
    return NextResponse.json(devices);

  } catch (error) {
    console.error('Admin devices API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, userId, field, widgetId } = await request.json();
    await dbConnect();

    const device = new Device({ name, userId, field, widgetId });
    await device.save();
    await device.populate('userId', 'name email role');

    return NextResponse.json(device, { status: 201 });

  } catch (error) {
    console.error('Create device error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}