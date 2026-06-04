import axios from 'axios';

// This points to your running Flask server
const API_URL = 'http://127.0.0.1:5000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Product Endpoints ---
export const getProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// --- Customer Endpoints ---
export const getCustomers = () => api.get('/customers');
export const createCustomer = (data) => api.post('/customers', data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// --- Order Endpoints ---
export const getOrders = () => api.get('/orders');
export const createOrder = (data) => api.post('/orders', data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const getOrder = (id) => api.get(`/orders/${id}`);

export const getDashboardSummary = () => api.get('/dashboard/summary');