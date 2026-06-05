import React, { useState, useEffect } from 'react';
import { getOrders, getOrder, getProducts, getCustomers, createOrder, deleteOrder } from '../Services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null); // NEW: Tracks the order being viewed
  const [formData, setFormData] = useState({ customer_id: '', product_id: '', quantity: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrdersData();
    loadDropdowns();
  }, []);

  const fetchOrdersData = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error("Error retrieving orders.", error);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [prodRes, custRes] = await Promise.all([getProducts(), getCustomers()]);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
    } catch (error) {
      console.error("Error loading dropdowns.", error);
    }
  };

  // NEW: Fetch individual order details and open the view modal
  const handleViewDetails = async (id) => {
    try {
      const response = await getOrder(id);
      setViewDetails(response.data);
    } catch (err) {
      console.error("Failed to fetch order details.", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const requestedQty = parseInt(formData.quantity, 10);
    const selectedProduct = products.find(p => p.id.toString() === formData.product_id.toString());
    const maxStockAvailable = selectedProduct ? selectedProduct.stock : '';

    if (maxStockAvailable !== '' && requestedQty > maxStockAvailable) {
      setError(`Transaction Denied: You cannot order more than the ${maxStockAvailable} units available in stock.`);
      return;
    }

    try {
      await createOrder({
        customer_id: parseInt(formData.customer_id, 10),
        product_id: parseInt(formData.product_id, 10),
        quantity: requestedQty
      });
      setIsModalOpen(false);
      setFormData({ customer_id: '', product_id: '', quantity: '' });
      fetchOrdersData();
      loadDropdowns();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to place order.");
    }
  };

  const handleCancel = async (id) => {
    if (confirm("Are you sure you want to cancel this order and return the stock?")) {
      await deleteOrder(id);
      fetchOrdersData();
      loadDropdowns();
    }
  };

  const selectedProduct = products.find((p) => p.id.toString() === formData.product_id.toString());
  const maxStockAvailable = selectedProduct ? selectedProduct.stock : '';

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Order Management</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage customer orders</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ customer_id: '', product_id: '', quantity: '' });
            setError('');
            setIsModalOpen(true);
          }}
          className="bg-slate-950 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-slate-950/10 hover:bg-slate-800 active:scale-95 transition-all duration-200"
        >
          Place New Order
        </button>
      </div>

      {/* Main Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-100/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/60 text-slate-400 text-xs font-bold tracking-widest uppercase">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6 text-center">Quantity</th>
                <th className="py-4 px-6 text-right">Total Amount</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-medium tracking-tight bg-slate-50/20">
                    No orders found. Click above to place one.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="py-5 px-6 font-mono text-xs text-slate-400">#ORD-{order.id}</td>
                    <td className="py-5 px-6 font-bold text-slate-900 tracking-tight">{order.customer_name}</td>
                    <td className="py-5 px-6 text-slate-700">{order.product_name}</td>
                    <td className="py-5 px-6 text-center font-mono font-semibold text-slate-900">{order.quantity}</td>
                    <td className="py-5 px-6 text-right font-mono font-black text-slate-900 tracking-tight">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="py-5 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        {/* NEW: View Button */}
                        <button 
                          onClick={() => handleViewDetails(order.id)}
                          className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50/60 transition-colors duration-200"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleCancel(order.id)}
                          className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50/60 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW: Order Details Modal (Receipt Style) */}
      {viewDetails && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200/50 shadow-2xl overflow-hidden scale-100 transition-all">
            <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Order Details</h3>
              <button onClick={() => setViewDetails(null)} className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100">
                Close
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Invoice No.</span>
                <span className="font-mono font-black text-slate-900">#ORD-{viewDetails.id}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Customer</span>
                  <span className="text-sm font-bold text-slate-900 text-right">{viewDetails.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Product</span>
                  <span className="text-sm font-bold text-slate-900 text-right">{viewDetails.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 font-medium">Quantity</span>
                  <span className="text-sm font-mono font-bold text-slate-900 text-right">{viewDetails.quantity}x</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-2 bg-slate-50/50 p-4 rounded-xl">
                <span className="text-sm font-black text-slate-900 uppercase tracking-wider">Total Billed</span>
                <span className="text-xl font-mono font-black text-emerald-600">${viewDetails.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Create Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200/50 shadow-2xl overflow-hidden scale-100 transition-all">
            <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-lg tracking-tight">Place New Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100">
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-100">{error}</div>}
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Customer</label>
                <select required className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all appearance-none" value={formData.customer_id} onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}>
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Product</label>
                <select required className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all appearance-none" value={formData.product_id} onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}>
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                      {p.name} — ${p.price.toFixed(2)} ({p.stock} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity</label>
                  {maxStockAvailable !== '' && (
                    <span className="text-xs font-bold text-slate-500">Available: {maxStockAvailable}</span>
                  )}
                </div>
                <input 
                  type="number" 
                  min="1" 
                  max={maxStockAvailable !== '' ? maxStockAvailable : undefined} 
                  required 
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all" 
                  value={formData.quantity} 
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} 
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="submit" className="w-full bg-slate-950 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 shadow-lg shadow-slate-950/10 transition-all">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
