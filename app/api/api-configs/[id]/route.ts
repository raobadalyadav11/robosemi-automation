import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ApiConfig from '@/models/ApiConfig';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    
    await dbConnect();
    
    const apiConfig = await ApiConfig.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!apiConfig) {
      return NextResponse.json({ error: 'API configuration not found' }, { status: 404 });
    }
    
    return NextResponse.json(apiConfig);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update API configuration' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    
    const apiConfig = await ApiConfig.findByIdAndDelete(params.id);
    
    if (!apiConfig) {
      return NextResponse.json({ error: 'API configuration not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'API configuration deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete API configuration' }, { status: 500 });
  }
}