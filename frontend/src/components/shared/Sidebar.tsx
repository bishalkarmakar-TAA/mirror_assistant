'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'My Profile', icon: '👤', path: '/profile' },
    { name: 'Schedules', icon: '📅', path: '/schedules' },
    { name: 'Assistant', icon: '✨', path: '/' },
    { name: 'Worksheets', icon: '📋', path: '/worksheets' },
    { name: 'Payments', icon: '💳', path: '/payments' },
    { name: 'Refer to a friend', icon: '👥', path: '/refer' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col p-6 fixed left-0 top-0">
      <div className="flex items-center space-x-2 mb-10 px-2">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">M</div>
        <span className="text-xl font-bold text-gray-800">Mirror</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors text-sm">
          <span>⚙️</span>
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors text-sm">
          <span>⏻</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
