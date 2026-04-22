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
import ApplyPro from './components/ApplyPro'
import ProDashboard from './pages/ProDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Sellers from './pages/Sellers'

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null; 
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
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
          <Route path="/seller/:sellerId" element={<ShopProfile />} />
          <Route path="/ai-tools" element={<AiTools />} />
          <Route path="/apply-pro" element={<ProtectedRoute><ApplyPro /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/post-ad" element={<ProtectedRoute><PostAd /></ProtectedRoute>} />
          <Route path="/pro-dashboard" element={<ProtectedRoute><ProDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/:tab" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/sellers" element={<Sellers />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)