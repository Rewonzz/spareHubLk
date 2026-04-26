const API_BASE = '/api';

// Helper to make requests — auto-attaches JWT token
async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('sparehub_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };
    
    try {
        const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

        const text = await res.text();

        if (!text) {
            throw new Error('Server returned empty response');
        }

        // Parse JSON first (separate from HTTP error handling)
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseErr) {
            console.error('JSON Parse Error:', text);
            throw new Error('Invalid server response');
        }

        // Now handle HTTP errors with the parsed message
        if (!res.ok) {
            throw new Error(data.message || `Request failed with status ${res.status}`);
        }

        return data;
    } catch (err) {
        console.error('API Error:', err);
        const errorMsg = err.message || 'Unknown error';
        if (errorMsg === 'Failed to fetch' ||
            errorMsg.includes('NetworkError') ||
            err.name === 'TypeError' ||
            errorMsg === 'Server returned empty response' ||
            errorMsg === 'Invalid server response') {
            throw new Error('Unable to connect to server. Make sure backend is running on port 5000.');
        }
        throw new Error(errorMsg);
    }
}

// --- Auth ---
export const registerUser = ({ name, phone, email, password, location }) =>
    apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, phone, email, password, location }),
    });

export const loginUser = ({ emailOrUsername, password }) =>
    apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername, password }),
    });

export const getMe = () => apiFetch('/auth/me');

export const updateProfile = (data) =>
    apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    });

// Upload profile picture (multipart/form-data — no Content-Type header, browser sets it)
export const uploadAvatar = async (file) => {
    const token = localStorage.getItem('sparehub_token');
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(`${API_BASE}/auth/avatar`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data; // { avatar: '<url or base64>' }
};

// Upload shop banner image
export const uploadShopBanner = async (file) => {
    const token = localStorage.getItem('sparehub_token');
    const formData = new FormData();
    formData.append('banner', file);
    const res = await fetch(`${API_BASE}/auth/shop-banner`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Banner upload failed');
    return data; // { bannerImage: '<base64>' }
};

// Upload shop avatar image
export const uploadShopAvatar = async (file) => {
    const token = localStorage.getItem('sparehub_token');
    const formData = new FormData();
    formData.append('shopAvatar', file);
    const res = await fetch(`${API_BASE}/auth/shop-avatar`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Shop avatar upload failed');
    return data; // { shopAvatar: '<base64>' }
};

// --- Products ---
export const createProduct = (productData) =>
    apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
    });

// Upload product images
export const uploadProductImages = async (files) => {
    const token = localStorage.getItem('sparehub_token');
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    const res = await fetch(`${API_BASE}/products/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Image upload failed');
    return data; // { images: ['/uploads/xxx.jpg', ...] }
};

export const getProducts = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/products${query ? '?' + query : ''}`);
};

export const getMyProducts = () => apiFetch('/products/mine');

export const getProductById = (id) => apiFetch(`/products/${id}`);

export const applyPro = (data) => 
    apiFetch('/premium/apply', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const getMyApplication = () => apiFetch('/premium/my-application');

// Admin: get all PRO applications
export const getAllApplications = () => apiFetch('/premium/all');

// Admin: approve or reject an application
export const updateApplicationStatus = (id, status) =>
    apiFetch(`/premium/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });

// Public: get a premium seller's profile
export const getSellerProfile = (userId) => apiFetch(`/premium/seller/${userId}`);

// Public: get all products by a specific seller
export const getSellerProducts = (userId) => apiFetch(`/products/seller/${userId}`);

// Public: search premium users/sellers
export const searchPremiumSellers = (query, businessType) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (businessType) params.append('businessType', businessType);
    return apiFetch(`/premium/search?${params.toString()}`);
};

// --- Admin ---
export const getAllUsers = () => apiFetch('/auth/users');

export const deleteUser = (id) =>
    apiFetch(`/auth/users/${id}`, { method: 'DELETE' });

export const deleteProduct = (id) =>
    apiFetch(`/products/${id}`, { method: 'DELETE' });

export const deleteApplication = (id) =>
    apiFetch(`/premium/${id}`, { method: 'DELETE' });

// --- Featured Sellers ---
export const getFeaturedSellers = () => apiFetch('/featured-sellers');

export const addFeaturedSeller = (sellerId) =>
    apiFetch('/featured-sellers', {
        method: 'POST',
        body: JSON.stringify({ sellerId }),
    });

export const removeFeaturedSeller = (id) =>
    apiFetch(`/featured-sellers/${id}`, { method: 'DELETE' });

// --- Reviews ---
export const getReviews = (productId) => apiFetch(`/reviews/${productId}`);

export const addReview = (productId, { rating, comment }) =>
    apiFetch(`/reviews/${productId}`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
    });

export const deleteReview = (reviewId) =>
    apiFetch(`/reviews/${reviewId}`, { method: 'DELETE' });

// --- Platform Feedback ---
export const getPlatformFeedback = () => apiFetch('/feedback');

export const getPlatformFeedbackStats = () => apiFetch('/feedback/stats');

export const addPlatformFeedback = ({ rating, comment, category }) =>
    apiFetch('/feedback', {
        method: 'POST',
        body: JSON.stringify({ rating, comment, category }),
    });

export const deletePlatformFeedback = (id) =>
    apiFetch(`/feedback/${id}`, { method: 'DELETE' });

// --- Seller Reviews ---
export const getSellerReviews = (sellerId) => apiFetch(`/seller-reviews/${sellerId}`);

export const getSellerReviewStats = (sellerId) => apiFetch(`/seller-reviews/${sellerId}/stats`);

export const addSellerReview = (sellerId, { rating, comment }) =>
    apiFetch(`/seller-reviews/${sellerId}`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
    });

export const deleteSellerReview = (reviewId) =>
    apiFetch(`/seller-reviews/${reviewId}`, { method: 'DELETE' });
