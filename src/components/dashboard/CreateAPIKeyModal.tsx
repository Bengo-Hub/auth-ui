'use client';

import { useState } from 'react';
import { 
    X, 
    Key, 
    Shield, 
    Globe, 
    Loader2, 
    Copy, 
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CreateAPIKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateAPIKeyModal({ isOpen, onClose, onSuccess }: CreateAPIKeyModalProps) {
    const [name, setName] = useState('');
    const [service, setService] = useState('');
    const [expiresIn, setExpiresIn] = useState('0');
    const [loading, setLoading] = useState(false);
    const [createdKey, setCreatedKey] = useState<any>(null);
    const { toast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await fetch('/api/v1/admin/api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    name,
                    service,
                    expires_in: parseInt(expiresIn)
                })
            });

            if (!response.ok) throw new Error('Failed to generate API key');
            
            const data = await response.json();
            setCreatedKey(data);
            onSuccess();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to generate API key',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copied',
            description: 'API key copied to clipboard',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white/[0.03] border border-white/10 w-full max-w-2xl rounded-[40px] shadow-2xl shadow-primary/10 overflow-hidden">
                <div className="p-10">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                                <Key className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                                {createdKey ? 'Key Generated' : 'Generate API Key'}
                            </h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="h-12 w-12 rounded-2xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {!createdKey ? (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Key Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Production Ordering Service"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium placeholder:text-white/10"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Service Identifier (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ordering-service"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium placeholder:text-white/10"
                                        value={service}
                                        onChange={(e) => setService(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Expiration</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium appearance-none"
                                        value={expiresIn}
                                        onChange={(e) => setExpiresIn(e.target.value)}
                                    >
                                        <option value="0" className="bg-brand-dark">Never Expires</option>
                                        <option value="30" className="bg-brand-dark">30 Days</option>
                                        <option value="90" className="bg-brand-dark">90 Days</option>
                                        <option value="365" className="bg-brand-dark">1 Year</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-8 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        'Generate Secure Key'
                                    )}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-8 animate-in zoom-in duration-500">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-8 flex items-start gap-4">
                                <AlertCircle className="h-6 w-6 text-green-400 shrink-0 mt-1" />
                                <div className="space-y-2">
                                    <p className="text-green-400 font-bold uppercase tracking-wider text-sm text-left">Copy your key now</p>
                                    <p className="text-green-400/60 text-sm font-medium leading-relaxed text-left">
                                        For security reasons, this key will only be shown once. If you lose it, you will need to generate a new one.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">API KEY</label>
                                <div className="relative group">
                                    <div className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-primary font-mono text-lg break-all pr-20 select-all">
                                        {createdKey.key}
                                    </div>
                                    <Button 
                                        onClick={() => copyToClipboard(createdKey.key)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl"
                                    >
                                        <Copy className="h-6 w-6" />
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button 
                                    onClick={onClose}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white py-8 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm transition-all"
                                >
                                    I have saved my key
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
