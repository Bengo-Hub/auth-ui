'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    History,
    Key,
    Monitor,
    Smartphone
} from 'lucide-react';
import { useState } from 'react';

export default function SecurityPage() {
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Security Settings</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
          Protect your account with multi-factor authentication and monitor active sessions.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Password Change */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Key className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Change Password</h2>
              <p className="text-slate-500 dark:text-slate-400">Update your password to keep your account secure.</p>
            </div>
          </div>

          <form className="space-y-6 max-w-md">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Current Password</Label>
              <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">New Password</Label>
              <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Confirm New Password</Label>
              <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
            </div>
            <Button className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-bold">
              Update Password
            </Button>
          </form>
        </motion.div>

        {/* MFA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h2>
                <p className="text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
              </div>
            </div>
            <Button 
              variant={isMfaEnabled ? "outline" : "default"}
              className={`h-14 px-8 rounded-2xl font-bold ${!isMfaEnabled ? 'bg-primary hover:bg-primary/90' : 'dark:border-slate-700 dark:text-white'}`}
              onClick={() => setIsMfaEnabled(!isMfaEnabled)}
            >
              {isMfaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>

          {!isMfaEnabled && (
            <div className="mt-8 p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-400">Your account is less secure</p>
                <p className="text-amber-700 dark:text-amber-500 text-sm">We highly recommend enabling two-factor authentication to protect your account from unauthorized access.</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
              <History className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Sessions</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage and sign out of your active sessions on other devices.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                  <Monitor className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Chrome on Windows <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] uppercase font-black">Current</span></p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Nairobi, Kenya • 192.168.1.1</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Safari on iPhone 15</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Mombasa, Kenya • 10.0.0.5 • 2 days ago</p>
                </div>
              </div>
              <Button variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold">
                Sign Out
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-rose-200 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold">
              Sign Out of All Other Sessions
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
