'use client';

import { useState, useEffect } from 'react';
import { 
    Key, 
    Plus, 
    Trash2, 
    Shield, 
    Calendar, 
    Globe, 
    CheckCircle2, 
    AlertCircle,
    Copy,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CreateAPIKeyModal } from '@/components/dashboard/CreateAPIKeyModal';

interface APIKey {
    id: string;
    name: string;
    key_prefix: string;
    service?: string;
    scopes?: string[];
    status: string;
    last_used_at?: string;
    expires_at?: string;
    created_at: string;
}

export default function APIKeysPage() {
    const [keys, setKeys] = useState<APIKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/admin/api-keys', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch API keys');
            const data = await response.json();
            setKeys(data);
        } catch (error) {
            console.error('Fetch error:', error);
            toast({
                title: 'Error',
                description: 'Failed to load API keys',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;

        try {
            const response = await fetch(`/api/v1/admin/api-keys/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to revoke API key');
            
            toast({
                title: 'Success',
                description: 'API key revoked successfully',
            });
            fetchKeys();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to revoke API key',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-4">
                        <Key className="h-10 w-10 text-primary" />
                        API KEYS
                    </h1>
                    <p className="text-white/50 font-medium">Manage service-to-service authentication keys</p>
                </div>
                <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-2xl font-bold shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    GENERATE NEW KEY
                </Button>
            </div>

            <CreateAPIKeyModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchKeys();
                }}
            />

            <div className="grid gap-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <p className="text-white/30 font-bold uppercase tracking-widest text-sm text-center">Loading Secure Keys...</p>
                    </div>
                ) : keys.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center flex flex-col items-center gap-6">
                        <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center">
                            <Shield className="h-12 w-12 text-white/20" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">No API Keys Found</h3>
                            <p className="text-white/40 max-w-sm">Create an API key to enable secure service-to-service communication for your organization.</p>
                        </div>
                    </div>
                ) : (
                    keys.map((key) => (
                        <div 
                            key={key.id}
                            className="group bg-white/5 border border-white/10 rounded-3xl p-8 transition-all hover:bg-white/[0.07] hover:border-primary/30 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-8">
                                <div className={cn(
                                    "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl",
                                    key.status === 'active' ? "bg-primary/20 text-primary" : "bg-white/5 text-white/20"
                                )}>
                                    <Key className="h-8 w-8" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-white">{key.name}</h3>
                                        <span className={cn(
                                            "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            key.status === 'active' ? "bg-green-500/20 text-green-400" : "bg-rose-500/20 text-rose-400"
                                        )}>
                                            {key.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm font-medium">
                                        <div className="flex items-center gap-2 text-white/40">
                                            <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-white/60">{key.key_prefix}••••••••</span>
                                        </div>
                                        {key.service && (
                                            <div className="flex items-center gap-2 text-white/40">
                                                <ExternalLink className="h-4 w-4" />
                                                <span>{key.service}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-white/40">
                                            <Calendar className="h-4 w-4" />
                                            <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {key.status === 'active' && (
                                    <Button 
                                        variant="ghost"
                                        onClick={() => handleRevoke(key.id)}
                                        className="h-14 w-14 rounded-2xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
                                    >
                                        <Trash2 className="h-6 w-6" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
