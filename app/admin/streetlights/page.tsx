'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { StreetLight } from '@/types';
import { Plus, Edit, Trash2, Lightbulb } from 'lucide-react';

export default function StreetLightManagement() {
  const { data: session } = useSession();
  const [streetLights, setStreetLights] = useState<StreetLight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingLight, setEditingLight] = useState<StreetLight | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ledNumber: '',
    thingSpeakField: '',
    inputStatusUrl: '',
    currentStatusUrl: '',
  });

  useEffect(() => {
    if (session?.user.role !== 'admin') return;
    
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
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingLight ? `/api/streetlights/${editingLight._id}` : '/api/streetlights';
      const method = editingLight ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ledNumber: parseInt(formData.ledNumber),
        }),
      });

      if (response.ok) {
        const lightData = await response.json();
        
        if (editingLight) {
          setStreetLights(lights => lights.map(l => l._id === editingLight._id ? lightData : l));
          toast.success('Street light updated successfully');
        } else {
          setStreetLights(lights => [lightData, ...lights]);
          toast.success('Street light created successfully');
        }
        
        setShowDialog(false);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save street light');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (lightId: string) => {
    if (!confirm('Are you sure you want to delete this street light?')) return;

    try {
      const response = await fetch(`/api/streetlights/${lightId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStreetLights(lights => lights.filter(l => l._id !== lightId));
        toast.success('Street light deleted successfully');
      } else {
        toast.error('Failed to delete street light');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const openEditDialog = (light: StreetLight) => {
    setEditingLight(light);
    setFormData({
      name: light.name,
      ledNumber: light.ledNumber.toString(),
      thingSpeakField: light.thingSpeakField,
      inputStatusUrl: light.inputStatusUrl || '',
      currentStatusUrl: light.currentStatusUrl || '',
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingLight(null);
    setFormData({
      name: '',
      ledNumber: '',
      thingSpeakField: '',
      inputStatusUrl: '',
      currentStatusUrl: '',
    });
  };

  if (session?.user.role !== 'admin') {
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
              Administrator privileges required to manage devices.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Device Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configure and monitor street light devices
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 font-semibold">
          🔧 DEVICE ADMIN
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Configured lights</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Active Devices
            </CardTitle>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {streetLights.filter(l => l.status === 'on').length}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Currently online</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Offline Devices
            </CardTitle>
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {streetLights.filter(l => l.status === 'off').length}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Currently offline</p>
          </CardContent>
        </Card>
      </div>

      {/* Device Management */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <span>Device Configuration</span>
            </CardTitle>
            <Button 
              onClick={() => {
                resetForm();
                setShowDialog(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </div>
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
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{light.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">LED #{light.ledNumber} • {light.thingSpeakField}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          Created {new Date(light.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${
                        light.status === 'on' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                          : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                      } px-2 py-1 text-xs font-medium`}>
                        {light.status === 'on' ? '• ONLINE' : '○ OFFLINE'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(light)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(light._id)}
                        className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-slate-700">
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300 rounded-tl-lg">Device Name</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">LED #</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Field</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Created</th>
                      <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streetLights.map((light, index) => (
                      <tr key={light._id} className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                        index === streetLights.length - 1 ? 'border-b-0' : ''
                      }`}>
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">{light.name}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">#{light.ledNumber}</td>
                        <td className="p-4">
                          <Badge className={`${
                            light.status === 'on' 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                          } px-3 py-1 font-medium`}>
                            {light.status === 'on' ? '• ONLINE' : '○ OFFLINE'}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{light.thingSpeakField}</td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(light.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(light)}
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(light._id)}
                              className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                <Lightbulb className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">No devices configured</p>
              <p className="text-slate-500 dark:text-slate-500 text-sm">Add your first street light device to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingLight ? 'Edit Device' : 'Add New Device'}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {editingLight 
                ? 'Update device configuration and IoT settings.'
                : 'Configure a new street light device for the system.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Device Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Street Light 01"
                  required
                  className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ledNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  LED Number
                </Label>
                <Input
                  id="ledNumber"
                  type="number"
                  value={formData.ledNumber}
                  onChange={(e) => setFormData({...formData, ledNumber: e.target.value})}
                  placeholder="e.g., 1"
                  required
                  className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thingSpeakField" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                ThingSpeak Field
              </Label>
              <Input
                id="thingSpeakField"
                value={formData.thingSpeakField}
                onChange={(e) => setFormData({...formData, thingSpeakField: e.target.value})}
                placeholder="e.g., field1"
                required
                className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Monitoring URLs (Optional)</h4>
              
              <div className="space-y-2">
                <Label htmlFor="inputStatusUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Input Status Widget URL
                </Label>
                <Input
                  id="inputStatusUrl"
                  value={formData.inputStatusUrl}
                  onChange={(e) => setFormData({...formData, inputStatusUrl: e.target.value})}
                  placeholder="https://thingspeak.com/channels/.../widgets/..."
                  className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentStatusUrl" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Current Status Widget URL
                </Label>
                <Input
                  id="currentStatusUrl"
                  value={formData.currentStatusUrl}
                  onChange={(e) => setFormData({...formData, currentStatusUrl: e.target.value})}
                  placeholder="https://thingspeak.com/channels/.../widgets/..."
                  className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
                />
              </div>
            </div>
            
            <DialogFooter className="space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                className="border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {editingLight ? 'Update Device' : 'Add Device'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}