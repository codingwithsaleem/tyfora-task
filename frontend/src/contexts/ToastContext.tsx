import { useState, ReactNode } from 'react';
import { ToastContext } from './ToastContextBase';
import type { ToastMessage } from './ToastContextTypes';

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = (toast: Omit<ToastMessage, 'id'>, ttl = 5000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: ToastMessage = { id, ...toast };
    setToasts((t: ToastMessage[]) => [...t, newToast]);

    if (ttl > 0) {
      setTimeout(() => {
        setToasts((t: ToastMessage[]) => t.filter((x: ToastMessage) => x.id !== id));
      }, ttl);
    }
  };

  const remove = (id: string) => {
    setToasts((t: ToastMessage[]) => t.filter((x: ToastMessage) => x.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
    </ToastContext.Provider>
  );
};