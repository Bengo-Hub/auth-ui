'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Plug2, Send } from 'lucide-react';

// eTIMS Integration — request KRA fiscalization be enabled for this tenant.
export function EtimsSection({ tenantData }: { tenantData: any }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [showEtimsRequest, setShowEtimsRequest] = useState(false);
  const [etimsMode, setEtimsMode] = useState<'self_serve' | 'assisted'>('assisted');
  const [etimsNotes, setEtimsNotes] = useState('');

  const requestEtims = useMutation({
    mutationFn: async () =>
      api.post('/api/v1/integration-requests', {
        request_type: 'etims_integration',
        requester_name: user?.name || user?.email || 'Unknown',
        requester_email: user?.email || '',
        company_name: tenantData?.name,
        kra_pin: tenantData?.tax_pin,
        integration_mode: etimsMode,
        notes: etimsNotes,
      }),
    onSuccess: () => {
      toast({ title: 'Request sent', description: 'Our team will follow up shortly.' });
      setShowEtimsRequest(false);
      setEtimsNotes('');
    },
    onError: () => toast({ title: 'Request failed', variant: 'destructive' }),
  });

  return (
    <section className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
        <Plug2 className="h-5 w-5 text-primary" />
        eTIMS Integration
      </h3>
      <p className="text-xs text-slate-400 mb-6">
        Fiscalise your sales directly to KRA eTIMS. Not sure if it&apos;s active? Request it below and our team will confirm and set it up.
      </p>
      {showEtimsRequest ? (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEtimsMode('self_serve')}
              className={`text-left p-4 rounded-xl border-2 transition-colors ${etimsMode === 'self_serve' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}
            >
              <p className="font-bold text-sm text-slate-900 dark:text-white">Self-serve</p>
              <p className="text-xs text-slate-500 mt-1">Our developers handle the setup ourselves — no integration fee.</p>
            </button>
            <button
              type="button"
              onClick={() => setEtimsMode('assisted')}
              className={`text-left p-4 rounded-xl border-2 transition-colors ${etimsMode === 'assisted' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}
            >
              <p className="font-bold text-sm text-slate-900 dark:text-white">Assisted setup</p>
              <p className="text-xs text-slate-500 mt-1">Codevertex's team configures it for us — a one-time integration fee applies.</p>
            </button>
          </div>
          <textarea
            placeholder="Anything we should know? (device/branch count, timeline, etc.)"
            value={etimsNotes}
            onChange={(e) => setEtimsNotes(e.target.value)}
            rows={3}
            className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 placeholder:text-slate-400"
          />
          <div className="flex gap-3">
            <Button type="button" disabled={requestEtims.isPending} onClick={() => requestEtims.mutate()}>
              {requestEtims.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Submit request
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowEtimsRequest(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setShowEtimsRequest(true)}>
          <Plug2 className="h-4 w-4 mr-2" />
          Request eTIMS Integration
        </Button>
      )}
    </section>
  );
}
