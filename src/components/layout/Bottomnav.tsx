'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Wallet, History } from 'lucide-react';

const menuItems = [
  { name: 'Project', href: '/project', icon: LayoutDashboard },
  { name: 'Progress', href: '/progress', icon: TrendingUp }, // ← GANTI
  { name: 'Saldo', href: '/saldo', icon: Wallet },
  { name: 'Riwayat', href: '/riwayat', icon: History },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-600'
              }`}
            >
              <Icon size={22} className={isActive ? 'mb-1' : 'mb-0.5'} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
