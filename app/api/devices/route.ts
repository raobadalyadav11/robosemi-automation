import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Device from '@/models/Device';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (session.user.role === 'admin') {
      const devices = await Device.find({}).populate('userId', 'name email thingspeakApiKey createdAt');
      return NextResponse.json(devices);
    } else {
      const devices = await Device.find({ userId: session.user.id }).populate('userId', 'name email thingspeakApiKey');
      return NextResponse.json(devices);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, field, widgetId, currentWidgetId, userId } = await request.json();

    await dbConnect();
    
    const device = new Device({
      name,
      field,
      widgetId,
      currentWidgetId,
      userId,
    });

    await device.save();
    await device.populate('userId', 'name email');
    
    return NextResponse.json(device, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create device' }, { status: 500 });
  }
}