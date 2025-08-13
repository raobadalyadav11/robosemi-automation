'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Users, Zap, Activity } from 'lucide-react';
import { StreetLight } from '@/types';

export default function Dashboard() {
  const { data: session } = useSession();
  const [streetLights, setStreetLights] = useState<StreetLight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreetLights();
  }, []);

  const onCount = streetLights.filter(light => light.status === 'on').length;
  const offCount = streetLights.filter(light => light.status === 'off').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitor and control your smart lighting system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
            • System Online
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Welcome, {session?.user.name}
          </Badge>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Total Devices
            </CardTitle>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{streetLights.length}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Connected street lights
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Active Lights
            </CardTitle>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{onCount}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Currently illuminated
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Inactive Lights
            </CardTitle>
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{offCount}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Currently off
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Energy Efficiency
            </CardTitle>
            <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-2 rounded-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">98%</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              System efficiency
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <span>Device Status Overview</span>
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
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {streetLights.map((light) => (
                  <div key={light._id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full shadow-lg ${
                        light.status === 'on' 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-500/30' 
                          : 'bg-gradient-to-r from-red-400 to-pink-500 shadow-red-500/30'
                      }`} />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{light.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">LED #{light.ledNumber} • Field {light.thingSpeakField}</p>
                      </div>
                    </div>
                    <Badge className={`${
                      light.status === 'on' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                        : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    } px-3 py-1 font-medium`}>
                      {light.status === 'on' ? '• ON' : '○ OFF'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Lightbulb className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">No devices configured</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Add street lights to start monitoring</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(session?.user.role === 'admin' || session?.user.role === 'operator') && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Control Panel</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Individual Light Control</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Master Switch Control</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Real-time Monitoring</span>
                  </div>
                </div>
              </div>
            )}
            
            {session?.user.role === 'admin' && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Admin Tools</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200/50 dark:border-orange-700/50">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">User Management</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200/50 dark:border-cyan-700/50">
                    <Activity className="h-4 w-4 text-cyan-600" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">API Configuration</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg border border-violet-200/50 dark:border-violet-700/50">
                    <Activity className="h-4 w-4 text-violet-600" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">System Settings</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="text-center p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  🎆 IoT-Powered Smart City Solution
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}