'use client';

import { ShieldCheck } from 'lucide-react';

import { MfaPolicyEditor } from '@/components/settings/MfaPolicyEditor';
import { MFA_COPY } from '@/lib/mfa-enrollment';

export default function MfaPolicyPage() {
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" /> {MFA_COPY.policyPlatformTitle}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{MFA_COPY.policyPlatformBody}</p>
      </div>
      <MfaPolicyEditor />
    </div>
  );
}
