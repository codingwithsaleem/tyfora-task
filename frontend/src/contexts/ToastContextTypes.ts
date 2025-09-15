export type ToastVariant = 'info' | 'success' | 'error' | 'warning';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
}