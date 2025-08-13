'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User, UserRole } from '@/types';
import { Plus, Edit, Trash2, Users, Settings, Activity, Lightbulb, TrendingUp, Wifi, AlertCircle, CheckCircle, Power } from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';

export default function AdminPanel() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as UserRole,
    thingspeakApiKey: '',
  });
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [analytics, setAnalytics] = useState({
    totalDevices: 0,
    activeDevices: 0,
    systemUptime: 99.5,
    energyEfficiency: 87.3,
    lastSync: new Date()
  });
  const [devices, setDevices] = useState([]);
  const [deviceStates, setDeviceStates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'operator')) return;
    
    const fetchData = async () => {
      try {
        const [usersResponse, devicesResponse, analyticsResponse] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/devices'),
          fetch('/api/admin/analytics')
        ]);
        
        if (usersResponse.ok) {
          const userData = await usersResponse.json();
          setUsers(userData);
        }
        
        if (devicesResponse.ok) {
          const deviceData = await devicesResponse.json();
          setDevices(deviceData);
        }
        
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalytics({
            totalDevices: analyticsData.devices.total,
            activeDevices: analyticsData.devices.active,
            systemUptime: analyticsData.system.uptime,
            energyEfficiency: analyticsData.system.energyEfficiency,
            lastSync: new Date(analyticsData.lastUpdated)
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [session]);

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingUser ? `/api/users/${editingUser._id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const userData = await response.json();
        
        if (editingUser) {
          setUsers(users => users.map(u => u._id === editingUser._id ? userData : u));
          toast.success('User updated successfully');
        } else {
          setUsers(users => [userData, ...users]);
          toast.success('User created successfully');
        }
        
        setShowUserDialog(false);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save user');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users => users.filter(u => u._id !== userId));
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      thingspeakApiKey: user.thingspeakApiKey || '',
    });
    setShowUserDialog(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      thingspeakApiKey: '',
    });
  };

  const setApiKeyForUser = (user: User) => {
    setSelectedUser(user);
    setApiKeyInput(user.thingspeakApiKey || '');
    setShowApiDialog(true);
  };

  const handleSetApiKey = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/admin/set-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser._id, apiKey: apiKeyInput }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(users => users.map(u => 
          u._id === selectedUser._id ? { ...u, thingspeakApiKey: apiKeyInput } : u
        ));
        toast.success('API key updated successfully');
        setShowApiDialog(false);
        setApiKeyInput('');
        setSelectedUser(null);
        
        const refreshResponse = await fetch('/api/users');
        if (refreshResponse.ok) {
          const refreshedUsers = await refreshResponse.json();
          setUsers(refreshedUsers);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update API key');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDeviceControl = async (deviceId: number, newState: boolean) => {
    try {
      const response = await fetch('/api/admin/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: newState ? 'turn_on' : 'turn_off',
          deviceId: `LED_${deviceId}`,
          value: newState ? 1 : 0
        }),
      });

      if (response.ok) {
        setDeviceStates(prev => ({ ...prev, [deviceId]: newState }));
        toast.success(`LED_${deviceId} turned ${newState ? 'ON' : 'OFF'}`);
      } else {
        toast.error('Failed to control device');
      }
    } catch (error) {
      toast.error('Device control error');
    }
  };

  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'operator')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">🚫</span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Administrator or Operator privileges required to access this panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isAdmin = session.user.role === 'admin';
  const isOperator = session.user.role === 'operator';

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'operator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'operator']}>
      <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage users and system configuration
          </p>
        </div>
        <Badge className={`px-4 py-2 font-semibold ${
          isAdmin 
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
        }`}>
          {isAdmin ? '🔒 ADMINISTRATOR' : '⚙️ OPERATOR'}
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Total Users
            </CardTitle>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{users.length}</div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Registered accounts</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">
              Total Devices
            </CardTitle>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{analytics.totalDevices}</div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">Street lights</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              System Uptime
            </CardTitle>
            <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-2 rounded-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{analytics.systemUptime}%</div>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">
              API Keys Set
            </CardTitle>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {users.filter(u => u.thingspeakApiKey).length}
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Configured APIs</p>
          </CardContent>
        </Card>
      </div>

      {/* System Analytics */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            System Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700 dark:text-slate-300">Device Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Online Devices</span>
                  </div>
                  <span className="font-semibold text-green-700">{analytics.activeDevices}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Offline Devices</span>
                  </div>
                  <span className="font-semibold text-slate-600">{analytics.totalDevices - analytics.activeDevices}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700 dark:text-slate-300">Performance</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Connection: Stable</span>
                </div>
                <div className="flex items-center gap-2">
                  <Power className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Energy Efficiency: {analytics.energyEfficiency}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Uptime: {analytics.systemUptime}%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700 dark:text-slate-300">Last Update</h4>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {new Date(analytics.lastSync).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-slate-700 dark:text-slate-300">LED_2 turned ON by user@example.com</p>
                <p className="text-xs text-slate-500">{new Date(Date.now() - 300000).toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-slate-700 dark:text-slate-300">API key updated for new user</p>
                <p className="text-xs text-slate-500">{new Date(Date.now() - 900000).toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-slate-700 dark:text-slate-300">System backup completed successfully</p>
                <p className="text-xs text-slate-500">{new Date(Date.now() - 1800000).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Management */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Device Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => {
              const deviceId = i + 1;
              const isOnline = Math.random() > 0.2;
              const isActive = deviceStates[deviceId] ?? (Math.random() > 0.3);
              return (
                <Card key={deviceId} className={`transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700'
                    : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">LED_{deviceId}</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          isOnline ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="text-xs text-slate-500">{isOnline ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600">Status:</span>
                      <Button
                        size="sm"
                        onClick={() => handleDeviceControl(deviceId, !isActive)}
                        className={`h-6 px-3 text-xs font-semibold ${
                          isActive
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-slate-500 hover:bg-slate-600 text-white'
                        }`}
                      >
                        {isActive ? 'ON' : 'OFF'}
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600">Field:</span>
                      <span className="text-xs font-mono">field{deviceId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600">Last Update:</span>
                      <span className="text-xs text-slate-500">
                        {new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>User Management</span>
            </CardTitle>
            {isAdmin && (
              <Button 
                onClick={() => {
                  resetForm();
                  setShowUserDialog(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">API Key</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                            {user.thingspeakApiKey ? `${user.thingspeakApiKey.substring(0, 8)}...` : 'Not set'}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setApiKeyForUser(user)}
                            className="h-6 w-6 p-0"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Button>
                          {user.thingspeakApiKey && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(user.thingspeakApiKey!);
                                toast.success('API key copied to clipboard');
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {isOperator && (
                            <span className="text-xs text-slate-500">View Only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information and permissions.' : 'Create a new user account with ThingSpeak API access.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password {editingUser && '(leave blank to keep current)'}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="thingspeakApiKey">ThingSpeak API Key</Label>
              <Input
                id="thingspeakApiKey"
                value={formData.thingspeakApiKey}
                onChange={(e) => setFormData({ ...formData, thingspeakApiKey: e.target.value })}
                placeholder="Enter ThingSpeak API Key"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUserDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingUser ? 'Update' : 'Create'} User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set API Key</DialogTitle>
            <DialogDescription>
              Set ThingSpeak API key for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">ThingSpeak API Key</Label>
              <Input
                id="apiKey"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter ThingSpeak API Key"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetApiKey}>
              Set API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </RoleGuard>
  );
}