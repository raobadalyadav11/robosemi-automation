'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings, Database, Key, User } from 'lucide-react';

export default function SystemSetup() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState({
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    apiKey: '',
    channelId: '',
  });

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create admin user
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: setupData.adminName,
          email: setupData.adminEmail,
          password: setupData.adminPassword,
          role: 'admin',
        }),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to create admin user');
      }

      // Create API configuration
      const apiResponse = await fetch('/api/api-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Default ThingSpeak Config',
          apiKey: setupData.apiKey,
          channelId: setupData.channelId,
          description: 'Initial system configuration',
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to create API configuration');
      }

      toast.success('System setup completed successfully!');
      window.location.href = '/auth/signin';
    } catch (error) {
      toast.error('Setup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 dark:border dark:border-slate-700">
          <CardHeader className="space-y-6 text-center pb-8">
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                System Setup
              </CardTitle>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Configure your IoT street light management system
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSetup} className="space-y-8">
              {/* Admin User Setup */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Administrator Account</h3>
                </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="adminName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Full Name
                    </Label>
                    <Input
                      id="adminName"
                      value={setupData.adminName}
                      onChange={(e) => setSetupData({...setupData, adminName: e.target.value})}
                      placeholder="Administrator Name"
                      required
                      className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email Address
                    </Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={setupData.adminEmail}
                      onChange={(e) => setSetupData({...setupData, adminEmail: e.target.value})}
                      placeholder="admin@example.com"
                      required
                      className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={setupData.adminPassword}
                    onChange={(e) => setSetupData({...setupData, adminPassword: e.target.value})}
                    placeholder="Create a strong password"
                    required
                    className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
              </div>

              {/* API Configuration */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-2 rounded-lg">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">ThingSpeak API Configuration</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Write API Key
                    </Label>
                    <Input
                      id="apiKey"
                      value={setupData.apiKey}
                      onChange={(e) => setSetupData({...setupData, apiKey: e.target.value})}
                      placeholder="Your ThingSpeak Write API Key"
                      required
                      className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="channelId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Channel ID
                    </Label>
                    <Input
                      id="channelId"
                      value={setupData.channelId}
                      onChange={(e) => setSetupData({...setupData, channelId: e.target.value})}
                      placeholder="ThingSpeak Channel ID"
                      required
                      className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Setting up system...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Complete Setup</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}