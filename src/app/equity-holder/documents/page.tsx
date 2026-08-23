'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    fetchEquityDocumentDownloadURL,
    fetchEquityDocuments,
    signEquityDocument,
    type GeneratedDocumentType,
} from '@/lib/api/equity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, CheckCircle2, Clock3, ExternalLink, FileSignature, FileText, ScrollText, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { usePortal } from '../components/equity-portal-context';

const TYPE_ICONS: Record<string, typeof FileText> = {
    epa_agreement: FileText,
    dividend_certificate: Banknote,
    share_certificate: ShieldCheck,
    terms: ScrollText,
};

export default function EquityDocuments() {
    const { token } = usePortal();
    const queryClient = useQueryClient();
    const [signing, setSigning] = useState<GeneratedDocumentType | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [opening, setOpening] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // These are treasury-api's real, personalized generated documents (EPA/dividend
    // certificate/share certificate/terms) rendered from the holder's actual entitlement and
    // tax data — not a generic shared template. An admin must "generate" (finalize) one
    // before a holder can view or sign it; until then it shows as Unavailable here.
    const { data, isLoading } = useQuery({
        queryKey: ['equity-documents', token],
        queryFn: () => fetchEquityDocuments(token),
        enabled: !!token,
    });
    const generatedTypes = data?.generated_types ?? [];

    const handleView = async (docType: GeneratedDocumentType) => {
        if (!docType.document_id) return;
        setOpening(docType.document_type);
        try {
            const { url } = await fetchEquityDocumentDownloadURL(token, docType.document_id);
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
            setError('Failed to open the document. Please try again.');
        } finally {
            setOpening(null);
        }
    };

    const handleSign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signing?.document_id || !file) return;
        setUploading(true);
        setError(null);
        try {
            await signEquityDocument(token, signing.document_id, file);
            await queryClient.invalidateQueries({ queryKey: ['equity-documents', token] });
            setSigning(null);
            setFile(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to upload signature. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileSignature className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Legal Documents</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Review and sign your equity agreements.</p>
                </div>
            </header>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {generatedTypes.map((docType) => {
                        const Icon = TYPE_ICONS[docType.document_type] ?? FileText;
                        const isSigned = docType.status === 'signed';

                        return (
                            <div
                                key={docType.document_type}
                                className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 space-y-4 hover:border-primary/20 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    {isSigned ? (
                                        <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
                                            <CheckCircle2 className="h-3 w-3" /> Signed
                                        </span>
                                    ) : docType.finalized ? (
                                        <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full font-bold">
                                            Pending
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs bg-slate-500/10 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
                                            <Clock3 className="h-3 w-3" /> Unavailable
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{docType.title}</h3>
                                    {!docType.finalized && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Not yet issued — check back soon.
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={!docType.finalized || opening === docType.document_type}
                                        onClick={() => handleView(docType)}
                                        className="rounded-xl gap-1.5 flex-1"
                                    >
                                        <ExternalLink className="h-4 w-4" /> {opening === docType.document_type ? 'Opening...' : 'View'}
                                    </Button>
                                    {!isSigned && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={!docType.finalized}
                                            onClick={() => setSigning(docType)}
                                            className="rounded-xl gap-1.5 flex-1"
                                        >
                                            <FileSignature className="h-4 w-4" /> Sign
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Dialog open={!!signing} onOpenChange={(open) => { if (!open) { setSigning(null); setFile(null); setError(null); } }}>
                <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Sign {signing?.title}</DialogTitle>
                        <DialogDescription>
                            Upload a clear image of your handwritten signature (JPG or PNG, max 2MB).
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSign} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="signature-file">Signature Image</Label>
                            <Input
                                id="signature-file"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">JPG or PNG, max 2MB</p>
                        </div>
                        {error && <p className="text-xs text-destructive">{error}</p>}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setSigning(null); setFile(null); setError(null); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={uploading || !file}>
                                {uploading ? 'Uploading...' : 'Submit Signature'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
