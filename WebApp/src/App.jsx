import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';

export default function App() {
  return (
    <BrowserRouter>
      {/* This is the global layout wrapper. 
        It ensures the sidebar stays fixed on the left 
        while the main content scrolls on the right.
      */}
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        <Sidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            {/* Auto-redirect the blank root URL to the dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* The 4 core application modules */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}