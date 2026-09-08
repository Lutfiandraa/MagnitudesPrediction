'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Zap, BarChart3, Info, Menu, X } from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Peta Gempa',
    href: '/',
    icon: Map,
  },
  {
    name: 'Prediksi Manual',
    href: '/predict',
    icon: Zap,
  },
  {
    name: 'Statistik',
    href: '/stats',
    icon: BarChart3,
  },
  {
    name: 'Tentang Model',
    href: '/about',
    icon: Info,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-navy text-white rounded-lg shadow-lg"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-navy text-white z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Title */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold tracking-tight">
              Magnitude<span className="text-blue-400">AI</span>
            </h1>
            <p className="text-sm text-white/70 mt-1">Earthquake Prediction</p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    font-medium text-sm
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-white/10 text-white shadow-md'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <p className="text-xs text-white/50 text-center">
              © 2024 MagnitudeAI
              <br />
              Powered by XGBoost
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
