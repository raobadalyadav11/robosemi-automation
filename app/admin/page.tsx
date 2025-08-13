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
import { Plus, Edit, Trash2, Users, Settings } from 'lucide-react';

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
  });

  useEffect(() => {
    if (session?.user.role !== 'admin') return;
    
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
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
              Administrator privileges required to access this panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'operator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
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
        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 font-semibold">
          🔒 ADMINISTRATOR
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Total Users
            </CardTitle>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{users.length}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Registered accounts</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Administrators
            </CardTitle>
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">System administrators</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Operators
            </CardTitle>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {users.filter(u => u.role === 'operator').length}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Device operators</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>User Management</span>
            </CardTitle>
            <Button 
              onClick={() => {
                resetForm();
                setShowUserDialog(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-slate-600 dark:text-slate-400">Loading users...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile Cards */}
              <div className="block lg:hidden space-y-4">
                {users.map((user) => (
                  <div key={user._id} className="p-4 bg-slate-50/50 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{user.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          Created {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${
                        user.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                        user.role === 'operator' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                        'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      } px-2 py-1 text-xs font-medium`}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {user._id !== session?.user.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                      <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Created</th>
                      <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300 rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user._id} className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                        index === users.length - 1 ? 'border-b-0' : ''
                      }`}>
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">{user.name}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                        <td className="p-4">
                          <Badge className={`${
                            user.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                            user.role === 'operator' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                            'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          } px-3 py-1 font-medium`}>
                            {user.role.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user._id !== session?.user.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user._id)}
                                className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingUser ? 'Edit User' : 'Create New User'}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {editingUser 
                ? 'Update user information and role permissions.'
                : 'Add a new user to the system. They can sign in with these credentials or Google OAuth.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitUser} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="Enter full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="user@example.com"
              />
            </div>
            
            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                  placeholder="Create a secure password"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                User Role
              </Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({...formData, role: value})}>
                <SelectTrigger className="h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User - View only access</SelectItem>
                  <SelectItem value="operator">Operator - Control devices</SelectItem>
                  <SelectItem value="admin">Administrator - Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowUserDialog(false)}
                className="border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}