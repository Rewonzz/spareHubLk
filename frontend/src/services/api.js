const API_BASE = 'http://localhost:5000/api';

// Helper to make requests — auto-attaches JWT token
async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('sparehub_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

// --- Auth ---
export const registerUser = ({ username, email, password, sector }) =>
    apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, sector }),
    });

export const loginUser = ({ email, password }) =>
    apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

export const getMe = () => apiFetch('/auth/me');

// --- Products ---
export const createProduct = (productData) =>
    apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
    });

export const getProducts = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/products${query ? '?' + query : ''}`);
};

export const getMyProducts = () => apiFetch('/products/mine');

export const getProductById = (id) => apiFetch(`/products/${id}`);
