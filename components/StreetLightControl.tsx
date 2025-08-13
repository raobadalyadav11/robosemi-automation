'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Power, Zap } from 'lucide-react';

interface LEDState {
  id: number;
  name: string;
  isOn: boolean;
  field: string;
  widgetId: string;
  currentWidgetId?: string;
}

export default function StreetLightControl() {
  const { data: session } = useSession();
  const [masterSwitch, setMasterSwitch] = useState(true);
  const [devices, setDevices] = useState<LEDState[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [checkingApiKey, setCheckingApiKey] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchUserDevices();
      checkApiKey();
    }
  }, [session]);

  const checkApiKey = async () => {
    try {
      const response = await fetch('/api/user/api-key');
      const { hasApiKey } = await response.json();
      setHasApiKey(hasApiKey);
    } catch (error) {
      console.error('Failed to check API key:', error);
    } finally {
      setCheckingApiKey(false);
    }
  };

  const fetchUserDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      if (response.ok) {
        const data = await response.json();
        const formattedDevices = data.map((device: any, index: number) => ({
          id: index + 1,
          name: device.name,
          isOn: true,
          field: device.field,
          widgetId: device.widgetId,
          currentWidgetId: device.currentWidgetId,
        }));
        setDevices(formattedDevices);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSwitch = async (ledId: number) => {
    const device = devices.find(d => d.id === ledId);
    if (!device) return;

    try {
      const apiResponse = await fetch('/api/user/api-key');
      const { apiKey } = await apiResponse.json();
      
      if (!apiKey) {
        console.error('No API key found');
        return;
      }

      const newState = !device.isOn;
      setDevices(prev => prev.map(d => d.id === ledId ? { ...d, isOn: newState } : d));

      const response = await fetch('/api/thingspeak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: device.field, value: newState ? 1 : 0 })
      });
      
      if (!response.ok) {
        console.error('API request failed:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleMasterSwitch = async () => {
    try {
      const apiResponse = await fetch('/api/user/api-key');
      const { apiKey } = await apiResponse.json();
      
      if (!apiKey) {
        console.error('No API key found');
        return;
      }

      const newState = !masterSwitch;
      setMasterSwitch(newState);
      setDevices(prev => prev.map(d => ({ ...d, isOn: newState })));

      for (const device of devices) {
        await fetch('/api/thingspeak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: device.field, value: newState ? 1 : 0 })
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }



  if (checkingApiKey) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle>API Key Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Please contact your administrator to configure your ThingSpeak API key.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Lightbulb className="h-10 w-10 text-yellow-500" />
          Street Light Control System
        </h1>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Master Switch</span>
            <Button
              onClick={toggleMasterSwitch}
              className={`w-24 h-12 text-lg font-semibold ${
                masterSwitch
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {masterSwitch ? 'ON' : 'OFF'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-4 text-center font-bold">LED Name</th>
                  <th className="p-4 text-center font-bold">Switch</th>
                  <th className="p-4 text-center font-bold">LED Input Status</th>
                  <th className="p-4 text-center font-bold">LED Current Status</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id}>
                    <td className="p-4 text-center font-medium">{device.name}</td>
                    <td className="p-4 text-center">
                      <Button
                        onClick={() => toggleSwitch(device.id)}
                        className={`w-24 h-12 font-semibold ${
                          device.isOn
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        {device.isOn ? 'ON' : 'OFF'}
                      </Button>
                    </td>
                    <td className="p-4 text-center">
                      <iframe
                        width="250"
                        height="210"
                        style={{ border: '1px solid #cccccc' }}
                        src={`https://thingspeak.com/channels/1781812/widgets/${device.widgetId}`}
                        title={`${device.name} Input Status`}
                      />
                    </td>
                    <td className="p-4 text-center">
                      {device.currentWidgetId ? (
                        <iframe
                          width="250"
                          height="210"
                          style={{ border: '1px solid #cccccc' }}
                          src={`https://thingspeak.com/channels/1780068/widgets/${device.currentWidgetId}`}
                          title={`${device.name} Current Status`}
                        />
                      ) : (
                        <div className="w-64 h-52 flex items-center justify-center bg-slate-100">
                          <Badge variant="secondary">No Status Available</Badge>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}