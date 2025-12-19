'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import {
    Eye,
    Globe,
    Mail,
    Moon,
    Smartphone
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Account Settings</h1>
        <p className="text-lg text-slate-600 font-light">
          Manage your preferences, notifications, and privacy settings.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Preferences</h2>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Language</p>
                  <p className="text-sm text-slate-500">Select your preferred language for the interface.</p>
                </div>
              </div>
              <Button variant="outline" className="rounded-xl font-bold">English (US)</Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                  <Moon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Dark Mode</p>
                  <p className="text-sm text-slate-500">Toggle between light and dark theme.</p>
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Notifications</h2>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive security alerts and account updates via email.</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Push Notifications</p>
                  <p className="text-sm text-slate-500">Get real-time alerts on your mobile device.</p>
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Privacy</h2>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Public Profile</p>
                  <p className="text-sm text-slate-500">Allow others to see your profile information.</p>
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
