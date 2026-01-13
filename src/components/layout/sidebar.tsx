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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-900 text-white min-h-screen shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Olagon
        </h1>
        <p className="text-sm text-slate-400 mt-1">Dashboard Olagon</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} Tim Olagon
        </p>
      </div>
    </aside>
  );
}
