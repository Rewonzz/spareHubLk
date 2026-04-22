import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Shield, Users, CheckCircle, XCircle, Clock, Eye, LogOut,
  Building, Phone, Mail, MapPin, FileText,
  ChevronDown, ChevronUp, RefreshCw, Award, AlertTriangle,
  Package, BarChart3, DollarSign, TrendingUp, ShoppingCart, UserCheck,
  Home, Settings, FileCheck, X, Trash2, Search, Car, Calendar, Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getAllApplications, updateApplicationStatus, getProducts,
  getAllUsers, deleteUser, deleteProduct, deleteApplication
} from '../services/api';

const STATUS_COLORS = {
  pending: 'text-yellow-400 border-yellow-500 bg-yellow-500/10',
  approved: 'text-green-400 border-green-500 bg-green-500/10',
  rejected: 'text-red-400 border-red-500 bg-red-500/10',
};

const STATUS_ICONS = {
  pending: <Clock size={14} />,
  approved: <CheckCircle size={14} />,
  rejected: <XCircle size={14} />,
};

const adminNavItems = [
  { key: 'dashboard', label: 'Overview', icon: <Home size={18} />, path: '/admin' },
  { key: 'applications', label: 'PRO Applications', icon: <FileCheck size={18} />, path: '/admin/applications' },
  { key: 'products', label: 'All Products', icon: <Package size={18} />, path: '/admin/products' },
  { key: 'users', label: 'Users', icon: <Users size={18} />, path: '/admin/users' },
  { key: 'settings', label: 'Settings', icon: <Settings size={18} />, path: '/admin/settings' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [applications, setApplications] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tab-specific state
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [processingAppId, setProcessingAppId] = useState(null);
  const [appFilter, setAppFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Determine active tab from URL
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const activeTab = pathSegments[1] || 'dashboard';

  // Only admins can access
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black uppercase mb-2">Access Denied</h2>
          <p className="text-zinc-400 text-sm mb-6">This page is restricted to administrators only.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-red-600 font-black uppercase text-sm hover:bg-red-500 transition-all">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isActive = (key) => {
    if (key === 'dashboard') return activeTab === 'dashboard';
    return activeTab === key;
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [apps, prods, users] = await Promise.all([
        getAllApplications().catch(() => []),
        getProducts().catch(() => []),
        getAllUsers().catch(() => [])
      ]);
      setApplications(Array.isArray(apps) ? apps : []);
      setAllProducts(Array.isArray(prods) ? prods : []);
      setAllUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleStatus = async (id, status) => {
    setProcessingAppId(id);
    try {
      await updateApplicationStatus(id, status);
      setApplications(prev =>
        prev.map(app => app._id === id ? { ...app, status } : app)
      );
      showSuccess(`Application ${status} successfully.`);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setProcessingAppId(null);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteApplication(id);
      setApplications(prev => prev.filter(app => app._id !== id));
      showSuccess('Application deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete application.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setAllProducts(prev => prev.filter(p => p._id !== id));
      showSuccess('Product deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? All their products and data will also be deleted. This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteUser(id);
      setAllUsers(prev => prev.filter(u => u._id !== id));
      // Also refresh products since user's products were deleted
      const prods = await getProducts().catch(() => []);
      setAllProducts(Array.isArray(prods) ? prods : []);
      showSuccess('User and associated data deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  const counts = {
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    products: allProducts.length,
    totalViews: allProducts.reduce((acc, p) => acc + (p.views || 0), 0),
    users: allUsers.length,
    sellers: allUsers.filter(u => u.isPremium).length,
  };

  const filteredApps = appFilter === 'all'
    ? applications
    : applications.filter(a => a.status === appFilter);

  const filteredProducts = allProducts.filter(p => {
    const term = productSearch.toLowerCase();
    if (!term) return true;
    return (
      p.title?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      p.vehicleModel?.toLowerCase().includes(term) ||
      p.sellerUsername?.toLowerCase().includes(term)
    );
  });

  const filteredUsers = allUsers.filter(u => {
    const term = userSearch.toLowerCase();
    if (!term) return true;
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.toLowerCase().includes(term)
    );
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ── OVERVIEW SECTION ──
  const OverviewSection = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Applications', value: counts.pending, icon: <Clock size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
          { label: 'Approved Sellers', value: counts.approved, icon: <CheckCircle size={20} />, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
          { label: 'Total Products', value: counts.products, icon: <Package size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
          { label: 'Total Views', value: counts.totalViews.toLocaleString(), icon: <Eye size={20} />, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
          { label: 'Registered Users', value: counts.users, icon: <Users size={20} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
          { label: 'PRO Sellers', value: counts.sellers, icon: <Award size={20} />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
          { label: 'Rejected Apps', value: counts.rejected, icon: <XCircle size={20} />, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
          { label: 'Avg Views/Item', value: counts.products > 0 ? Math.round(counts.totalViews / counts.products) : 0, icon: <BarChart3 size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
        ].map((stat, i) => (
          <div key={i} className={`p-5 border ${stat.bg}`}>
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <p className="text-[9px] uppercase font-black text-zinc-500">{stat.label}</p>
            <p className="text-2xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black border border-zinc-800">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="text-sm font-black uppercase">Recent Applications</h3>
          </div>
          {applications.slice(0, 5).length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">No applications yet</div>
          ) : (
            <div className="divide-y divide-zinc-900">
              {applications.slice(0, 5).map(app => (
                <div key={app._id} className="p-4 flex items-center justify-between hover:bg-zinc-900/30">
                  <div>
                    <p className="text-xs font-bold uppercase">{app.businessName}</p>
                    <p className="text-[9px] text-zinc-500">{app.businessType?.replace('_', ' ')} · {app.city}</p>
                  </div>
                  <span className={`px-2 py-1 text-[9px] font-black uppercase border ${STATUS_COLORS[app.status]}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-black border border-zinc-800">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="text-sm font-black uppercase">Recent Products</h3>
          </div>
          {allProducts.slice(0, 5).length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">No products yet</div>
          ) : (
            <div className="divide-y divide-zinc-900">
              {allProducts.slice(0, 5).map(prod => (
                <div key={prod._id} className="p-4 flex items-center justify-between hover:bg-zinc-900/30">
                  <div>
                    <p className="text-xs font-bold uppercase">{prod.title}</p>
                    <p className="text-[9px] text-zinc-500">{prod.category} · {prod.vehicleModel || 'N/A'}</p>
                  </div>
                  <p className="text-xs font-black text-red-500">LKR {prod.price?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── APPLICATIONS SECTION ──
  const ApplicationsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-0 border-b border-zinc-900">
          {[
            { key: 'all', label: 'All', count: applications.length },
            { key: 'pending', label: 'Pending', count: counts.pending },
            { key: 'approved', label: 'Approved', count: counts.approved },
            { key: 'rejected', label: 'Rejected', count: counts.rejected },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setAppFilter(tab.key)}
              className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                appFilter === tab.key ? 'border-red-600 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label} <span className="ml-1 text-zinc-600">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="p-12 text-center border border-zinc-900 bg-black">
          <FileCheck size={36} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-xs uppercase font-bold">No {appFilter === 'all' ? '' : appFilter} applications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => {
            const isExpanded = expandedAppId === app._id;
            const isProcessing = processingAppId === app._id;
            const isDel = deletingId === app._id;
            return (
              <div key={app._id} className={`bg-black border transition-all ${
                app.status === 'pending' ? 'border-yellow-500/20' :
                app.status === 'approved' ? 'border-green-500/20' : 'border-red-500/20'
              }`}>
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-zinc-900/50 transition-all"
                  onClick={() => setExpandedAppId(isExpanded ? null : app._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Building size={16} className="text-zinc-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase">{app.businessName}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase">
                        {app.businessType?.replace('_', ' ')} · {app.city}
                      </p>
                      <p className="text-[9px] text-zinc-700 mt-0.5">
                        Submitted: {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 border text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[app.status]}`}>
                      {STATUS_ICONS[app.status]} {app.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteApplication(app._id); }}
                      disabled={isDel}
                      className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      title="Delete Application"
                    >
                      <Trash2 size={14} />
                    </button>
                    {isExpanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-zinc-800 p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Application Details</h5>
                        {[
                          { icon: <Users size={12} />, label: 'Full Name', value: app.fullName },
                          { icon: <FileText size={12} />, label: 'NIC / Passport', value: app.nicNumber },
                          { icon: <Phone size={12} />, label: 'Mobile', value: app.mobileNumber },
                          { icon: <Mail size={12} />, label: 'Email', value: app.email },
                          { icon: <MapPin size={12} />, label: 'Business Address', value: app.businessAddress },
                          { icon: <Building size={12} />, label: 'City', value: app.city },
                          { icon: <Award size={12} />, label: 'Business Type', value: app.businessType?.replace('_', ' ') },
                        ].map(({ icon, label, value }) => (
                          <div key={label} className="flex items-start gap-3">
                            <span className="text-zinc-600 mt-0.5">{icon}</span>
                            <div>
                              <p className="text-[8px] font-black uppercase text-zinc-600">{label}</p>
                              <p className="text-xs text-zinc-300 capitalize">{value || '—'}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4">
                        {app.userId && (
                          <div className="bg-zinc-950 border border-zinc-800 p-4">
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Registered Account</h5>
                            <p className="text-sm font-bold">{app.userId.name}</p>
                            <p className="text-xs text-zinc-400">{app.userId.email}</p>
                            <p className="text-xs text-zinc-400">{app.userId.phone}</p>
                          </div>
                        )}

                        {(app.nicFront || app.nicBack) && (
                          <div>
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Identity Documents</h5>
                            <div className="grid grid-cols-2 gap-3">
                              {app.nicFront && (
                                <div>
                                  <p className="text-[8px] uppercase font-black text-zinc-600 mb-1">Front</p>
                                  <img src={app.nicFront} alt="NIC Front" className="w-full h-28 object-cover border border-zinc-800" />
                                </div>
                              )}
                              {app.nicBack && (
                                <div>
                                  <p className="text-[8px] uppercase font-black text-zinc-600 mb-1">Back</p>
                                  <img src={app.nicBack} alt="NIC Back" className="w-full h-28 object-cover border border-zinc-800" />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-5 border-t border-zinc-800">
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatus(app._id, 'approved')}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            <CheckCircle size={14} />
                            {isProcessing ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleStatus(app._id, 'rejected')}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            <XCircle size={14} />
                            {isProcessing ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                      {app.status === 'approved' && (
                        <button
                          onClick={() => handleStatus(app._id, 'rejected')}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-5 py-2 bg-red-600/20 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          <XCircle size={12} /> Revoke PRO
                        </button>
                      )}
                      {app.status === 'rejected' && (
                        <button
                          onClick={() => handleStatus(app._id, 'approved')}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-5 py-2 bg-green-600/20 border border-green-600 text-green-400 hover:bg-green-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          <CheckCircle size={12} /> Re-approve
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── PRODUCTS SECTION ──
  const ProductsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-black border border-zinc-800 pl-9 pr-4 py-3 text-xs text-white placeholder-zinc-600 outline-none focus:border-red-600 transition-all"
          />
        </div>
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{filteredProducts.length} products</p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center border border-zinc-900 bg-black">
          <Package size={36} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-xs uppercase font-bold">No products found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">Product</th>
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">Category</th>
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">Vehicle</th>
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">Price</th>
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">Seller</th>
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">Status</th>
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredProducts.map(prod => (
                <tr key={prod._id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {prod.images?.[0] ? (
                        <img src={prod.images[0]} alt="" className="w-10 h-10 object-cover border border-zinc-800" />
                      ) : (
                        <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <Package size={14} className="text-zinc-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold uppercase">{prod.title}</p>
                        <p className="text-[9px] text-zinc-500">{prod.condition} · {prod.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-zinc-300">{prod.category}</td>
                  <td className="p-4 text-xs text-zinc-300">{prod.vehicleModel || '—'}</td>
                  <td className="p-4 text-xs font-black text-red-500">LKR {prod.price?.toLocaleString()}</td>
                  <td className="p-4 text-xs text-zinc-300">{prod.sellerUsername}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[9px] font-black uppercase border ${
                      prod.status === 'active' ? 'text-green-400 border-green-500 bg-green-500/10' :
                      prod.status === 'sold' ? 'text-zinc-400 border-zinc-500 bg-zinc-500/10' :
                      'text-yellow-400 border-yellow-500 bg-yellow-500/10'
                    }`}>
                      {prod.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteProduct(prod._id)}
                      disabled={deletingId === prod._id}
                      className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ── USERS SECTION ──
  const UsersSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-black border border-zinc-800 pl-9 pr-4 py-3 text-xs text-white placeholder-zinc-600 outline-none focus:border-red-600 transition-all"
          />
        </div>
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{filteredUsers.length} users</p>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center border border-zinc-900 bg-black">
          <Users size={36} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-xs uppercase font-bold">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">User</th>
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">Email</th>
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">Phone</th>
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">Role</th>
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">Status</th>
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest">Joined</th>
                <th className="p-4 text-[9px] font-black uppercase text-zinc-500 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredUsers.map(u => (
                <tr key={u._id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="w-10 h-10 object-cover border border-zinc-800" />
                      ) : (
                        <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <UserCheck size={14} className="text-zinc-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold uppercase">{u.name}</p>
                        <p className="text-[9px] text-zinc-500">{u.location || 'Colombo'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-zinc-300">{u.email}</td>
                  <td className="p-4 text-xs text-zinc-300">{u.phone}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[9px] font-black uppercase border ${
                      u.role === 'admin' ? 'text-red-400 border-red-500 bg-red-500/10' :
                      u.role === 'seller' ? 'text-green-400 border-green-500 bg-green-500/10' :
                      'text-zinc-400 border-zinc-500 bg-zinc-500/10'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[9px] font-black uppercase border ${
                      u.isPremium ? 'text-amber-400 border-amber-500 bg-amber-500/10' :
                      'text-zinc-400 border-zinc-500 bg-zinc-500/10'
                    }`}>
                      {u.isPremium ? 'PRO' : 'Standard'}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-zinc-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      disabled={deletingId === u._id || u.role === 'admin'}
                      className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-30"
                      title={u.role === 'admin' ? 'Cannot delete admin' : 'Delete User'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ── SETTINGS SECTION ──
  const SettingsSection = () => (
    <div className="space-y-6">
      <div className="bg-black border border-zinc-800 p-6">
        <h3 className="text-sm font-black uppercase mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-950 border border-zinc-900 p-4">
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">Platform</p>
            <p className="text-sm font-bold text-white">SpareHubLk</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 p-4">
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">Environment</p>
            <p className="text-sm font-bold text-white">Production</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 p-4">
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">Database</p>
            <p className="text-sm font-bold text-white">MongoDB</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 p-4">
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1">Backend</p>
            <p className="text-sm font-bold text-white">Node.js / Express</p>
          </div>
        </div>
      </div>

      <div className="bg-black border border-zinc-800 p-6">
        <h3 className="text-sm font-black uppercase mb-4">Admin Actions</h3>
        <div className="space-y-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-3 px-5 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-black uppercase tracking-widest transition-all w-full md:w-auto"
          >
            <RefreshCw size={14} /> Refresh All Data
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3 bg-red-600/10 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white text-xs font-black uppercase tracking-widest transition-all w-full md:w-auto"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  // ── RENDER ──
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-black border-r border-zinc-800 fixed h-full flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider">SpareHub</h1>
              <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">Admin</p>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-zinc-800">
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2">Logged in as</p>
          <p className="text-sm font-black">{user.name}</p>
          <p className="text-[10px] text-zinc-500">{user.email}</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                isActive(item.key)
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        {/* View Site */}
        <div className="p-4 border-t border-zinc-800">
          <Link
            to="/"
            className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
          >
            <Home size={16} /> View Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-all"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Messages */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 text-green-400 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={14} /> {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-black uppercase">
              {activeTab === 'dashboard' && 'Overview'}
              {activeTab === 'applications' && 'PRO Applications'}
              {activeTab === 'products' && 'All Products'}
              {activeTab === 'users' && 'Users'}
              {activeTab === 'settings' && 'Settings'}
            </h2>
            <p className="text-[10px] text-zinc-500 mt-1">
              {activeTab === 'dashboard' && 'Platform overview and key metrics'}
              {activeTab === 'applications' && 'Review and manage seller applications'}
              {activeTab === 'products' && 'Manage all product listings'}
              {activeTab === 'users' && 'Manage registered users'}
              {activeTab === 'settings' && 'System settings and information'}
            </p>
          </div>
          {activeTab !== 'settings' && (
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-[10px] font-black uppercase transition-all"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          )}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw size={24} className="text-zinc-600 mx-auto mb-3 animate-spin" />
            <p className="text-zinc-500 text-xs uppercase font-bold">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <OverviewSection />}
            {activeTab === 'applications' && <ApplicationsSection />}
            {activeTab === 'products' && <ProductsSection />}
            {activeTab === 'users' && <UsersSection />}
            {activeTab === 'settings' && <SettingsSection />}
          </>
        )}
      </div>
    </div>
  );
}
