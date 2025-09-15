import React from 'react';
import { useContext } from 'react';
import { ToastContext } from '../contexts/ToastContextBase';

export default function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, remove } = ctx;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-96">
      {toasts.map((t) => (
        <div key={t.id} className={`rounded-md p-4 shadow-md border ${t.variant === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200'}`}>
          {t.title && <div className="font-semibold mb-1">{t.title}</div>}
          <div className="text-sm">{t.message}</div>
          <div className="text-right mt-2">
            <button onClick={() => remove(t.id)} className="text-xs text-gray-500">Dismiss</button>
          </div>
        </div>
      ))}
    </div>
  );
}
