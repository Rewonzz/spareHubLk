import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Dashboard from './pages/Dashboard'
import PostAd from './pages/PostAd'
import ProductDetails from './pages/ProductDetails'
import ShopProfile from './pages/ShopProfile'
import Registration from './components/Registration'
import AiTools from './pages/AiTools'

// Protects routes — redirects to home if not logged in
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null; // Wait for auth to restore from localStorage
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/shop/:sellerName" element={<ShopProfile />} />
          <Route path="/ai-tools" element={<AiTools />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/post-ad" element={<ProtectedRoute><PostAd /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)