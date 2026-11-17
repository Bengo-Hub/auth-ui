'use client';

import { ShieldCheck } from 'lucide-react';

import { SettingsNote, SettingsPage } from '@/components/layout/SettingsPage';
import { MfaPolicyEditor } from '@/components/settings/MfaPolicyEditor';
import { MFA_COPY } from '@/lib/mfa-enrollment';

export default function MfaPolicyPage() {
  return (
    <SettingsPage
      icon={ShieldCheck}
      title={MFA_COPY.policyPlatformTitle}
      description={MFA_COPY.policyPlatformBody}
      aside={
        <>
          <SettingsNote title="Who this applies to">
            <p>Organisations that have not set their own rule follow this one. An organisation admin can make their own rule stricter for their team.</p>
          </SettingsNote>
          <SettingsNote title="Always required">
            <p>Developer accounts always sign in with an authenticator app, whatever this page says, because they hold API credentials.</p>
          </SettingsNote>
          <SettingsNote title="Without an authenticator app">
            <p>A covered member who has none yet is taken straight to set one up after their password, and can do nothing else until it is done.</p>
          </SettingsNote>
        </>
      }
    >
      <MfaPolicyEditor />
    </SettingsPage>
  );
}
