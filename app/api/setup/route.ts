import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import ApiConfig from '@/models/ApiConfig';

export async function GET() {
  try {
    await dbConnect();
    
    // Check if system is already set up (has admin user)
    const adminExists = await User.findOne({ role: 'admin' });
    
    return NextResponse.json({ 
      isSetup: !!adminExists,
      needsSetup: !adminExists 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check setup status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { adminName, adminEmail, adminPassword, apiKey, channelId } = await request.json();
    
    await dbConnect();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({ error: 'System already set up' }, { status: 400 });
    }

    // Create admin user
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    await adminUser.save();

    // Create API configuration
    const apiConfig = new ApiConfig({
      name: 'Default ThingSpeak Config',
      apiKey,
      channelId,
      description: 'Initial system configuration',
      createdBy: adminUser._id,
    });
    await apiConfig.save();

    return NextResponse.json({ 
      message: 'System setup completed successfully',
      adminId: adminUser._id 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}