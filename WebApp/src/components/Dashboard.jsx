import React, { useState, useEffect } from 'react';
import { getDashboardSummary } from '../Services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await getDashboardSummary();
      setSummary(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard sync failure", err);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="p-8 text-slate-400 font-mono text-sm uppercase tracking-widest animate-pulse">Loading Dashboard...</div>;

  const { totals, lowStockProducts } = summary;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">System overview and inventory alerts</p>
        </div>
        <button 
          onClick={loadData} 
          className="bg-white border border-slate-200 text-slate-700 font-bold text-sm px-5 py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-200"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Products" value={totals.products} />
        <MetricCard title="Total Customers" value={totals.customers} />
        <MetricCard title="Total Orders" value={totals.orders} />
        <MetricCard title="Low Stock Alerts" value={totals.lowStockCount} isAlert={totals.lowStockCount > 0} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-100/40 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-black text-slate-900 tracking-tight">Low Stock Items</h3>
          <span className="text-xs bg-slate-900 text-white font-bold px-3 py-1 rounded-lg tracking-widest uppercase shadow-sm">
            Stock &lt; 10
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold tracking-widest uppercase">
                <th className="py-4 px-6">SKU / ID</th>
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6 text-right">Current Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 text-sm">
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-slate-400 font-medium bg-slate-50/20">
                    All products are sufficiently stocked.
                  </td>
                </tr>
              ) : (
                lowStockProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-rose-50/20 transition-colors">
                    <td className="py-5 px-6 font-mono text-xs text-slate-400">{product.sku || `#${product.id}`}</td>
                    <td className="py-5 px-6 font-bold text-slate-900 tracking-tight">{product.name}</td>
                    <td className="py-5 px-6 text-right">
                      <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold tracking-tight bg-rose-50 text-rose-700 border border-rose-100 shadow-sm shadow-rose-100">
                        {product.stock} units
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, isAlert }) {
  return (
    <div className={`bg-white p-8 rounded-2xl border shadow-sm shadow-slate-100/40 transition-all ${isAlert ? 'border-rose-200 ring-4 ring-rose-50' : 'border-slate-200/60'}`}>
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-3">{title}</span>
      <h2 className="text-5xl font-black text-slate-900 tracking-tighter font-mono">{value}</h2>
    </div>
  );
}
