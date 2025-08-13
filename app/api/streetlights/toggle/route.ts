import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import StreetLight from '@/models/StreetLight';
import ApiConfig from '@/models/ApiConfig';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ledNumber, field, isMaster } = await request.json();
    
    await dbConnect();
    
    // Get API configuration
    const apiConfig = await ApiConfig.findOne({}).sort({ createdAt: -1 });
    if (!apiConfig) {
      return NextResponse.json({ error: 'API configuration not found' }, { status: 404 });
    }

    if (isMaster) {
      // Toggle all street lights
      const streetLights = await StreetLight.find({});
      const newStatus = streetLights[0]?.status === 'on' ? 'off' : 'on';
      const stateValue = newStatus === 'on' ? 1 : 0;

      // Update all in database
      await StreetLight.updateMany({}, { status: newStatus });

      // Send to ThingSpeak
      const fields = streetLights.map((_, index) => `field${index + 1}=${stateValue}`).join('&');
      const url = `https://api.thingspeak.com/update?api_key=${apiConfig.apiKey}&${fields}`;
      
      const response = await fetch(url);
      
      return NextResponse.json({ 
        success: response.ok,
        status: newStatus,
        message: `All street lights turned ${newStatus.toUpperCase()}` 
      });
    } else {
      // Toggle single street light
      const streetLight = await StreetLight.findOne({ ledNumber });
      if (!streetLight) {
        return NextResponse.json({ error: 'Street light not found' }, { status: 404 });
      }

      const newStatus = streetLight.status === 'on' ? 'off' : 'on';
      const stateValue = newStatus === 'on' ? 1 : 0;

      // Update in database
      await StreetLight.findByIdAndUpdate(streetLight._id, { status: newStatus });

      // Send to ThingSpeak
      const url = `https://api.thingspeak.com/update?api_key=${apiConfig.apiKey}&${field}=${stateValue}`;
      const response = await fetch(url);

      return NextResponse.json({ 
        success: response.ok,
        status: newStatus,
        ledNumber,
        message: `${streetLight.name} turned ${newStatus.toUpperCase()}` 
      });
    }
  } catch (error) {
    console.error('Toggle error:', error);
    return NextResponse.json({ error: 'Failed to toggle street light' }, { status: 500 });
  }
}