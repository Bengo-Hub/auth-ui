'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/api-client';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // OIDC / Redirect parameters
  const returnTo = searchParams.get('return_to');
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const stateParam = searchParams.get('state');
  const scope = searchParams.get('scope');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/api/v1/auth/register', {
        email,
        password,
      });

      // After signup, redirect to login with all parameters preserved
      const loginUrl = new URL('/login', window.location.origin);
      if (returnTo) loginUrl.searchParams.set('return_to', returnTo);
      if (clientId) loginUrl.searchParams.set('client_id', clientId);
      if (redirectUri) loginUrl.searchParams.set('redirect_uri', redirectUri);
      if (stateParam) loginUrl.searchParams.set('state', stateParam);
      if (scope) loginUrl.searchParams.set('scope', scope);
      loginUrl.searchParams.set('message', 'Account created successfully. Please sign in.');

      router.push(loginUrl.pathname + loginUrl.search);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-[#ea8022] hover:bg-[#d6701d]"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
      </Button>
    </form>
  );
}
