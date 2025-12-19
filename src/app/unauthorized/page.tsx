import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-100 p-4 rounded-full inline-flex mb-6">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">Access Denied</h1>
        <p className="text-slate-500 mb-8">
          You don't have the required permissions to access this page. 
          If you believe this is an error, please contact your administrator.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[#ea8022] font-bold hover:underline"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
