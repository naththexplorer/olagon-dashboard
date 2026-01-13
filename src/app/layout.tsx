import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/sidebar';
import BottomNav from '@/components/layout/Bottomnav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Olagon Dashboard',
  description: 'Olagon',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-slate-50 pb-16 md:pb-0">
            <div className="container mx-auto p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
