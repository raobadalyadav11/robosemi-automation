'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Key, 
  Lightbulb, 
  Settings, 
  Copy, 
  Eye, 
  EyeOff, 
  Power, 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp,
  Wifi,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';

export default function Dashboard() {
  const { data: session, update } = useSession();
  const [devices, setDevices] = useState([]);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [userApiKey, setUserApiKey] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [masterSwitch, setMasterSwitch] = useState(true);
  const [ledDevices, setLedDevices] = useState([
    { id: 1, name: 'LED_1', isOn: true, field: 'field1', widgetId: '487926', status: 'online', lastUpdate: new Date() },
    { id: 2, name: 'LED_2', isOn: true, field: 'field2', widgetId: '487928', currentWidgetId: '490855', status: 'online', lastUpdate: new Date() },
    { id: 3, name: 'LED_3', isOn: true, field: 'field3', widgetId: '487929', status: 'online', lastUpdate: new Date() },
    { id: 4, name: 'LED_4', isOn: true, field: 'field4', widgetId: '487930', status: 'online', lastUpdate: new Date() },
    { id: 5, name: 'LED_5', isOn: true, field: 'field5', widgetId: '487932', status: 'online', lastUpdate: new Date() },
    { id: 6, name: 'LED_6', isOn: true, field: 'field6', widgetId: '487933', status: 'online', lastUpdate: new Date() },
    { id: 7, name: 'LED_7', isOn: true, field: 'field7', widgetId: '487934', status: 'online', lastUpdate: new Date() },
    { id: 8, name: 'LED_8', isOn: true, field: 'field8', widgetId: '487935', status: 'online', lastUpdate: new Date() },
  ]);
  const [analytics, setAnalytics] = useState({
    totalDevices: 8,
    activeDevices: 8,
    energySaved: 24.5,
    uptime: 99.2,
    lastSync: new Date()
  });

  useEffect(() => {
    if (session?.user) {
      fetchUserDevices();
      fetchUserApiKey();
      if (session.user.role === 'admin') {
        fetchAllUsers();
      } else {
        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
      }
    }
  }, [session]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchUserApiKey = async () => {
    try {
      const response = await fetch('/api/user/api-key');
      if (response.ok) {
        const { apiKey } = await response.json();
        setUserApiKey(apiKey || '');
        setApiKey(apiKey || '');
      }
    } catch (error) {
      console.error('Failed to fetch API key:', error);
    }
  };

  const toggleLED = async (ledId: number) => {
    const device = ledDevices.find(d => d.id === ledId);
    if (!device || !userApiKey) return;

    const newState = !device.isOn;
    setLedDevices(prev => prev.map(d => d.id === ledId ? { ...d, isOn: newState, lastUpdate: new Date() } : d));
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      activeDevices: ledDevices.filter(d => d.id === ledId ? newState : d.isOn).length,
      lastSync: new Date()
    }));

    try {
      await fetch('/api/thingspeak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: device.field, value: newState ? 1 : 0 })
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleMasterSwitch = async () => {
    if (!userApiKey) return;

    const newState = !masterSwitch;
    setMasterSwitch(newState);
    setLedDevices(prev => prev.map(d => ({ ...d, isOn: newState, lastUpdate: new Date() })));
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      activeDevices: newState ? ledDevices.length : 0,
      lastSync: new Date()
    }));

    try {
      for (const device of ledDevices) {
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

  const fetchUserDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };



  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'operator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'operator', 'user']}>
      <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome back, {session?.user.name}
        </p>
      </div>

      {session?.user.role !== 'admin' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Total Devices
              </CardTitle>
              <Lightbulb className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{analytics.totalDevices}</div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Street lights</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">
                Active Devices
              </CardTitle>
              <Power className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{analytics.activeDevices}</div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Currently ON</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                System Uptime
              </CardTitle>
              <Activity className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{analytics.uptime}%</div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                Energy Saved
              </CardTitle>
              <Zap className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{analytics.energySaved}%</div>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">This month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {session?.user.role === 'admin' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Your Role
              </CardTitle>
              <Settings className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <Badge className={getRoleBadgeColor(session?.user.role || 'user')}>
                {session?.user.role?.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Total Devices
              </CardTitle>
              <Lightbulb className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{devices.length}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">System devices</p>
            </CardContent>
          </Card>
        </div>
      )}

      {session?.user.role !== 'admin' && (
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              Your API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">API Key</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={userApiKey || 'Not configured'}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(userApiKey)}
                    disabled={!userApiKey}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">API Base URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value="https://api.thingspeak.com/update"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('https://api.thingspeak.com/update')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            {userApiKey ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">API Access Enabled</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Control your devices below.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">API Key Not Set</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please contact your administrator to configure your ThingSpeak API key.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {session?.user.role !== 'admin' && userApiKey && (
        <>
          <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
                <Power className="h-8 w-8 text-blue-600" />
                Master Control
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">System Status</p>
                  <Badge className={masterSwitch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {masterSwitch ? 'ALL ON' : 'ALL OFF'}
                  </Badge>
                </div>
                <Button
                  onClick={toggleMasterSwitch}
                  size="lg"
                  className={`w-32 h-16 text-lg font-bold transition-all duration-300 ${
                    masterSwitch
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-200'
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-200'
                  } shadow-lg`}
                >
                  {masterSwitch ? 'TURN OFF' : 'TURN ON'}
                </Button>
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Last Update</p>
                  <p className="text-xs text-slate-500">{new Date(analytics.lastSync).toLocaleTimeString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {ledDevices.map((device) => (
              <Card key={device.id} className={`transition-all duration-300 ${
                device.isOn 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 shadow-green-100'
                  : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{device.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        device.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs text-slate-500">{device.status}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <Button
                      onClick={() => toggleLED(device.id)}
                      className={`w-20 h-12 font-semibold transition-all duration-300 ${
                        device.isOn
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                          : 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
                      }`}
                    >
                      {device.isOn ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Last Updated</p>
                    <p className="text-xs text-slate-600">{new Date(device.lastUpdate).toLocaleTimeString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Device Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Real-time Status</h4>
                  <div className="space-y-2">
                    {ledDevices.slice(0, 4).map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                        <span className="text-sm">{device.name}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            device.isOn ? 'bg-green-500' : 'bg-slate-400'
                          }`} />
                          <span className="text-xs text-slate-500">{device.isOn ? 'ON' : 'OFF'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">System Info</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Connection: Stable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Uptime: {analytics.uptime}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">API Status: Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {session?.user.role === 'admin' && (
        <>
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                All Users API Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">API Key</th>
                      <th className="text-left py-3 px-4">Registered</th>
                      <th className="text-left py-3 px-4">Devices</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device: any) => (
                      <tr key={device._id} className="border-b hover:bg-slate-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium">{device.userId.name}</div>
                            <div className="text-sm text-gray-500">{device.userId.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getRoleBadgeColor(device.userId.role)}>
                            {device.userId.role?.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm">
                              {device.userId.thingspeakApiKey ? `${device.userId.thingspeakApiKey.substring(0, 8)}...` : 'Not set'}
                            </span>
                            {device.userId.thingspeakApiKey && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(device.userId.thingspeakApiKey)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm">
                            {new Date(device.userId.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            <span>{device.name}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Total Users
                </CardTitle>
                <Settings className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {Array.from(new Set(devices.map((d: any) => d.userId._id))).length}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Registered users</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Total Devices
                </CardTitle>
                <Lightbulb className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{devices.length}</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">All devices</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  API Keys Set
                </CardTitle>
                <Key className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {devices.filter((d: any) => d.userId.thingspeakApiKey).length}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Configured APIs</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  API Base URL
                </CardTitle>
                <Copy className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-mono text-slate-900 dark:text-white mb-2">
                  https://api.thingspeak.com/update
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard('https://api.thingspeak.com/update')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy URL
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      </div>
    </RoleGuard>
  );
}