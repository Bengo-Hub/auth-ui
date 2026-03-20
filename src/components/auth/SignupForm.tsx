'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { isValidReturnUrl } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, Mail, Lock, Eye, EyeOff, User, Building2, Search,
  CheckCircle2, ChevronRight, ChevronLeft, Zap,
  ArrowRight, AlertCircle, Plus, Shield, Github, Chrome, Cpu,
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


const STEPS = ['Account', 'Organisation'] as const;
type Step = 0 | 1;

const ORG_SIZES = [
  { value: '1-5', label: '1–5 people', icon: '👤' },
  { value: '6-20', label: '6–20 people', icon: '👥' },
  { value: '21-100', label: '21–100 people', icon: '🏢' },
  { value: '100+', label: '100+ people', icon: '🏭' },
];

const USE_CASES = [
  { value: 'hospitality', label: 'Hospitality (Restaurant, Cafe, Bar)' },
  { value: 'retail', label: 'Retail / Shop' },
  { value: 'e_commerce', label: 'Online Store / E-commerce' },
  { value: 'quick_service', label: 'Quick Service / Kiosk' },
  { value: 'food_delivery', label: 'Food Delivery' },
  { value: 'grocery', label: 'Grocery / Supermarket' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'warehousing', label: 'Warehousing' },
  { value: 'logistics', label: 'Logistics / Fleet Management' },
  { value: 'weighbridge', label: 'Weighbridge / Commercial Weighing' },
  { value: 'services', label: 'Services / Professional' },
  { value: 'pharmacy', label: 'Pharmacy / Health' },
  { value: 'other', label: 'Other' },
];


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
  const [useCases, setUseCases] = useState<string[]>([]);
  const [hqBranchName, setHqBranchName] = useState('Main/HQ');

  // Toggle a use case in the multi-select list
  const toggleUseCase = (value: string) => {
    setUseCases((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

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

  const nextStep = () => {
    setError(null);
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) { return; }
    if (step === 1) {
      // Step 1 is the final step — submit directly
      handleSubmit();
      return;
    }
    setStep((s) => Math.min(s + 1, 1) as Step);
  };

  const prevStep = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0) as Step);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);

    setIsLoading(true);

    const tenantSlug = orgAction === 'join_existing'
      ? selectedTenant?.slug || ''
      : newOrgSlug;

    const payload: Record<string, any> = {
      email,
      tenant_slug: tenantSlug,
      org_action: orgAction,
      profile: {
        name,
        org_size: orgSize || undefined,
        use_cases: useCases.length > 0 ? useCases : undefined,
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
        use_cases: useCases,
        hq_branch_name: hqBranchName,
        metadata: {
          org_size: orgSize,
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <StepBar step={step} />

      {error && (
        <div className="flex items-start gap-2 p-4 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === 0 && (
        <Step0
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          isOAuthFlow={isOAuthFlow}
          oauthProvider={oauthProvider}
          oauthPrefillEmail={oauthPrefillEmail}
          socialProviders={socialProviders}
          defaultTenant={defaultTenant}
          returnTo={returnTo}
          clientId={clientId}
          redirectUri={redirectUri}
          stateParam={stateParam}
          scope={scope}
        />
      )}
      {step === 1 && (
        <Step1
          orgAction={orgAction}
          setOrgAction={setOrgAction}
          orgSearch={orgSearch}
          setOrgSearch={setOrgSearch}
          searchResults={searchResults}
          selectedTenant={selectedTenant}
          setSelectedTenant={setSelectedTenant}
          isSearching={isSearching}
          newOrgName={newOrgName}
          setNewOrgName={setNewOrgName}
          newOrgSlug={newOrgSlug}
          setNewOrgSlug={setNewOrgSlug}
          orgSize={orgSize}
          setOrgSize={setOrgSize}
          useCases={useCases}
          toggleUseCase={toggleUseCase}
          hqBranchName={hqBranchName}
          setHqBranchName={setHqBranchName}
        />
      )}
      {/* Subscription plan step removed — all tenants auto-assigned STARTER with free trial */}

      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <Button type="button" onClick={prevStep} variant="outline"
            className="flex-[0_0_auto] h-12 px-6 rounded-xl border-slate-200 dark:border-slate-700">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}

        {step === 0 ? (
          <Button type="button" onClick={nextStep}
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all">
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={nextStep}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Create Account</>
            )}
          </Button>
        )}
      </div>

      {step === 1 && (
        <p className="text-xs text-center text-slate-400 dark:text-slate-500">
          All accounts start with a free STARTER plan.{' '}
          <a href="/terms" className="text-primary hover:underline">Terms</a> &{' '}
          <a href="/privacy" className="text-primary hover:underline">Privacy</a>.
        </p>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepBar({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex-1 flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            i <= step 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            {i + 1}
          </div>
          <span className={`text-xs font-semibold hidden sm:block ${
            i <= step ? 'text-slate-900 dark:text-white' : 'text-slate-400'
          }`}>
            {s}
          </span>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}

function Step0({
  name, setName, email, setEmail, password, setPassword,
  confirmPassword, setConfirmPassword, showPassword, setShowPassword,
  showConfirmPassword, setShowConfirmPassword, isOAuthFlow, oauthProvider,
  oauthPrefillEmail, socialProviders, defaultTenant, returnTo, clientId,
  redirectUri, stateParam, scope
}: any) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-11 rounded-xl" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Work Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input id="email" type="email" placeholder="john@company.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isOAuthFlow} className="pl-10 h-11 rounded-xl" />
        </div>
        {isOAuthFlow && <p className="text-[10px] text-slate-500 flex items-center gap-1"><Shield className="w-3 h-3" /> Verified via {PROVIDER_LABELS[oauthProvider] || oauthProvider}</p>}
      </div>

      {!isOAuthFlow && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-11 rounded-xl" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 pr-10 h-11 rounded-xl" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {!isOAuthFlow && socialProviders.length > 0 && (
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-2 text-slate-400">Or continue with</span></div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {socialProviders.map((p: any) => {
          const Icon = p.name.includes('google') ? Chrome : p.name.includes('github') ? Github : Cpu;
          const startUrl = new URL(`/api/v1/auth/oauth/${p.name.split('_')[0]}/start`, process.env.NEXT_PUBLIC_AUTH_API_URL);
          startUrl.searchParams.set('flow', 'signup');
          if (defaultTenant) startUrl.searchParams.set('tenant_slug', defaultTenant);
          if (clientId) startUrl.searchParams.set('client_id', clientId);
          if (redirectUri) startUrl.searchParams.set('redirect_uri', redirectUri);
          if (stateParam) startUrl.searchParams.set('state', stateParam);
          if (scope) startUrl.searchParams.set('scope', scope);
          if (returnTo) startUrl.searchParams.set('return_to', returnTo);

          return (
            <Button key={p.name} type="button" variant="outline" onClick={() => window.location.href = startUrl.toString()} className="h-11 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <Icon className="w-4 h-4 mr-2" /> {PROVIDER_LABELS[p.name.split('_')[0]]}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function Step1({
  orgAction, setOrgAction, orgSearch, setOrgSearch, searchResults,
  selectedTenant, setSelectedTenant, isSearching, newOrgName, setNewOrgName,
  newOrgSlug, setNewOrgSlug, orgSize, setOrgSize, useCases, toggleUseCase,
  hqBranchName, setHqBranchName
}: any) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
        <button type="button" onClick={() => setOrgAction('join_existing')} className={`py-2 text-sm font-semibold rounded-lg transition-all ${orgAction === 'join_existing' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Join Organisation</button>
        <button type="button" onClick={() => setOrgAction('create_new')} className={`py-2 text-sm font-semibold rounded-lg transition-all ${orgAction === 'create_new' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Create New</button>
      </div>

      {orgAction === 'join_existing' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Find your organisation</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input placeholder="Enter organisation slug..." value={orgSearch} onChange={(e) => setOrgSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
              {isSearching && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-primary" />}
            </div>
          </div>
          <div className="space-y-2">
            {searchResults.map((t: any) => (
              <button key={t.id} type="button" onClick={() => setSelectedTenant(t)} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedTenant?.id === t.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-400">{t.name[0]}</div>
                  <div className="text-left"><p className="font-bold text-slate-900 dark:text-white">{t.name}</p><p className="text-xs text-slate-500">@{t.slug}</p></div>
                </div>
                {selectedTenant?.id === t.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
              </button>
            ))}
            {orgSearch.length >= 2 && !isSearching && searchResults.length === 0 && (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-sm text-slate-500">No organisation found with that slug.</p>
                <button type="button" onClick={() => setOrgAction('create_new')} className="mt-2 text-sm font-bold text-primary hover:underline">Create a new one instead</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Organisation Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input placeholder="Acme Inc." value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} className="pl-10 h-11 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>URL Slug</Label>
            <div className="relative font-mono text-sm">
              <span className="absolute left-3 top-3 text-slate-400">@</span>
              <Input value={newOrgSlug} onChange={(e) => setNewOrgSlug(e.target.value)} className="pl-8 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Primary Branch Name</Label>
            <div className="relative">
              <Zap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input placeholder="Main/HQ" value={hqBranchName} onChange={(e) => setHqBranchName(e.target.value)} className="pl-10 h-11 rounded-xl" />
            </div>
            <p className="text-[10px] text-slate-500">The name of your primary location (e.g. Main/HQ, Downtown, etc.)</p>
          </div>
          <div className="space-y-2">
            <Label>Organisation Size</Label>
            <div className="grid grid-cols-2 gap-2">
              {ORG_SIZES.map((size) => (
                <button key={size.value} type="button" onClick={() => setOrgSize(size.value)} className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${orgSize === size.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>
                  <span>{size.icon}</span> {size.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Use Cases <span className="text-xs text-slate-400 font-normal">(select all that apply)</span></Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {USE_CASES.map((uc) => (
                <button key={uc.value} type="button" onClick={() => toggleUseCase(uc.value)} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs transition-all text-left ${useCases.includes(uc.value) ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>
                  {useCases.includes(uc.value) ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                  {uc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Step2 (Plan selection) removed — all tenants auto-assigned STARTER with free trial */
