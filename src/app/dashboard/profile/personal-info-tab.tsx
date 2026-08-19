'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { PhoneInputField } from '@/components/ui/phone-input';
import { CountrySelect } from '@/components/ui/country-select';
import { useUpdateProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Globe, Loader2, Phone, Save, User as UserIcon } from 'lucide-react';
import { FieldCard } from './field-card';

const TIMEZONES = [
  'UTC', 'Africa/Nairobi', 'Africa/Lagos', 'Africa/Johannesburg', 'Africa/Cairo',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
  'Australia/Sydney', 'Pacific/Auckland',
];

const GENDERS = [
  { value: '', label: "Prefer not to say" },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'sw', label: 'Swahili' },
  { value: 'ar', label: 'Arabic' },
  { value: 'es', label: 'Spanish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'de', label: 'German' },
];

/** Personal Information sub-tab — name/gender/bio/timezone/locale/avatar.
 * Email and Mobile Number management moved to their own sub-tabs (Phase 10). */
export function PersonalInfoTab() {
  const { user } = useAuthStore();
  const profile = ((user as any)?.profile as Record<string, any>) ?? {};
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [name, setName] = useState(profile.name ?? user?.name ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [country, setCountry] = useState(profile.country ?? '');
  const [gender, setGender] = useState(profile.gender ?? '');
  const [timezone, setTimezone] = useState(profile.timezone ?? 'UTC');
  const [locale, setLocale] = useState(profile.locale ?? 'en');
  const [avatarUrl, setAvatarUrl] = useState(profile.profile_picture_url ?? '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isSaving = updateProfile.isPending;
  const inputCls = 'h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await updateProfile.mutateAsync({ name, phone, bio, country, gender, timezone, locale, profile_picture_url: avatarUrl });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    }
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Avatar card */}
      <div className="lg:col-span-1">
        <FieldCard>
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{name || 'No Name Set'}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{user?.email}</p>
            {timezone !== 'UTC' && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                <Globe className="h-3 w-3" />{timezone}
              </p>
            )}
            <div className="w-full mt-2">
              <ImageUploadField
                label="Profile Photo"
                value={avatarUrl}
                onChange={setAvatarUrl}
                onError={(msg) => toast({ title: 'Image not usable', description: msg, variant: 'destructive' })}
                hint="Square photo works best (512 x 512 px recommended)"
                round
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {user?.roles?.map((role) => (
                <span key={role} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </FieldCard>
      </div>

      {/* Form */}
      <div className="lg:col-span-2">
        <FieldCard>
          <div className="space-y-6">
            {message && (
              <div className={`flex items-center gap-2 p-4 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'}`}>
                {message.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone Number
                </Label>
                <PhoneInputField value={phone} onChange={setPhone} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Country
                </Label>
                <CountrySelect
                  value={country}
                  onChange={setCountry}
                  className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Gender</Label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Bio</Label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={280}
                placeholder="A brief description about yourself…"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-slate-400 text-right">{bio.length}/280</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Timezone
                </Label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Language / Locale</Label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {LOCALES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isSaving} className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20">
                {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
              </Button>
            </div>
          </div>
        </FieldCard>
      </div>
    </form>
  );
}
