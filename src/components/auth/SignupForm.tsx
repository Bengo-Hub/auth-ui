'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { isValidReturnUrl } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, Mail, Lock, Eye, EyeOff, User, Building2, Search,
  CheckCircle2, ChevronRight, ChevronLeft, Users, Zap, Crown,
  ArrowRight, AlertCircle, Plus, Shield, Info, Github, Chrome, Cpu,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantResult {
  id: string;
  name: string;
  slug: string;
  status: string;
  metadata?: Record<string, any>;
}

interface SubscriptionPlan {
  id: string;
  planCode: string;
  name: string;
  description: string;
  billingCycle: string;
  basePrice: number;
  currency: string;
  tierOrder: number;
  tierLimitsJSON?: Record<string, any>;
  features?: string[];
  trialDays?: number;
}

const STEPS = ['Account', 'Organisation', 'Plan'] as const;
type Step = 0 | 1 | 2;

const ORG_SIZES = [
  { value: '1-5', label: '1–5 people', icon: '👤' },
  { value: '6-20', label: '6–20 people', icon: '👥' },
  { value: '21-100', label: '21–100 people', icon: '🏢' },
  { value: '100+', label: '100+ people', icon: '🏭' },
];

const USE_CASES = [
  { value: 'food_delivery', label: 'Food Delivery' },
  { value: 'logistics', label: 'Logistics / Courier' },
  { value: 'cafe_restaurant', label: 'Café / Restaurant' },
  { value: 'retail', label: 'Retail / eCommerce' },
  { value: 'other', label: 'Other' },
];

const PLAN_ICONS: Record<string, React.FC<{ className?: string }>> = {
  STARTER: ({ className }) => <Zap className={className} />,
  GROWTH: ({ className }) => <Users className={className} />,
  PROFESSIONAL: ({ className }) => <Crown className={className} />,
};

const PLAN_COLORS: Record<string, string> = {
  STARTER: 'from-sky-500 to-cyan-500',
  GROWTH: 'from-violet-500 to-purple-500',
  PROFESSIONAL: 'from-amber-500 to-orange-500',
};

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  github: 'GitHub',
  microsoft: 'Microsoft',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: activeIntegrations } = useQuery({
    queryKey: ['active_integrations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/auth/integrations/active');
      return data as Array<{ name: string; display_name: string }>;
    },
  });

  const socialProviders = activeIntegrations?.filter(i => 
    ['google_oauth', 'github_oauth', 'microsoft_oauth'].includes(i.name)
  ) || [];

  // OIDC / Redirect params
  const returnTo = searchParams.get('return_to');
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const stateParam = searchParams.get('state');
  const scope = searchParams.get('scope');
  const defaultTenant = searchParams.get('tenant') || '';

  // OAuth2 pre-fill params (set by auth-api when redirecting a new OAuth user to signup)
  const oauthProvider = searchParams.get('oauth_provider') || ''; // e.g. 'google'
  const oauthPrefillName = searchParams.get('oauth_name') || '';
  const oauthPrefillEmail = searchParams.get('oauth_email') || '';
  const oauthToken = searchParams.get('oauth_token') || ''; // short-lived token for account link
  const isOAuthFlow = !!oauthProvider;

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — Account
  const [name, setName] = useState(oauthPrefillName);
  const [email, setEmail] = useState(oauthPrefillEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2 — Organisation
  const [orgAction, setOrgAction] = useState<'join_existing' | 'create_new'>('join_existing');
  const [orgSearch, setOrgSearch] = useState(defaultTenant);
  const [searchResults, setSearchResults] = useState<TenantResult[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [orgSize, setOrgSize] = useState('');
  const [useCase, setUseCase] = useState('');

  // Step 3 — Plan (REQUIRED — account creation is blocked without selection)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [plansLoadFailed, setPlansLoadFailed] = useState(false);

  // ── Subscription plans loader ───────────────────────────────────────────────
  const loadPlans = useCallback(async () => {
    if (plans.length > 0) return;
    setIsLoadingPlans(true);
    setPlansLoadFailed(false);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUBSCRIPTION_API_URL || 'https://pricingapi.codevertexitsolutions.com'}/api/v1/plans?billing_cycle=MONTHLY`,
        { headers: { Accept: 'application/json' } }
      );
      if (res.ok) {
        const data = await res.json();
        const monthlyPlans: SubscriptionPlan[] = (Array.isArray(data) ? data : data.data || [])
          .filter((p: SubscriptionPlan) => p.billingCycle === 'MONTHLY')
          .sort((a: SubscriptionPlan, b: SubscriptionPlan) => a.tierOrder - b.tierOrder);
        setPlans(monthlyPlans);
        // Auto-select lowest tier as default
        if (monthlyPlans.length > 0) setSelectedPlan(monthlyPlans[0].planCode);
      } else {
        setPlansLoadFailed(true);
      }
    } catch {
      setPlansLoadFailed(true);
    } finally {
      setIsLoadingPlans(false);
    }
  }, [plans.length]);

  useEffect(() => {
    if (step === 2) loadPlans();
  }, [step, loadPlans]);

  // ── Org search ──────────────────────────────────────────────────────────────
  const searchOrg = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://sso.codevertexitsolutions.com'}/api/v1/tenants/by-slug/${encodeURIComponent(query)}`,
        { headers: { Accept: 'application/json' } }
      );
      if (res.ok) {
        const tenant: TenantResult = await res.json();
        if (tenant?.id) setSearchResults([tenant]);
        else setSearchResults([]);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (orgAction === 'join_existing') searchOrg(orgSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [orgSearch, orgAction, searchOrg]);

  // Auto-generate slug from org name
  useEffect(() => {
    setNewOrgSlug(
      newOrgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 64)
    );
  }, [newOrgName]);

  // ── Step validation ─────────────────────────────────────────────────────────
  const validateStep0 = () => {
    if (!name.trim()) { setError('Full name is required'); return false; }
    if (!email.trim()) { setError('Email is required'); return false; }
    // Password only required for non-OAuth flows
    if (!isOAuthFlow) {
      if (password.length < 8) { setError('Password must be at least 8 characters'); return false; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return false; }
    }
    return true;
  };

  const validateStep1 = () => {
    if (orgAction === 'join_existing') {
      if (!selectedTenant) { setError('Please search and select an organisation'); return false; }
    } else {
      if (!newOrgName.trim()) { setError('Organisation name is required'); return false; }
      if (!newOrgSlug.trim()) { setError('Organisation slug is required'); return false; }
    }
    return true;
  };

  const validateStep2 = () => {
    // If plans loaded successfully, selection is mandatory
    if (plans.length > 0 && !selectedPlan) {
      setError('Please select a subscription plan to continue');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    setError(null);
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep((s) => Math.min(s + 1, 2) as Step);
  };

  const prevStep = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0) as Step);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);
    if (!validateStep2()) return;

    setIsLoading(true);

    const tenantSlug = orgAction === 'join_existing'
      ? selectedTenant?.slug || ''
      : newOrgSlug;

    const payload: Record<string, any> = {
      email,
      tenant_slug: tenantSlug,
      org_action: orgAction,
      // Selected plan is required — sent as top-level field so auth-api can record it
      selected_plan: selectedPlan,
      profile: {
        name,
        org_size: orgSize || undefined,
        use_case: useCase || undefined,
      },
    };

    // Email+password registration
    if (!isOAuthFlow) {
      payload.password = password;
    }

    // OAuth2 account linking — pass the short-lived token from auth-api
    if (isOAuthFlow) {
      payload.oauth_provider = oauthProvider;
      payload.oauth_token = oauthToken;
    }

    // If creating a new org, pass org metadata
    if (orgAction === 'create_new') {
      payload.new_org = {
        name: newOrgName,
        slug: newOrgSlug,
        metadata: {
          org_size: orgSize,
          use_case: useCase,
        },
      };
    }

    try {
      const endpoint = isOAuthFlow
        ? '/api/v1/auth/register/oauth'
        : '/api/v1/auth/register';
      await apiClient.post(endpoint, payload);

      // Redirect to login preserving OIDC params
      const loginUrl = new URL('/login', window.location.origin);
      if (isValidReturnUrl(returnTo)) loginUrl.searchParams.set('return_to', returnTo!);
      if (clientId) loginUrl.searchParams.set('client_id', clientId);
      if (redirectUri) loginUrl.searchParams.set('redirect_uri', redirectUri);
      if (stateParam) loginUrl.searchParams.set('state', stateParam);
      if (scope) loginUrl.searchParams.set('scope', scope);
      loginUrl.searchParams.set('tenant', tenantSlug);
      loginUrl.searchParams.set('message', 'Account created! Please sign in to continue.');

      router.push(loginUrl.pathname + loginUrl.search);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create account';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render step progress bar ────────────────────────────────────────────────
  const StepBar = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < step
                  ? 'bg-green-500 text-white'
                  : i === step
                  ? 'bg-primary text-white ring-4 ring-primary/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${i === step ? 'text-primary' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${i < step ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          )}
        </div>
      ))}
    </div>
  );

  // ── Step 0: Account Info ────────────────────────────────────────────────────
  const Step0 = () => (
    <div className="space-y-4">
      {/* OAuth2 pre-fill banner */}
      {isOAuthFlow && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Account details pre-filled from <span className="font-bold">{PROVIDER_LABELS[oauthProvider] || oauthProvider}</span>.
            You can update them before continuing.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</Label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            required
            autoFocus={!isOAuthFlow}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // Email is locked if pre-filled from OAuth (verified by provider)
            readOnly={isOAuthFlow && !!oauthPrefillEmail}
            className={`h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${
              isOAuthFlow && oauthPrefillEmail ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            required
          />
        </div>
        {isOAuthFlow && oauthPrefillEmail && (
          <p className="text-xs text-slate-400 ml-1 flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-500" /> Verified by {PROVIDER_LABELS[oauthProvider] || oauthProvider}
          </p>
        )}
      </div>

      {/* Password fields — hidden for OAuth2 flows (no password needed) */}
      {!isOAuthFlow && (
        <>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-12 pr-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 ml-1">At least 8 characters</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 pl-12 pr-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                required
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Social Login buttons */}
      {!isOAuthFlow && socialProviders.length > 0 && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-4 text-slate-500 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {socialProviders.map((provider) => {
              const providerKey = provider.name.replace('_oauth', '');
              const Icon = providerKey === 'google' ? Chrome : providerKey === 'github' ? Github : Cpu;
              
              const handleSocialLogin = () => {
                const startUrl = new URL(`/api/v1/auth/${providerKey}/start`, window.location.origin);
                if (defaultTenant) startUrl.searchParams.set('tenant_slug', defaultTenant);
                if (returnTo) startUrl.searchParams.set('return_to', returnTo);
                
                // Add OIDC/Redirect params if present
                if (clientId) startUrl.searchParams.set('client_id', clientId);
                if (redirectUri) startUrl.searchParams.set('redirect_uri', redirectUri);
                if (stateParam) startUrl.searchParams.set('state', stateParam);
                if (scope) startUrl.searchParams.set('scope', scope);
                
                window.location.href = startUrl.toString();
              };

              return (
                <Button
                  key={provider.name}
                  type="button"
                  variant="outline"
                  className="h-12 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-semibold"
                  onClick={handleSocialLogin}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {provider.display_name}
                </Button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  // ── Step 1: Organisation ────────────────────────────────────────────────────
  const Step1 = () => (
    <div className="space-y-5">
      {/* Toggle join vs create */}
      <div className="grid grid-cols-2 gap-3">
        {(['join_existing', 'create_new'] as const).map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => { setOrgAction(action); setSelectedTenant(null); setSearchResults([]); setError(null); }}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-medium text-sm ${
              orgAction === action
                ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
            }`}
          >
            {action === 'join_existing' ? <Search className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {action === 'join_existing' ? 'Join Existing Org' : 'Create New Org'}
          </button>
        ))}
      </div>

      {orgAction === 'join_existing' ? (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Search Organisation</Label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />}
            <Input
              type="text"
              placeholder="Type org slug (e.g. urban-loft)"
              value={orgSearch}
              onChange={(e) => setOrgSearch(e.target.value)}
              className="h-12 pl-12 pr-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              autoFocus
            />
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setSelectedTenant(t); setSearchResults([]); setOrgSearch(t.name); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    selectedTenant?.id === t.id
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-sky-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{t.name}</p>
                    <p className="text-xs text-slate-400 truncate">@{t.slug}</p>
                  </div>
                  {selectedTenant?.id === t.id && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {selectedTenant && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                You will join <span className="font-bold">{selectedTenant.name}</span> as a member.
                Admin approval may be required.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Organisation Name</Label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input type="text" placeholder="Acme Corp" value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="h-12 pl-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                autoFocus />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Slug (URL identifier)
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
              <Input type="text" placeholder="acme-corp" value={newOrgSlug}
                onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="h-12 pl-8 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono" />
            </div>
            <p className="text-xs text-slate-400">Used in URLs – letters, numbers and hyphens only</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Organisation Size</Label>
            <div className="grid grid-cols-2 gap-2">
              {ORG_SIZES.map((s) => (
                <button key={s.value} type="button"
                  onClick={() => setOrgSize(s.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    orgSize === s.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                  }`}>
                  <span>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Primary Use Case</Label>
            <div className="flex flex-wrap gap-2">
              {USE_CASES.map((uc) => (
                <button key={uc.value} type="button"
                  onClick={() => setUseCase(uc.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    useCase === uc.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                  }`}>
                  {uc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Step 2: Plan Selection (REQUIRED) ────────────────────────────────────────
  const Step2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Choose your subscription plan
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {orgAction === 'join_existing' && selectedTenant
            ? <>You will use <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedTenant.name}</span>'s existing subscription.</>
            : <>All plans start with a <span className="font-semibold text-primary">14-day free trial</span>. You can upgrade or downgrade anytime.</>
          }
        </p>
      </div>

      {isLoadingPlans ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : plansLoadFailed ? (
        // Plans failed to load — warn but still allow proceeding with no plan
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Could not load subscription plans</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                The pricing service may be temporarily unavailable. Your account will be created
                on the free tier. You can select a plan from your dashboard after signing in.
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={loadPlans} className="w-full h-10 rounded-xl text-sm">
            <ArrowRight className="w-4 h-4 mr-2" /> Retry Loading Plans
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => {
            const Icon = PLAN_ICONS[plan.planCode] || Zap;
            const gradient = PLAN_COLORS[plan.planCode] || 'from-sky-500 to-cyan-500';
            const tier = plan.tierLimitsJSON || {};
            const isSelected = selectedPlan === plan.planCode;
            const trialDays = plan.trialDays ?? 14;

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => { setSelectedPlan(plan.planCode); setError(null); }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{plan.name}</p>
                        {trialDays > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                            {trialDays}-day trial
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0">
                        {plan.basePrice === 0 ? (
                          <span className="text-green-600 dark:text-green-400">Free</span>
                        ) : (
                          <>
                            <span className="text-xs font-normal text-slate-400">KES </span>
                            {plan.basePrice.toLocaleString()}
                            <span className="text-xs font-normal text-slate-400">/mo</span>
                          </>
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{plan.description}</p>
                    {(tier.max_riders !== undefined || tier.max_members !== undefined) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        {tier.max_members !== undefined && (
                          <span className="text-xs text-slate-500">
                            👥 {tier.max_members === -1 ? 'Unlimited' : tier.max_members} members
                          </span>
                        )}
                        {tier.max_riders !== undefined && (
                          <span className="text-xs text-slate-500">
                            🛵 {tier.max_riders === -1 ? 'Unlimited' : tier.max_riders} riders
                          </span>
                        )}
                        {tier.max_orders_per_day !== undefined && (
                          <span className="text-xs text-slate-500">
                            📦 {tier.max_orders_per_day === -1 ? 'Unlimited' : tier.max_orders_per_day} orders/day
                          </span>
                        )}
                        {tier.max_outlets !== undefined && (
                          <span className="text-xs text-slate-500">
                            🏪 {tier.max_outlets === -1 ? 'Unlimited' : tier.max_outlets} outlet{tier.max_outlets !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all ${
                    isSelected ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Selection required notice */}
          {plans.length > 0 && !selectedPlan && (
            <p className="text-xs text-center text-amber-600 dark:text-amber-400 font-medium">
              ↑ Please select a plan to complete your registration
            </p>
          )}
        </div>
      )}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <StepBar />

      {error && (
        <div className="flex items-start gap-2 p-4 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === 0 && <Step0 />}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}

      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <Button type="button" onClick={prevStep} variant="outline"
            className="flex-[0_0_auto] h-12 px-6 rounded-xl border-slate-200 dark:border-slate-700">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}

        {step < 2 ? (
          <Button type="button" onClick={nextStep}
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all">
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || (plans.length > 0 && !selectedPlan)}
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Create Account</>
            )}
          </Button>
        )}
      </div>

      {step === 2 && (
        <p className="text-xs text-center text-slate-400 dark:text-slate-500">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-primary hover:underline">Terms</a> and{' '}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
        </p>
      )}
    </div>
  );
}
