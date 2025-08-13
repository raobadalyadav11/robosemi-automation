'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ApiConfig } from '@/types';
import { Plus, Edit, Trash2, Settings, Key } from 'lucide-react';

export default function ApiConfigManagement() {
  const { data: session } = useSession();
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ApiConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    apiKey: '',
    channelId: '',
    description: '',
  });

  useEffect(() => {
    if (session?.user.role !== 'admin') return;
    
    const fetchApiConfigs = async () => {
      try {
        const response = await fetch('/api/api-configs');
        if (response.ok) {
          const data = await response.json();
          setApiConfigs(data);
        }
      } catch (error) {
        console.error('Failed to fetch API configs:', error);
        toast.error('Failed to load API configurations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiConfigs();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingConfig ? `/api/api-configs/${editingConfig._id}` : '/api/api-configs';
      const method = editingConfig ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const configData = await response.json();
        
        if (editingConfig) {
          setApiConfigs(configs => configs.map(c => c._id === editingConfig._id ? configData : c));
          toast.success('API configuration updated successfully');
        } else {
          setApiConfigs(configs => [configData, ...configs]);
          toast.success('API configuration created successfully');
        }
        
        setShowDialog(false);
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save API configuration');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this API configuration?')) return;

    try {
      const response = await fetch(`/api/api-configs/${configId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setApiConfigs(configs => configs.filter(c => c._id !== configId));
        toast.success('API configuration deleted successfully');
      } else {
        toast.error('Failed to delete API configuration');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const openEditDialog = (config: ApiConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      apiKey: config.apiKey,
      channelId: config.channelId,
      description: config.description || '',
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingConfig(null);
    setFormData({
      name: '',
      apiKey: '',
      channelId: '',
      description: '',
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
              Administrator privileges required for API management.
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
            API Configuration
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage ThingSpeak API settings and integrations
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-2 font-semibold">
          🔑 API ADMIN
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              API Configurations
            </CardTitle>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{apiConfigs.length}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total configurations</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Active Integrations
            </CardTitle>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
              <Key className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {apiConfigs.length}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Connected APIs</p>
          </CardContent>
        </Card>
      </div>

      {/* API Management */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Key className="h-5 w-5 text-purple-600" />
              <span>ThingSpeak Configurations</span>
            </CardTitle>
            <Button 
              onClick={() => {
                resetForm();
                setShowDialog(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Config
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                <span className="text-slate-600 dark:text-slate-400">Loading configurations...</span>
              </div>
            </div>
          ) : apiConfigs.length > 0 ? (
            <div className="space-y-4">
              {/* Mobile Cards */}
              <div className="block lg:hidden space-y-4">
                {apiConfigs.map((config) => (
                  <div key={config._id} className="p-4 bg-slate-50/50 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{config.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Channel: {config.channelId}</p>
                        <div className="flex items-center space-x-2">
                          <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono">
                            {config.apiKey.substring(0, 12)}...
                          </code>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {config.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(config)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(config._id)}
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
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300 rounded-tl-lg">Name</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Channel ID</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">API Key</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Description</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Created</th>
                      <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiConfigs.map((config, index) => (
                      <tr key={config._id} className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                        index === apiConfigs.length - 1 ? 'border-b-0' : ''
                      }`}>
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">{config.name}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{config.channelId}</td>
                        <td className="p-4">
                          <code className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-sm font-mono border border-slate-200 dark:border-slate-700">
                            {config.apiKey.substring(0, 12)}...
                          </code>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {config.description || 'No description'}
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(config.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(config)}
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(config._id)}
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
                <Key className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">No API configurations</p>
              <p className="text-slate-500 dark:text-slate-500 text-sm">Add your first ThingSpeak configuration to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Configuration Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingConfig ? 'Edit API Configuration' : 'Add New Configuration'}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {editingConfig 
                ? 'Update ThingSpeak API configuration and settings.'
                : 'Configure a new ThingSpeak API integration for IoT control.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Configuration Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Production ThingSpeak Config"
                required
                className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Write API Key
                </Label>
                <Input
                  id="apiKey"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                  placeholder="Your ThingSpeak Write API Key"
                  required
                  className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="channelId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Channel ID
                </Label>
                <Input
                  id="channelId"
                  value={formData.channelId}
                  onChange={(e) => setFormData({...formData, channelId: e.target.value})}
                  placeholder="ThingSpeak Channel ID"
                  required
                  className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of this API configuration and its purpose"
                rows={3}
                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 resize-none"
              />
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
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
              >
                {editingConfig ? 'Update Configuration' : 'Add Configuration'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}