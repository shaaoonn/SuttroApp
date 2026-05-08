'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

const NAV_ITEMS = [
  { href: '/', label: 'ড্যাশবোর্ড', icon: '📊' },
  { href: '/daily-lessons', label: 'আজকের পড়া', icon: '📖' },
  { href: '/classes', label: 'ক্লাস', icon: '📹' },
  { href: '/simulations', label: 'সিমুলেশন', icon: '🧪' },
  { href: '/exams', label: 'MCQ পরীক্ষা', icon: '📝' },
  { href: '/cq', label: 'সৃজনশীল', icon: '✍️' },
  { href: '/questions/import', label: 'CSV ইম্পোর্ট', icon: '📥' },
  { href: '/plans', label: 'প্ল্যান ও মূল্য', icon: '💰' },
  { href: '/users', label: 'ইউজার', icon: '👤' },
  { href: '/content', label: 'সাইট কন্টেন্ট', icon: '✏️' },
  { href: '/analytics', label: 'অ্যানালিটিক্স', icon: '📈' },
];

interface AdminSidebarProps {
  adminName: string;
  adminRole: string;
}

export default function AdminSidebar({ adminName, adminRole }: AdminSidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <aside
      className="w-64 min-h-screen flex flex-col fixed left-0 top-0"
      style={{ background: 'var(--admin-sidebar)' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="সূত্র"
            width={80}
            height={28}
            className="h-7 w-auto brightness-0 invert"
          />
          <span className="text-sm font-medium text-white/60">Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                background: isActive ? 'var(--admin-primary)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="mb-3">
          <div className="text-sm font-medium text-white">{adminName}</div>
          <div className="text-xs text-white/50">{adminRole}</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          লগআউট
        </button>
      </div>
    </aside>
  );
}
