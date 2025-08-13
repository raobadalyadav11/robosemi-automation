import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select('thingspeakApiKey');
    
    return NextResponse.json({ 
      apiKey: user?.thingspeakApiKey || null,
      hasApiKey: !!user?.thingspeakApiKey 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get API key' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { apiKey } = await request.json();
    
    await dbConnect();
    await User.findByIdAndUpdate(session.user.id, { thingspeakApiKey: apiKey });
    
    return NextResponse.json({ success: true, apiKey });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set API key' }, { status: 500 });
  }
}