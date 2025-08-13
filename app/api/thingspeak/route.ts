import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { field, value } = await request.json();

    await dbConnect();
    const user = await User.findById(session.user.id).select('thingspeakApiKey');
    
    if (!user?.thingspeakApiKey) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 400 });
    }

    const url = `https://api.thingspeak.com/update?api_key=${user.thingspeakApiKey}&${field}=${value}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'ThingSpeak API failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ThingSpeak' }, { status: 500 });
  }
}