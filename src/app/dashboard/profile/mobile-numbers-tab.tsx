'use client';

import { MyMobileNumbersCard } from '@/components/profile/contact-cards';
import { FieldCard } from './field-card';

/** Mobile Numbers sub-tab — split out of the old combined Profile tab
 * (Phase 10), mirroring Zoho Accounts' Profile > Mobile Numbers page. */
export function MobileNumbersTab() {
  return (
    <div className="max-w-3xl">
      <FieldCard>
        <MyMobileNumbersCard />
      </FieldCard>
    </div>
  );
}
