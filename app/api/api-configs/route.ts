import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ApiConfig from '@/models/ApiConfig';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const apiConfigs = await ApiConfig.find({}).populate('createdBy', 'name email');
    
    return NextResponse.json(apiConfigs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch API configs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    
    await dbConnect();
    
    const apiConfig = new ApiConfig({
      ...data,
      createdBy: session.user.id,
    });
    await apiConfig.save();
    
    return NextResponse.json(apiConfig, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create API config' }, { status: 500 });
  }
}