import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import StreetLight from '@/models/StreetLight';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'operator'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    
    await dbConnect();
    
    const streetLight = await StreetLight.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!streetLight) {
      return NextResponse.json({ error: 'Street light not found' }, { status: 404 });
    }
    
    return NextResponse.json(streetLight);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update street light' }, { status: 500 });
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
    
    const streetLight = await StreetLight.findByIdAndDelete(params.id);
    
    if (!streetLight) {
      return NextResponse.json({ error: 'Street light not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Street light deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete street light' }, { status: 500 });
  }
}