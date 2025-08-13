import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import StreetLight from '@/models/StreetLight';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const streetLights = await StreetLight.find({}).populate('createdBy', 'name email');
    
    return NextResponse.json(streetLights);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch street lights' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'operator'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    
    await dbConnect();
    
    const streetLight = new StreetLight({
      ...data,
      createdBy: session.user.id,
    });
    await streetLight.save();
    
    return NextResponse.json(streetLight, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create street light' }, { status: 500 });
  }
}