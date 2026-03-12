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
    <div className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col p-6 fixed left-0 top-0 z-20">
      <div className="flex items-center space-x-2 mb-10 px-2">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-green-100">M</div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">Mirror</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-green-600 rounded-full" />
              )}
              <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'text-green-600' : ''}`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200 text-sm group">
          <span className="text-lg transition-transform group-hover:rotate-45">⚙️</span>
          <span className="font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 text-sm group">
          <span className="text-lg transition-transform group-hover:scale-110">⏻</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
