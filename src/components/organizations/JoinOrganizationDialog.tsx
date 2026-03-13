'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Building2, 
  Plus, 
  Loader2, 
  CheckCircle2,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export function JoinOrganizationDialog() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const search = async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        // We'll update the backend to support this search parameter
        const res = await api.get(`/api/v1/admin/tenants?search=${encodeURIComponent(query)}`);
        setResults(res.data || []);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleJoin = async (tenantId: string) => {
    try {
      setIsLoading(true);
      await api.post(`/api/v1/admin/tenants/${tenantId}/members`, {
        user_id: 'me', // The backend should handle 'me' or we get it from store
        roles: ['member'],
      });
      toast({
        title: 'Joined!',
        description: 'You have been added to the organization.',
      });
      setIsOpen(false);
      window.location.reload(); // Refresh to update store/tenants list
    } catch (error: any) {
      toast({
        title: 'Failed to join',
        description: error.message || 'Maybe you are already a member?',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold gap-2">
          <Plus className="h-4 w-4" />
          Join Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2.5rem] max-w-lg p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-8 bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Building2 className="h-6 w-6 text-primary" />
              Find Organization
            </DialogTitle>
          </DialogHeader>
          <p className="text-slate-400 text-sm mt-2 font-medium">Search by name, slug or ID to request access.</p>
          
          <div className="mt-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input 
              placeholder="Start typing (min 3 chars)..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-14 pl-12 bg-white/10 border-white/10 rounded-2xl text-lg font-bold focus-visible:ring-primary/50 text-white placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-2">
              {results.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black group-hover:bg-primary group-hover:text-white transition-colors">
                      {tenant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">{tenant.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">@{tenant.slug}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleJoin(tenant.id)}
                    className="rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white font-black text-[10px] uppercase px-4 h-8 transition-all"
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          ) : query.length >= 3 ? (
            <div className="text-center py-12">
              <X className="h-10 w-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No matching organizations found</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-10 w-10 text-slate-100 mx-auto mb-2" />
              <p className="text-slate-300 font-bold uppercase text-[10px] tracking-[0.2em]">Enter organization details</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
