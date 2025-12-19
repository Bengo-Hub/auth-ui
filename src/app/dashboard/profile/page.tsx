'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';
import { Camera, Save, User as UserIcon } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await apiClient.patch('/api/v1/auth/me', {
        name,
        email,
      });
      setUser(response.data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to update profile' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Profile Settings</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
          Manage your public profile and account information.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                <UserIcon className="h-16 w-16 text-slate-300 dark:text-slate-600" />
              </div>
              <button className="absolute bottom-0 right-0 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
                <Camera className="h-5 w-5" />
              </button>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || 'No Name Set'}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{user?.email}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {user?.roles.map(role => (
                <span key={role} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <form onSubmit={handleSave} className="space-y-8">
              {message && (
                <div className={`p-4 rounded-2xl text-sm font-bold ${
                  message.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary/20 focus:border-primary"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary/20 focus:border-primary"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all"
                >
                  {isSaving ? 'Saving Changes...' : (
                    <span className="flex items-center gap-2">
                      <Save className="h-5 w-5" /> Save Changes
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
