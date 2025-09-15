import { createContext } from 'react';
import type { ToastMessage } from './ToastContextTypes';

export interface ToastContextType {
  toasts: ToastMessage[];
  push: (toast: Omit<ToastMessage, 'id'>, ttl?: number) => void;
  remove: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);