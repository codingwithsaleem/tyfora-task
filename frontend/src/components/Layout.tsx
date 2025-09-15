import type { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="app-container py-6">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p className="text-sm">© {new Date().getFullYear()} Team Project Manager</p>
      </footer>
    </div>
  );
}