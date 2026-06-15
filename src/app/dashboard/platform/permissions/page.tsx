'use client';

import { useMemo, useState } from 'react';
import { KeySquare, Loader2, RefreshCw, Search } from 'lucide-react';
import { usePermissionsCatalogue } from '@/hooks/use-dashboard-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PermissionsPage() {
  const { data: groups, isLoading, refetch } = usePermissionsCatalogue();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const src = groups ?? [];
    if (!q) return src;
    return src
      .map((g) => ({
        ...g,
        modules: g.modules
          .map((m) => ({
            ...m,
            permissions: m.permissions.filter((p) => p.code.toLowerCase().includes(q)),
          }))
          .filter((m) => m.permissions.length > 0),
      }))
      .filter((g) => g.modules.length > 0);
  }, [groups, search]);

  const total = useMemo(
    () => (groups ?? []).reduce((acc, g) => acc + g.modules.reduce((a, m) => a + m.permissions.length, 0), 0),
    [groups]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <KeySquare className="h-6 w-6" /> Permission Catalogue
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Read-only catalogue of every permission auth-service issues, grouped by service and module
            ({total} total). Assign these to roles from the Roles page.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search permission code…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">No permissions found</div>
      ) : (
        <div className="space-y-6">
          {filtered.map((group) => (
            <div key={group.service} className="rounded-lg border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide">{group.service}</div>
              <div className="divide-y">
                {group.modules.map((mod) => (
                  <div key={mod.module} className="px-4 py-3">
                    <div className="font-medium text-sm mb-2">{mod.module}</div>
                    <div className="flex flex-wrap gap-2">
                      {mod.permissions.map((p) => (
                        <span
                          key={p.code}
                          className="inline-flex items-center px-2 py-1 rounded-md border bg-background font-mono text-xs"
                          title={p.code}
                        >
                          {p.code}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
