import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface LoadingProps {
  children: ReactNode;
  isLoading: boolean;
  error?: string | null;
}

export default function LoadingWrapper({ children, isLoading, error }: LoadingProps) {
  const [showSpinner, setShowSpinner] = useState(false);
  
  // Only show spinner if loading takes more than 300ms
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    if (isLoading) {
      timeout = setTimeout(() => {
        setShowSpinner(true);
      }, 300);
    } else {
      setShowSpinner(false);
    }
    
    return () => {
      clearTimeout(timeout);
    };
  }, [isLoading]);
  
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 my-4">
        <div className="flex">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      </div>
    );
  }
  
  if (isLoading && showSpinner) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return <>{children}</>;
}