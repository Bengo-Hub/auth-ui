'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { isValidReturnUrl } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Chrome, Cpu,
    Eye, EyeOff,
    Github,
    Loader2,
    Lock,
    Mail,
    Search,
    Shield,
    User,
    Zap
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantResult {
  id: string;
  name: string;
  slug: string;
  status: string;
  metadata?: Record<string, any>;
}


// Fixed step indices: 0 = Account, 1 = Verify Email, 2 = Organisation.
// OAuth signups carry a provider-verified email and skip step 1; joining an
// existing org skips step 2. StepBar derives the visible labels per flow.
type Step = 0 | 1 | 2;

const ORG_SIZES = [
  { value: '1-5', label: '1–5 people', icon: '👤' },
  { value: '6-20', label: '6–20 people', icon: '👥' },
  { value: '21-100', label: '21–100 people', icon: '🏢' },
  { value: '100+', label: '100+ people', icon: '🏭' },
];

const USE_CASES = [
  { value: 'fbo', label: 'Forever Living Products (FBO)' },
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
  { value: 'isp', label: 'ISP / Telecom (Internet Service Provider)' },
  { value: 'hotspot', label: 'Hotspot Business (WiFi vouchers)' },
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
  // When a tenant slug is provided, we auto-join that org and skip Step 2
  const hasTenantContext = !!defaultTenant;

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
  const [tenantAutoResolved, setTenantAutoResolved] = useState(false);

  // Step 1 — Account
  const [name, setName] = useState(oauthPrefillName);
  const [email, setEmail] = useState(oauthPrefillEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 1 — Email verification (email/password signups only)
  const [emailVerified, setEmailVerified] = useState(false);
  const [codeSending, setCodeSending] = useState(false);

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
  const [distribId, setDistribId] = useState(''); // FLP distributor ID (used as slug for FBO tenants)
  const [phoneNumber, setPhoneNumber] = useState(''); // Required for FBO
  const isFBO = useCases.includes('fbo');

  // ISP / Telecom provider fields (shown when the 'isp' use-case is selected)
  const [ispProviderName, setIspProviderName] = useState('');   // ISP provider/brand name
  const [ispLicenceNumber, setIspLicenceNumber] = useState(''); // Licence/registration number (optional)
  const [ispWhatsapp, setIspWhatsapp] = useState('');           // Primary WhatsApp phone (required)
  const [ispCoverageArea, setIspCoverageArea] = useState('');   // Service coverage area (optional)
  // Both ISP and Hotspot are isp-billing onboarded — they capture the same ISP
  // provider fields and must be tagged so isp-billing's consumer mirrors the org.
  const isHotspot = useCases.includes('hotspot');
  const isISP = useCases.includes('isp') || isHotspot;

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
      const res = await apiClient.get<TenantResult>(
        `/api/v1/tenants/by-slug/${encodeURIComponent(query)}`,
      );
      const tenant = (res as any)?.data ?? res;
      if (tenant?.id) setSearchResults([tenant as TenantResult]);
      else setSearchResults([]);
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

  // Auto-resolve tenant from defaultTenant slug on mount (background, skip Step 2)
  useEffect(() => {
    if (!defaultTenant || tenantAutoResolved) return;
    (async () => {
      try {
        const res = await apiClient.get<TenantResult>(
          `/api/v1/tenants/by-slug/${encodeURIComponent(defaultTenant)}`,
        );
        const tenant = (res as any)?.data ?? res;
        if (tenant?.id) {
          setSelectedTenant(tenant as TenantResult);
          setOrgAction('join_existing');
          setTenantAutoResolved(true);
        }
      } catch {
        // Silent failure — user can still manually select org if auto-resolve fails
      }
    })();
  }, [defaultTenant, tenantAutoResolved]);

  // Auto-generate slug: FBO uses distributor ID as slug; others use org name
  useEffect(() => {
    if (isFBO && distribId.trim()) {
      // FBO: slug = distributor ID (numeric, no transformation)
      setNewOrgSlug(distribId.trim());
    } else {
      setNewOrgSlug(
        newOrgName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 64)
      );
    }
  }, [newOrgName, isFBO, distribId]);

  // FBO: auto-fill org name from Step 1 name
  useEffect(() => {
    if (isFBO && name.trim() && !newOrgName) {
      setNewOrgName(name.trim());
    }
  }, [isFBO, name, newOrgName]);

  // ── Step validation ─────────────────────────────────────────────────────────
  // Toast-style password feedback instead of harsh error banner
  const [passwordHint, setPasswordHint] = useState<string | null>(null);

  const validateStep0 = () => {
    if (!name.trim()) { setError('Full name is required'); return false; }
    if (!email.trim()) { setError('Email is required'); return false; }
    if (!isOAuthFlow) {
      if (password.length < 8) {
        setPasswordHint('Password must be at least 8 characters. Use a mix of letters, numbers, and symbols.');
        setTimeout(() => setPasswordHint(null), 5000);
        return false;
      }
      if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        setPasswordHint('Tip: Include at least one uppercase letter and one number for a strong password.');
        setTimeout(() => setPasswordHint(null), 5000);
        return false;
      }
      if (password !== confirmPassword) {
        setPasswordHint('Passwords do not match. Please re-enter your confirmation password.');
        setTimeout(() => setPasswordHint(null), 5000);
        return false;
      }
    }
    if (!termsAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy to create an account.');
      return false;
    }
    setPasswordHint(null);
    return true;
  };

  const validateStep1 = () => {
    if (orgAction === 'join_existing') {
      if (!selectedTenant) { setError('Please search and select an organisation'); return false; }
    } else {
      if (!newOrgName.trim()) { setError('Organisation name is required'); return false; }
      if (isFBO && !distribId.trim()) { setError('FLP Distributor ID is required for FBO registration'); return false; }
      if (isFBO && !phoneNumber.trim()) { setError('Phone number is required for FBO registration (WhatsApp contact)'); return false; }
      if (isISP && !ispProviderName.trim()) { setError('ISP provider name is required'); return false; }
      if (isISP && !ispWhatsapp.trim()) { setError('Primary WhatsApp phone is required for ISP registration'); return false; }
      if (!newOrgSlug.trim()) { setError('Organisation slug is required'); return false; }
    }
    return true;
  };

  // Send a verification code to the entered email. Returns true on success.
  const sendEmailCode = async (): Promise<boolean> => {
    setError(null);
    setCodeSending(true);
    try {
      await apiClient.post('/api/v1/auth/email/send-code', {
        email,
        tenant_slug: defaultTenant || undefined,
      });
      return true;
    } catch (err: any) {
      const code = err.response?.data?.code;
      if (code === 'email_exists') {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to send verification code. Please try again.');
      }
      return false;
    } finally {
      setCodeSending(false);
    }
  };

  // Confirm the verification code. Throws on failure (handled by the verify step).
  const verifyEmailCode = async (code: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/email/verify-code', { email, code });
  };

  // Called by the verify step once the OTP is confirmed.
  const handleEmailVerified = () => {
    setEmailVerified(true);
    // Joining an existing org (tenant context) has no org step — submit now.
    if (hasTenantContext) { handleSubmit(); return; }
    setStep(2);
  };

  const nextStep = async () => {
    setError(null);
    if (step === 0) {
      if (!validateStep0()) return;
      if (isOAuthFlow) {
        // Provider-verified email — skip the verification step.
        if (hasTenantContext && tenantAutoResolved && selectedTenant) { handleSubmit(); return; }
        setStep(2);
        return;
      }
      // Email/password: require email verification before continuing.
      const sent = await sendEmailCode();
      if (sent) setStep(1);
      return;
    }
    if (step === 2) {
      if (!validateStep1()) return;
      handleSubmit();
      return;
    }
  };

  const prevStep = () => {
    setError(null);
    if (step === 2) { setStep(isOAuthFlow ? 0 : 1); return; }
    if (step === 1) { setStep(0); return; }
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
      terms_accepted: termsAccepted,
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
      // Tag the tenant's PRIMARY use_case explicitly for ISP/Hotspot onboarding.
      // auth-api derives tenant.use_case from new_org.use_case (preferred) and only
      // falls back to use_cases[0] when it is empty — relying on array ordering is
      // fragile (a non-ISP toggle selected first would mis-tag the tenant and the
      // isp-billing consumer, which keys off use_case == "isp", would ignore it).
      // The isp-billing consumer accepts "isp" but not "hotspot", so both onboard
      // as use_case "isp"; the hotspot distinction is preserved in metadata.
      const primaryUseCase = isISP ? 'isp' : (useCases[0] || undefined);
      payload.new_org = {
        name: newOrgName,
        slug: newOrgSlug,
        use_case: primaryUseCase,
        use_cases: useCases,
        hq_branch_name: hqBranchName,
        metadata: {
          org_size: orgSize,
          // ISP / Telecom provider details (shown for the 'isp' or 'hotspot' use-case)
          ...(isISP
            ? {
                isp_business_type: isHotspot ? 'hotspot' : 'isp',
                isp_provider_name: ispProviderName,
                isp_licence_number: ispLicenceNumber || undefined,
                isp_whatsapp: ispWhatsapp,
                isp_coverage_area: ispCoverageArea || undefined,
              }
            : {}),
        },
      };
    }

    try {
      const endpoint = isOAuthFlow
        ? '/api/v1/auth/register/oauth'
        : '/api/v1/auth/register';
      await apiClient.post(endpoint, payload);

      // For OAuth flows, session is already established by auth-api
      // Redirect directly to callback to complete redirect flow
      if (isOAuthFlow) {
        const callbackUrl = new URL('/auth/callback', window.location.origin);
        if (isValidReturnUrl(returnTo)) callbackUrl.searchParams.set('return_to', returnTo!);
        if (clientId) callbackUrl.searchParams.set('client_id', clientId);
        if (redirectUri) callbackUrl.searchParams.set('redirect_uri', redirectUri);
        if (stateParam) callbackUrl.searchParams.set('state', stateParam);
        if (scope) callbackUrl.searchParams.set('scope', scope);
        router.push(callbackUrl.pathname + callbackUrl.search);
        return;
      }

      // For non-OAuth flows, redirect to login so user signs in with their password
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
      {/* Step bar adapts: OAuth skips "Verify Email"; joining an org skips "Organisation". */}
      <StepBar step={step} isOAuthFlow={isOAuthFlow} hasTenantContext={hasTenantContext} />

      {error && (
        <div className="flex items-start gap-2 p-4 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {passwordHint && (
        <div className="flex items-start gap-2 p-3 text-sm text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 border border-amber-200 dark:border-amber-700 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{passwordHint}</span>
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
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
        />
      )}
      {/* Step 1 — email verification (email/password signups only) */}
      {step === 1 && !isOAuthFlow && (
        <StepVerifyEmail
          email={email}
          codeSending={codeSending}
          verifyEmailCode={verifyEmailCode}
          resend={sendEmailCode}
          onVerified={handleEmailVerified}
        />
      )}
      {/* Step 2 — organisation. Subscription plan step removed (auto-assigned trial). */}
      {step === 2 && !hasTenantContext && (
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
          distribId={distribId}
          setDistribId={setDistribId}
          isFBO={isFBO}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          isISP={isISP}
          isHotspot={isHotspot}
          ispProviderName={ispProviderName}
          setIspProviderName={setIspProviderName}
          ispLicenceNumber={ispLicenceNumber}
          setIspLicenceNumber={setIspLicenceNumber}
          ispWhatsapp={ispWhatsapp}
          setIspWhatsapp={setIspWhatsapp}
          ispCoverageArea={ispCoverageArea}
          setIspCoverageArea={setIspCoverageArea}
        />
      )}

      {/* The verify step (1) owns its own action buttons. */}
      {step !== 1 && (
        <div className="flex gap-3 pt-2">
          {step === 2 && (
            <Button type="button" onClick={prevStep} variant="outline"
              className="flex-[0_0_auto] h-12 px-6 rounded-xl border-slate-200 dark:border-slate-700">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}

          {step === 0 && !(isOAuthFlow && hasTenantContext) ? (
            <Button type="button" onClick={nextStep} disabled={codeSending}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {codeSending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isLoading || (hasTenantContext && !tenantAutoResolved)}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Create Account</>
              )}
            </Button>
          )}
        </div>
      )}

      {step === 2 && !hasTenantContext && (
        <p className="text-xs text-center text-slate-400 dark:text-slate-500">
          All accounts start with a free STARTER plan.
        </p>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepBar({ step, isOAuthFlow, hasTenantContext }: { step: Step; isOAuthFlow: boolean; hasTenantContext: boolean }) {
  // Build the visible steps for this flow. OAuth has a provider-verified email so
  // "Verify Email" is dropped; joining an existing org drops "Organisation".
  const steps: string[] = ['Account'];
  if (!isOAuthFlow) steps.push('Verify Email');
  if (!hasTenantContext) steps.push('Organisation');
  if (steps.length <= 1) return null; // single-step flow — no bar needed

  // Map the fixed step index (0 Account / 1 Verify / 2 Org) to the visible index.
  let current = 0;
  if (step === 1) current = isOAuthFlow ? 0 : 1;
  else if (step === 2) current = steps.length - 1;

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex-1 flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            i <= current
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            {i + 1}
          </div>
          <span className={`text-xs font-semibold hidden sm:block ${
            i <= current ? 'text-slate-900 dark:text-white' : 'text-slate-400'
          }`}>
            {s}
          </span>
          {i < steps.length - 1 && (
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}

function StepVerifyEmail({
  email, codeSending, verifyEmailCode, resend, onVerified,
}: {
  email: string;
  codeSending: boolean;
  verifyEmailCode: (code: string) => Promise<void>;
  resend: () => Promise<boolean>;
  onVerified: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resentAt, setResentAt] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join('');

  // Resend cooldown countdown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => { inputsRef.current[0]?.focus(); }, []);

  const submit = useCallback(async (full: string) => {
    setVerifying(true);
    setError(null);
    try {
      await verifyEmailCode(full);
      onVerified();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'The code is incorrect or has expired.');
      setDigits(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  }, [verifyEmailCode, onVerified]);

  const setDigit = (i: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length > 1) {
      // Paste of a full code
      const next = clean.slice(0, 6).split('');
      const padded = [...next, ...Array(6 - next.length).fill('')];
      setDigits(padded);
      if (next.length === 6) submit(next.join(''));
      else inputsRef.current[Math.min(next.length, 5)]?.focus();
      return;
    }
    setDigits((prev) => {
      const copy = [...prev];
      copy[i] = clean;
      const joined = copy.join('');
      if (clean && i < 5) inputsRef.current[i + 1]?.focus();
      if (joined.length === 6 && !joined.includes('')) submit(joined);
      return copy;
    });
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const handleResend = async () => {
    const ok = await resend();
    if (ok) { setResentAt(Date.now()); setCooldown(45); setError(null); }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verify your email</h3>
        <p className="text-sm text-slate-500">
          We sent a 6-digit code to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>.
        </p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            disabled={verifying}
            className="w-11 h-14 sm:w-12 text-center text-xl font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-60"
          />
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {resentAt && !error && (
        <p className="text-xs text-center text-emerald-600 dark:text-emerald-400">A new code has been sent.</p>
      )}

      <Button
        type="button"
        onClick={() => submit(code)}
        disabled={verifying || code.length !== 6}
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : (<><CheckCircle2 className="w-4 h-4 mr-2" /> Verify &amp; Continue</>)}
      </Button>

      <div className="text-center text-sm">
        <span className="text-slate-500">Didn&apos;t get it? </span>
        <button
          type="button"
          onClick={handleResend}
          disabled={codeSending || cooldown > 0}
          className="font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : codeSending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
    </div>
  );
}

function Step0({
  name, setName, email, setEmail, password, setPassword,
  confirmPassword, setConfirmPassword, showPassword, setShowPassword,
  showConfirmPassword, setShowConfirmPassword, isOAuthFlow, oauthProvider,
  oauthPrefillEmail, socialProviders, defaultTenant, returnTo, clientId,
  redirectUri, stateParam, scope, termsAccepted, setTermsAccepted,
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
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Min 8 chars, at least 1 uppercase letter and 1 number
          </p>
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

      {/* Terms & Privacy acceptance — required before account creation */}
      <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
        termsAccepted
          ? 'border-primary bg-primary/5'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}>
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
            termsAccepted
              ? 'bg-primary border-primary'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
          }`}>
            {termsAccepted && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed select-none">
          I have read and agree to the{' '}
          <a
            href="/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-primary hover:underline"
          >
            Terms of Service
          </a>
          {' '}and{' '}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-primary hover:underline"
          >
            Privacy Policy
          </a>
          . <span className="text-rose-500">*</span>
        </span>
      </label>
    </div>
  );
}

function Step1({
  orgAction, setOrgAction, orgSearch, setOrgSearch, searchResults,
  selectedTenant, setSelectedTenant, isSearching, newOrgName, setNewOrgName,
  newOrgSlug, setNewOrgSlug, orgSize, setOrgSize, useCases, toggleUseCase,
  hqBranchName, setHqBranchName, distribId, setDistribId, isFBO,
  phoneNumber, setPhoneNumber,
  isISP, isHotspot, ispProviderName, setIspProviderName, ispLicenceNumber, setIspLicenceNumber,
  ispWhatsapp, setIspWhatsapp, ispCoverageArea, setIspCoverageArea,
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
            <Label>Organisation Size</Label>
            <div className="grid grid-cols-2 gap-2">
              {ORG_SIZES.map((size) => (
                <button key={size.value} type="button" onClick={() => setOrgSize(size.value)} className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${orgSize === size.value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>
                  <span>{size.icon}</span> {size.label}
                </button>
              ))}
            </div>
          </div>
          {/* Use Cases selector — placed ABOVE the conditional industry fields it
              reveals, so users always see the extra fields appear directly below. */}
          <div className="space-y-2">
            <Label>Use Cases <span className="text-xs text-slate-400 font-normal">(select all that apply)</span></Label>
            <div className="grid grid-cols-2 gap-2 max-h-44 sm:max-h-56 overflow-y-auto">
              {USE_CASES.map((uc) => (
                <button key={uc.value} type="button" onClick={() => toggleUseCase(uc.value)} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs transition-all text-left ${useCases.includes(uc.value) ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>
                  {useCases.includes(uc.value) ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />}
                  {uc.label}
                </button>
              ))}
            </div>
          </div>
          {/* Conditional industry fields — render directly below the Use Cases
              selector that triggers them. */}
          {isFBO && (
            <div className="space-y-4 p-3 rounded-xl border border-primary/30 bg-primary/[0.03] animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-2">
                <Label>FLP Distributor ID <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input placeholder="e.g. 254200047984" value={distribId} onChange={(e) => setDistribId(e.target.value.replace(/\D/g, ''))} className="pl-10 h-11 rounded-xl" />
                </div>
                <p className="text-[10px] text-slate-500">Your Forever Living Products distributor ID — used as your unique business identifier</p>
              </div>
              <div className="space-y-2">
                <Label>WhatsApp / Phone Number <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 text-xs">📱</span>
                  <Input placeholder="e.g. 0743793901 or 254743793901" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+\s-]/g, ''))} className="pl-10 h-11 rounded-xl" />
                </div>
                <p className="text-[10px] text-slate-500">Your WhatsApp number for customer enquiries. Supports KE, UG, TZ, RW, BI, ET country codes.</p>
              </div>
            </div>
          )}
          {isISP && (
            <div className="space-y-4 p-3 rounded-xl border border-primary/30 bg-primary/[0.03] animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-2">
                <Label>{isHotspot ? 'Hotspot Business Name' : 'ISP Provider Name'} <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input placeholder={isHotspot ? 'e.g. SpotConnect WiFi' : 'e.g. SwiftNet Fibre'} value={ispProviderName} onChange={(e: any) => setIspProviderName(e.target.value)} className="pl-10 h-11 rounded-xl" />
                </div>
                <p className="text-[10px] text-slate-500">{isHotspot ? 'Your hotspot / WiFi business brand name' : 'Your internet service provider / telecom brand name'}</p>
              </div>
              <div className="space-y-2">
                <Label>Licence / Registration Number <span className="text-xs text-slate-400 font-normal">(optional)</span></Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input placeholder="e.g. CA/LIC/ISP/0123" value={ispLicenceNumber} onChange={(e: any) => setIspLicenceNumber(e.target.value)} className="pl-10 h-11 rounded-xl" />
                </div>
                <p className="text-[10px] text-slate-500">Regulatory licence or business registration number, if available</p>
              </div>
              <div className="space-y-2">
                <Label>Primary WhatsApp Phone <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 text-xs">📱</span>
                  <Input placeholder="e.g. 0743793901 or 254743793901" value={ispWhatsapp} onChange={(e: any) => setIspWhatsapp(e.target.value.replace(/[^0-9+\s-]/g, ''))} className="pl-10 h-11 rounded-xl" />
                </div>
                <p className="text-[10px] text-slate-500">Your primary WhatsApp number for subscriber support and billing notices.</p>
              </div>
              <div className="space-y-2">
                <Label>Service Coverage Area <span className="text-xs text-slate-400 font-normal">(optional)</span></Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input placeholder="e.g. Nairobi CBD, Westlands, Kiambu" value={ispCoverageArea} onChange={(e: any) => setIspCoverageArea(e.target.value)} className="pl-10 h-11 rounded-xl" />
                </div>
                <p className="text-[10px] text-slate-500">The towns, estates, or regions your network serves</p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>URL Slug</Label>
            <div className="relative font-mono text-sm">
              <span className="absolute left-3 top-3 text-slate-400">@</span>
              <Input value={newOrgSlug} readOnly disabled className="pl-8 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-70" />
            </div>
            <p className="text-[10px] text-slate-500">{isFBO ? 'Set from your distributor ID' : 'Auto-generated from organisation name'}</p>
          </div>
          <div className="space-y-2">
            <Label>Primary Branch Name</Label>
            <div className="relative">
              <Zap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input placeholder="Main/HQ" value={hqBranchName} onChange={(e) => setHqBranchName(e.target.value)} className="pl-10 h-11 rounded-xl" />
            </div>
            <p className="text-[10px] text-slate-500">The name of your primary location (e.g. Main/HQ, Downtown, etc.)</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* Step2 (Plan selection) removed — all tenants auto-assigned STARTER with free trial */
