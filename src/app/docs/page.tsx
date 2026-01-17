'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Book,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Key,
  Lock,
  Shield,
  Terminal,
  Zap,
  ChevronRight,
  FileJson,
  Users,
  RefreshCw,
  LogIn,
  Settings,
  Smartphone,
  Globe,
  ArrowRight,
} from 'lucide-react';

const PRODUCTION_API_URL = 'https://sso.codevertexitsolutions.com';

function CodeBlock({ code, language = 'bash', title }: { code: string; language?: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            {language}
          </span>
        </div>
      )}
      <div className="relative">
        <pre className="bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 p-4 sm:p-6 overflow-x-auto text-sm font-mono leading-relaxed">
          <code className="block whitespace-pre">{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary transition-all shadow-sm border border-slate-200 dark:border-slate-600"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function EndpointCard({
  method,
  path,
  description,
  auth = true,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth?: boolean;
}) {
  const methodColors = {
    GET: 'bg-emerald-500 dark:bg-emerald-600',
    POST: 'bg-sky-500 dark:bg-sky-600',
    PUT: 'bg-amber-500 dark:bg-amber-600',
    DELETE: 'bg-rose-500 dark:bg-rose-600',
    PATCH: 'bg-violet-500 dark:bg-violet-600',
  };

  return (
    <div className="group p-4 sm:p-5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
        <span className={`${methodColors[method]} text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm`}>
          {method}
        </span>
        <code className="text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 break-all">{path}</code>
        {auth && (
          <span className="ml-auto flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline">Auth</span>
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, badge }: { icon: React.ElementType; title: string; badge?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      {badge && (
        <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-primary/20 to-sky-500/20 rounded-2xl">
                <Book className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
                  Developer Documentation
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Codevertex SSO API Reference & Integration Guide
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12"
          >
            <a
              href={`${PRODUCTION_API_URL}/v1/docs/`}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <FileJson className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                Swagger UI
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Interactive API documentation with try-it-out functionality
              </p>
            </a>

            <a
              href={`${PRODUCTION_API_URL}/api/v1/openapi.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <Code2 className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                OpenAPI Spec
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Download the OpenAPI 3.0 specification for code generation
              </p>
            </a>

            <Link
              href="/dashboard/developer"
              className="group p-5 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 sm:col-span-2 lg:col-span-1"
            >
              <Key className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                Developer Portal
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Create OAuth clients and manage API credentials
              </p>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Quick Start</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Base URL</h3>
                <CodeBlock code={PRODUCTION_API_URL} title="Production API" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Authentication</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  All authenticated endpoints require a Bearer token in the Authorization header:
                </p>
                <CodeBlock
                  title="Authenticated Request"
                  language="bash"
                  code={`curl -X GET "${PRODUCTION_API_URL}/api/v1/auth/me" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json"`}
                />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Example: User Login</h3>
                <CodeBlock
                  title="Login Request"
                  language="bash"
                  code={`curl -X POST "${PRODUCTION_API_URL}/api/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "your_password",
    "tenant_slug": "your-tenant"
  }'`}
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">Response</h3>
                <CodeBlock
                  title="Success Response"
                  language="json"
                  code={`{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "roles": ["customer"]
  }
}`}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex items-center gap-3 mb-8 sm:mb-12"
          >
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">API Endpoints</h2>
          </motion.div>

          {/* Authentication */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-10 sm:mb-14"
          >
            <SectionHeader icon={LogIn} title="Authentication" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="POST" path="/api/v1/auth/register" description="Create a new user account" auth={false} />
              <EndpointCard method="POST" path="/api/v1/auth/login" description="Authenticate with email and password" auth={false} />
              <EndpointCard method="POST" path="/api/v1/auth/refresh" description="Refresh an expired access token" auth={false} />
              <EndpointCard method="GET" path="/api/v1/auth/me" description="Get current authenticated user" />
              <EndpointCard method="POST" path="/api/v1/auth/logout" description="Invalidate the current session" />
              <EndpointCard method="POST" path="/api/v1/auth/password-reset/request" description="Request password reset email" auth={false} />
              <EndpointCard method="POST" path="/api/v1/auth/password-reset/confirm" description="Confirm password reset with token" auth={false} />
            </div>
          </motion.div>

          {/* OAuth Providers */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-10 sm:mb-14"
          >
            <SectionHeader icon={Globe} title="OAuth Providers" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="POST" path="/api/v1/auth/oauth/google/start" description="Start Google OAuth flow" auth={false} />
              <EndpointCard method="GET" path="/api/v1/auth/oauth/google/callback" description="Handle Google OAuth callback" auth={false} />
              <EndpointCard method="POST" path="/api/v1/auth/oauth/github/start" description="Start GitHub OAuth flow" auth={false} />
              <EndpointCard method="GET" path="/api/v1/auth/oauth/github/callback" description="Handle GitHub OAuth callback" auth={false} />
              <EndpointCard method="POST" path="/api/v1/auth/oauth/microsoft/start" description="Start Microsoft OAuth flow" auth={false} />
              <EndpointCard method="GET" path="/api/v1/auth/oauth/microsoft/callback" description="Handle Microsoft OAuth callback" auth={false} />
            </div>
          </motion.div>

          {/* MFA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-10 sm:mb-14"
          >
            <SectionHeader icon={Smartphone} title="Multi-Factor Authentication" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="POST" path="/api/v1/auth/mfa/totp/start" description="Start TOTP setup (returns QR code)" />
              <EndpointCard method="POST" path="/api/v1/auth/mfa/totp/confirm" description="Confirm TOTP setup with code" />
              <EndpointCard method="POST" path="/api/v1/auth/mfa/backup-codes/regenerate" description="Generate new backup codes" />
              <EndpointCard method="POST" path="/api/v1/auth/mfa/backup-codes/consume" description="Use a backup code for authentication" />
            </div>
          </motion.div>

          {/* OIDC */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-10 sm:mb-14"
          >
            <SectionHeader icon={RefreshCw} title="OpenID Connect" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="GET" path="/.well-known/openid-configuration" description="OIDC discovery document" auth={false} />
              <EndpointCard method="GET" path="/.well-known/jwks.json" description="JSON Web Key Set for token verification" auth={false} />
              <EndpointCard method="GET" path="/api/v1/authorize" description="OAuth2 authorization endpoint" auth={false} />
              <EndpointCard method="POST" path="/api/v1/token" description="OAuth2 token endpoint" auth={false} />
              <EndpointCard method="GET" path="/api/v1/userinfo" description="Get user info from access token" />
            </div>
          </motion.div>

          {/* Admin */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <SectionHeader icon={Settings} title="Admin & Tenant Management" badge="Admin Scope Required" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <EndpointCard method="POST" path="/api/v1/admin/tenants" description="Create a new tenant" />
              <EndpointCard method="GET" path="/api/v1/admin/tenants" description="List all tenants" />
              <EndpointCard method="POST" path="/api/v1/admin/clients" description="Create an OAuth client" />
              <EndpointCard method="GET" path="/api/v1/admin/clients" description="List OAuth clients" />
              <EndpointCard method="POST" path="/api/v1/admin/entitlements" description="Manage service entitlements" />
              <EndpointCard method="POST" path="/api/v1/admin/keys/rotate" description="Rotate signing keys" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* SDK Integration */}
      <section className="py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex items-center gap-3 mb-8"
          >
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">SDK Integration</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                JavaScript / TypeScript
              </h3>
              <CodeBlock
                title="Installation & Usage"
                language="typescript"
                code={`// Install the SDK
npm install @codevertex/auth-client

// Initialize the client
import { AuthClient } from '@codevertex/auth-client';

const auth = new AuthClient({
  baseUrl: '${PRODUCTION_API_URL}',
  clientId: 'your_client_id',
});

// Login
const { accessToken, user } = await auth.login({
  email: 'user@example.com',
  password: 'password',
  tenantSlug: 'your-tenant',
});

// Use the token
auth.setAccessToken(accessToken);
const me = await auth.getMe();`}
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                Go
              </h3>
              <CodeBlock
                title="Installation & Usage"
                language="go"
                code={`// Install the SDK
go get github.com/codevertex/auth-client-go

// Initialize the client
import authclient "github.com/codevertex/auth-client-go"

client := authclient.New(authclient.Config{
    BaseURL:  "${PRODUCTION_API_URL}",
    ClientID: "your_client_id",
})

// Login
result, err := client.Login(ctx, authclient.LoginRequest{
    Email:      "user@example.com",
    Password:   "password",
    TenantSlug: "your-tenant",
})

// Validate JWT tokens
claims, err := client.ValidateToken(accessToken)`}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-sky-500/5 to-violet-500/10 dark:from-primary/20 dark:via-sky-500/10 dark:to-violet-500/20 border border-primary/20 text-center overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Ready to integrate?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
                Create your OAuth client in the Developer Portal and start building with Codevertex SSO today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard/developer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  <Key className="w-5 h-5" />
                  Create OAuth Client
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href={`${PRODUCTION_API_URL}/v1/docs/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open Swagger UI
                </a>
              </div>
            </div>

            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
