import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'products', label: 'Products', path: '/products' },
    { id: 'customers', label: 'Customers', path: '/customers' },
    { id: 'orders', label: 'Orders', path: '/orders' },
  ];

  return (
    <div className="w-72 bg-white border-r border-slate-200/60 h-full flex flex-col justify-between px-6 py-8">
      <div className="space-y-10">
         <div className="px-3 flex items-center gap-3">
          <div className="w-3.5 h-3.5 bg-slate-950 rounded-full animate-pulse" />
          <span className="text-lg font-black tracking-tighter text-slate-950 uppercase">
            Inventory<span className="text-slate-400 font-normal">.Pro</span>
          </span>
        </div>
        
        <nav className="space-y-4">
          {menuItems.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold tracking-tight transition-all duration-300 flex items-center justify-between ${
                  isActive 
                    ? 'bg-slate-950 text-white shadow-md shadow-slate-950/10 scale-[1.02]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}