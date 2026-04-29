'use client';

import { usePortal } from '../layout';
import { useState } from 'react';
import api from '@/lib/api-client';

const DOC_TYPES = ['EPA', 'MSA', 'DPA'] as const;
type DocType = typeof DOC_TYPES[number];

export default function EquityDocuments() {
    const { token } = usePortal();
    const [signing, setSigning] = useState<DocType | null>(null);
    const [docVersion, setDocVersion] = useState('v1.0');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState<DocType | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signing || !file) return;
        setUploading(true);
        setError(null);

        const form = new FormData();
        form.append('doc_type', signing);
        form.append('doc_version', docVersion);
        form.append('signature_image', file);

        try {
            await api.post('/api/v1/auth/legal/sign', form, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            setSuccess(signing);
            setSigning(null);
            setFile(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to upload signature. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Legal Documents</h1>
                <p className="text-muted-foreground text-sm mt-1">Review and sign your equity agreements</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {DOC_TYPES.map((type) => (
                    <div key={type} className="rounded-xl border border-border bg-card p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">{type}</span>
                            {success === type ? (
                                <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium">Signed</span>
                            ) : (
                                <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full font-medium">Pending</span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {type === 'EPA' ? 'Equity Participation Agreement' : type === 'MSA' ? 'Master Services Agreement' : 'Data Processing Agreement'}
                        </p>
                        {success !== type && (
                            <button
                                type="button"
                                onClick={() => setSigning(type)}
                                className="w-full rounded-lg border border-border text-xs font-medium py-2 hover:bg-accent transition-colors"
                            >
                                Sign with Image
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {signing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card rounded-xl border border-border shadow-xl max-w-md w-full p-6 space-y-4">
                        <h2 className="text-lg font-bold">Sign {signing}</h2>
                        <p className="text-sm text-muted-foreground">Upload a clear image of your handwritten signature (JPG or PNG, max 2MB).</p>
                        <form onSubmit={handleSign} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium block mb-1">Document Version</label>
                                <input
                                    type="text"
                                    value={docVersion}
                                    onChange={(e) => setDocVersion(e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium block mb-1">Signature Image</label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                    className="w-full text-sm"
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">JPG or PNG, max 2MB</p>
                            </div>
                            {error && <p className="text-xs text-destructive">{error}</p>}
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => { setSigning(null); setFile(null); setError(null); }} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors">Cancel</button>
                                <button type="submit" disabled={uploading || !file} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                    {uploading ? 'Uploading...' : 'Submit Signature'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
