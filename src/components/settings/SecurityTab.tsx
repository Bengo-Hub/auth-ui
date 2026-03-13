'use client';

import { useSessions, useRevokeSession } from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Key, 
  Monitor, 
  Smartphone, 
  Globe, 
  Clock, 
  Trash2, 
  Loader2,
  Lock
} from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api-client';

export function SecurityTab() {
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { mutate: revokeSession } = useRevokeSession();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const current_password = formData.get('current_password');
    const new_password = formData.get('new_password');
    const confirm_password = formData.get('confirm_password');

    if (new_password !== confirm_password) {
      toast({ title: 'Error', description: 'Passwords don\'t match', variant: 'destructive' });
      return;
    }

    try {
      setPasswordLoading(true);
      await api.post('/api/v1/auth/change-password', {
        current_password,
        new_password,
      });
      toast({ title: 'Success', description: 'Password updated successfully' });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Password Section */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
          <Lock className="h-5 w-5 text-indigo-500" />
          Update Password
        </h3>
        <form onSubmit={handlePasswordChange} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Current Password</Label>
            <Input type="password" name="current_password" required className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none px-4" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">New Password</Label>
            <Input type="password" name="new_password" required className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none px-4" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm New Password</Label>
            <Input type="password" name="confirm_password" required className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none px-4" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button disabled={passwordLoading} className="rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 font-bold h-12 px-8">
              {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
            </Button>
          </div>
        </form>
      </section>

      {/* Sessions Section */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Monitor className="h-5 w-5 text-blue-500" />
          Active Sessions
        </h3>
        <p className="text-sm text-slate-500 mb-8">Manage devices that are currently logged into your account.</p>
        
        <div className="space-y-4">
          {sessionsLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
          ) : sessions?.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                  {session.user_agent.toLowerCase().includes('mobile') ? <Smartphone className="h-6 w-6 text-slate-400" /> : <Monitor className="h-6 w-6 text-slate-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{session.ip_address}</p>
                    {session.is_current && <span className="bg-green-500/10 text-green-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Current</span>}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-1">
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {session.user_agent.split('/')[0]}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last active: {new Date(session.issued_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {!session.is_current && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => revokeSession(session.id)}
                  className="rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
