'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { StreetLight } from '@/types';

export default function Controls() {
  const { data: session } = useSession();
  const [streetLights, setStreetLights] = useState<StreetLight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingLights, setTogglingLights] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchStreetLights = async () => {
      try {
        const response = await fetch('/api/streetlights');
        if (response.ok) {
          const data = await response.json();
          setStreetLights(data);
        }
      } catch (error) {
        console.error('Failed to fetch street lights:', error);
        toast.error('Failed to load street lights');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreetLights();
  }, []);

  const toggleLight = async (ledNumber: number, field: string, isMaster = false) => {
    if (isMaster) {
      setTogglingLights(new Set(streetLights.map(light => light.ledNumber)));
    } else {
      setTogglingLights(prev => new Set(Array.from(prev).concat(ledNumber)));
    }

    try {
      const response = await fetch('/api/streetlights/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ledNumber, field, isMaster }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        
        // Update local state
        if (isMaster) {
          setStreetLights(lights => 
            lights.map(light => ({ ...light, status: result.status }))
          );
        } else {
          setStreetLights(lights => 
            lights.map(light => 
              light.ledNumber === ledNumber 
                ? { ...light, status: result.status }
                : light
            )
          );
        }
      } else {
        toast.error('Failed to toggle light');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('An error occurred while toggling the light');
    } finally {
      if (isMaster) {
        setTogglingLights(new Set());
      } else {
        setTogglingLights(prev => {
          const next = new Set(Array.from(prev));
          next.delete(ledNumber);
          return next;
        });
      }
    }
  };

  if (session?.user.role === 'user') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You don't have permission to access the control panel.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Contact your administrator for operator access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const masterStatus = streetLights.length > 0 && streetLights.every(light => light.status === 'on') ? 'on' : 'off';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Control Panel
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and monitor your smart lighting system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1">
            {session?.user.role?.toUpperCase()} ACCESS
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {streetLights.length} Devices
          </Badge>
        </div>
      </div>

      {/* Master Control */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full" />
            <span>Master Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 p-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl">
            <div className="space-y-1">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">Master Switch</span>
              <p className="text-sm text-slate-600 dark:text-slate-400">Control all lights simultaneously</p>
            </div>
            <Button
              size="lg"
              className={`min-w-[140px] h-12 font-semibold shadow-lg transition-all duration-200 ${
                masterStatus === 'on' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white' 
                  : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
              }`}
              onClick={() => toggleLight(0, '', true)}
              disabled={togglingLights.size > 0 || streetLights.length === 0}
            >
              {togglingLights.size > 0 ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>SWITCHING...</span>
                </div>
              ) : (
                <span>{masterStatus === 'on' ? '🔆 ALL ON' : '🌙 ALL OFF'}</span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Controls */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
            <span>Individual Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-slate-600 dark:text-slate-400">Loading devices...</span>
              </div>
            </div>
          ) : streetLights.length > 0 ? (
            <div className="space-y-4">
              {/* Mobile Cards */}
              <div className="block lg:hidden space-y-4">
                {streetLights.map((light) => (
                  <div key={light._id} className="p-4 bg-slate-50/50 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{light.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">LED #{light.ledNumber}</p>
                      </div>
                      <Button
                        className={`min-w-[100px] font-medium shadow-md transition-all duration-200 ${
                          light.status === 'on'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                        }`}
                        onClick={() => toggleLight(light.ledNumber, light.thingSpeakField)}
                        disabled={togglingLights.has(light.ledNumber)}
                      >
                        {togglingLights.has(light.ledNumber) ? (
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-xs">...</span>
                          </div>
                        ) : (
                          light.status === 'on' ? '🔆 ON' : '🌙 OFF'
                        )}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">Input Status</p>
                        {light.inputStatusUrl ? (
                          <iframe
                            width="100%"
                            height="150"
                            className="border border-slate-300 dark:border-slate-600 rounded-lg"
                            src={light.inputStatusUrl}
                          />
                        ) : (
                          <div className="h-[150px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">No data available</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">Current Status</p>
                        {light.currentStatusUrl ? (
                          <iframe
                            width="100%"
                            height="150"
                            className="border border-slate-300 dark:border-slate-600 rounded-lg"
                            src={light.currentStatusUrl}
                          />
                        ) : (
                          <div className="h-[150px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">No data available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <th className="p-4 text-left font-semibold rounded-tl-lg">Device Name</th>
                      <th className="p-4 text-center font-semibold">Control</th>
                      <th className="p-4 text-center font-semibold">Input Status</th>
                      <th className="p-4 text-center font-semibold rounded-tr-lg">Current Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streetLights.map((light, index) => (
                      <tr key={light._id} className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                        index === streetLights.length - 1 ? 'border-b-0' : ''
                      }`}>
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900 dark:text-white">{light.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">LED #{light.ledNumber} • Field {light.thingSpeakField}</p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            className={`min-w-[120px] font-medium shadow-md transition-all duration-200 ${
                              light.status === 'on'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                            }`}
                            onClick={() => toggleLight(light.ledNumber, light.thingSpeakField)}
                            disabled={togglingLights.has(light.ledNumber)}
                          >
                            {togglingLights.has(light.ledNumber) ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                <span>SWITCHING</span>
                              </div>
                            ) : (
                              light.status === 'on' ? '🔆 ON' : '🌙 OFF'
                            )}
                          </Button>
                        </td>
                        <td className="p-4 text-center">
                          {light.inputStatusUrl ? (
                            <iframe
                              width="200"
                              height="160"
                              className="border border-slate-300 dark:border-slate-600 rounded-lg mx-auto"
                              src={light.inputStatusUrl}
                            />
                          ) : (
                            <div className="w-[200px] h-[160px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 mx-auto">
                              <span className="text-slate-500 dark:text-slate-400 text-sm">No data</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {light.currentStatusUrl ? (
                            <iframe
                              width="200"
                              height="160"
                              className="border border-slate-300 dark:border-slate-600 rounded-lg mx-auto"
                              src={light.currentStatusUrl}
                            />
                          ) : (
                            <div className="w-[200px] h-[160px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 mx-auto">
                              <span className="text-slate-500 dark:text-slate-400 text-sm">No data</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">No devices configured</p>
              <p className="text-slate-500 dark:text-slate-500 text-sm">Contact your administrator to add street lights</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}