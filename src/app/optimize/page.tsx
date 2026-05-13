import { Suspense } from 'react';
import OptimizePageContent from '@/components/optimize/OptimizePageContent';

function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function OptimizePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OptimizePageContent />
    </Suspense>
  );
}
