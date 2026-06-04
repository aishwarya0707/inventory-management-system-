import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // Tracks if we are editing
  const [formData, setFormData] = useState({ sku: '', name: '', price: '', stock: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Failed loading products.", err);
    }
  };

  // Opens the modal and fills it with the existing product's data
  const handleEditClick = (product) => {
    setEditingId(product.id);
    setFormData({
      sku: product.sku,
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setError('');
    setIsModalOpen(true);
  };

  // Resets the form completely when closing
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ sku: '', name: '', price: '', stock: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      sku: formData.sku,
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10)
    };

    try {
      if (editingId) {
        // If editingId exists, trigger a PUT request to update
        await updateProduct(editingId, payload);
      } else {
        // Otherwise, trigger a POST request to create new
        await createProduct(payload);
      }
      handleCloseModal();
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save product. Check inputs.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Product Management</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage your product inventory</p>
        </div>
        <button 
          onClick={() => {
            handleCloseModal(); // Ensure form is blank before opening
            setIsModalOpen(true);
          }}
          className="bg-slate-950 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-slate-950/10 hover:bg-slate-800 active:scale-95 transition-all duration-200 self-start sm:self-auto"
        >
          Add New Product
        </button>
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-100/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/60 text-slate-400 text-xs font-bold tracking-widest uppercase">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">SKU</th>
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6 text-right">Price</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-medium tracking-tight bg-slate-50/20">
                    No products found. Click above to add one.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className={`transition-colors duration-150 ${editingId === product.id ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'}`}>
                    <td className="py-5 px-6 font-mono text-xs text-slate-400">#{product.id}</td>
                    <td className="py-5 px-6 font-mono font-bold text-slate-700 tracking-tight">{product.sku}</td>
                    <td className="py-5 px-6 font-bold text-slate-900">{product.name}</td>
                    <td className="py-5 px-6 text-right font-mono font-bold text-slate-900">${parseFloat(product.price).toFixed(2)}</td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border tracking-tight ${
                        product.stock < 10 
                          ? 'bg-rose-50 text-rose-700 border-rose-100' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <div className="flex justify-center gap-2">
                      
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50/60 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50/60 transition-colors duration-200"
                        >
                          Delete
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

      {/* Dynamic Modal (Handles both Add and Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200/50 shadow-2xl overflow-hidden scale-100 transition-all">
            <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-lg tracking-tight">
                {editingId ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">SKU</label>
                <input 
                  type="text" required placeholder="e.g. PROD-01"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                  value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                <input 
                  type="text" required placeholder="e.g. Office Chair"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price ($)</label>
                  <input 
                    type="number" step="0.01" min="0" required placeholder="0.00"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                    value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock</label>
                  <input 
                    type="number" min="0" required placeholder="0"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                    value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} 
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="submit"
                  className="w-full bg-slate-950 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 shadow-lg shadow-slate-950/10 transition-all"
                >
                  {editingId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}