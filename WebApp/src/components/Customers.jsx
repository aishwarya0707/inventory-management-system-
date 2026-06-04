import React, { useState, useEffect } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../Services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createCustomer(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create customer. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      await deleteCustomer(id);
      loadCustomers();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Customer Management</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage your registered customers</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-950 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-slate-950/10 hover:bg-slate-800 active:scale-95 transition-all duration-200"
        >
          Add New Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-100/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/60 text-slate-400 text-xs font-bold tracking-widest uppercase">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Contact Info</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-medium tracking-tight bg-slate-50/20">
                    No customers registered yet. Click above to add one.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="py-5 px-6 font-mono text-xs text-slate-400">#{customer.id}</td>
                    <td className="py-5 px-6 font-bold text-slate-900 tracking-tight">{customer.name}</td>
                    <td className="py-5 px-6 text-slate-500">
                      <div className="font-mono text-xs text-slate-700 font-medium mb-1">{customer.email}</div>
                      <div className="text-xs">{customer.phone}</div>
                    </td>
                    <td className="py-5 px-6 text-slate-500 text-xs">
                      {customer.address ? customer.address : <span className="italic text-slate-400">Not Provided</span>}
                    </td>
                    <td className="py-5 px-6">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border tracking-tight bg-blue-50 text-blue-700 border-blue-100">
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <button 
                        onClick={() => handleDelete(customer.id)}
                        className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50/60 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200/50 shadow-2xl overflow-hidden scale-100 transition-all">
            <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Add New Customer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100">
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-100">{error}</div>}
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input type="text" required className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input type="email" required className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <input type="tel" required className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Street Address (Optional)</label>
                <input type="text" placeholder="e.g. 123 Main St" className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="submit" className="w-full bg-slate-950 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 shadow-lg shadow-slate-950/10 transition-all">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}