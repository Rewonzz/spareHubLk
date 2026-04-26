import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, Star, Shield, Package, BarChart3, TrendingUp, Plus,
  ExternalLink, ChevronRight, ChevronLeft, MapPin, Store,
  Palette, Globe, Phone, Mail, Edit3, Check, X, Camera,
  Truck, FileText, Users, Eye, Sparkles, ArrowRight,
  CheckCircle, ArrowLeft, Settings, Save, Loader2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getMyProducts, updateProfile, uploadAvatar, uploadShopBanner, uploadShopAvatar, getMe } from '../services/api';

const BANNER_THEMES = [
  { id: 'blue', label: 'Ocean Blue', from: 'from-blue-900', via: 'via-blue-800', to: 'to-slate-900', accent: 'border-blue-400', badge: 'bg-blue-500' },
  { id: 'red', label: 'Racing Red', from: 'from-red-900', via: 'via-red-800', to: 'to-zinc-900', accent: 'border-red-400', badge: 'bg-red-500' },
  { id: 'gold', label: 'Premium Gold', from: 'from-yellow-900', via: 'via-amber-800', to: 'to-zinc-900', accent: 'border-yellow-400', badge: 'bg-yellow-500' },
  { id: 'green', label: 'Forest Green', from: 'from-green-900', via: 'via-emerald-800', to: 'to-zinc-900', accent: 'border-green-400', badge: 'bg-green-500' },
  { id: 'purple', label: 'Royal Purple', from: 'from-purple-900', via: 'via-violet-800', to: 'to-zinc-900', accent: 'border-purple-400', badge: 'bg-purple-500' },
];

const SHOP_TAGS = [
  'OEM Parts', 'Performance Upgrades', 'Body Parts', 'Engine Components',
  'Suspension', 'Electrical', 'Brakes', 'Exhaust', 'Cooling', 'Transmission',
  'Wholesale Only', 'Factory Direct', 'Bulk Orders Welcome', 'Fast Dispatch',
];

export default function ProDashboard() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [imageIndexes, setImageIndexes] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  // Server verification state — don't render anything until we verify PRO status
  const [verifying, setVerifying] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [revokeReason, setRevokeReason] = useState(null); // 'deleted' | 'rejected' | null

  // Shop customization state (stored in localStorage for persistence demo)
  const storageKey = `sparehub_shop_${user?.id}`;
  const savedShop = JSON.parse(localStorage.getItem(storageKey) || '{}');

  const [shopData, setShopData] = useState({
    shopName: savedShop.shopName || user?.businessName || user?.name || '',
    tagline: savedShop.tagline || 'Your trusted source for quality auto parts.',
    description: savedShop.description || '',
    phone: savedShop.phone || user?.phone || '',
    email: savedShop.email || user?.email || '',
    website: savedShop.website || '',
    theme: savedShop.theme || 'blue',
    tags: savedShop.tags || [],
    logoText: savedShop.logoText || (user?.businessName || user?.name || 'MY SHOP').substring(0, 2).toUpperCase(),
  });
  const [editingShop, setEditingShop] = useState(false);
  const [shopSaved, setShopSaved] = useState(false);
  const [tempData, setTempData] = useState({ ...shopData });
  const [showWelcome, setShowWelcome] = useState(false);

  // Settings/Profile state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    businessName: user?.businessName || '',
    city: user?.city || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = React.useRef(null);

  // Shop image upload state
  const [bannerUploading, setBannerUploading] = useState(false);
  const [shopAvatarUploading, setShopAvatarUploading] = useState(false);
  const [shopImageError, setShopImageError] = useState('');
  const bannerInputRef = React.useRef(null);
  const shopAvatarInputRef = React.useRef(null);

  const hasBusinessName = user?.businessName || user?.name;

  // Show welcome after user data loads
  useEffect(() => {
    if (user?.isPremium && user?.premiumStatus === 'approved' && !savedShop?.welcomeDismissed) {
      setShowWelcome(true);
    }
  }, [user]);

  useEffect(() => {
    getMyProducts()
      .then(setMyProducts)
      .catch(() => setMyProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  // Verify user still has PRO access with the server before rendering anything
  useEffect(() => {
    let cancelled = false;
    getMe()
      .then(freshUser => {
        if (cancelled) return;
        if (freshUser) {
          const userData = {
            id: freshUser._id,
            name: freshUser.name,
            phone: freshUser.phone,
            email: freshUser.email,
            location: freshUser.location,
            role: freshUser.role,
            avatar: freshUser.avatar || null,
            isPremium: freshUser.isPremium,
            premiumStatus: freshUser.premiumStatus,
            businessName: freshUser.businessName,
            businessType: freshUser.businessType,
            city: freshUser.city,
            bannerImage: freshUser.bannerImage,
            shopAvatar: freshUser.shopAvatar,
          };
          updateUser(userData);
          if (!freshUser.isPremium) {
            setIsPro(false);
            setRevokeReason(freshUser.premiumStatus === 'rejected' ? 'rejected' : 'revoked');
          } else {
            setIsPro(true);
            setRevokeReason(null);
          }
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err?.message || '';
        // "User no longer exists" = 401 from verifyToken (user deleted)
        // "User not found" = 404 from /auth/me (user deleted)
        const isDeletedByAdmin = msg.includes('User no longer exists') || msg.includes('User not found');
        if (isDeletedByAdmin) {
          setIsPro(false);
          setRevokeReason('deleted');
        } else if (msg.includes('Invalid or expired token') || msg.includes('Access denied')) {
          // Token completely invalid
          setIsPro(false);
          setRevokeReason('deleted');
        } else {
          // Network/server error — fallback to logout
          logout();
        }
      })
      .finally(() => {
        if (!cancelled) setVerifying(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading while verifying with server
  if (verifying) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Access denied screen — show specific reason
  if (!isPro) {
    const isDeleted = revokeReason === 'deleted';
    const isRejected = revokeReason === 'rejected';

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-red-500/10 border-2 border-red-500 rounded-full">
            <Shield size={36} className="text-red-500" />
          </div>

          <h2 className="text-3xl font-black uppercase mb-4 tracking-tight">
            {isDeleted
              ? 'Account Removed'
              : isRejected
                ? 'PRO Access Revoked'
                : 'PRO Access Required'}
          </h2>

          <p className="text-zinc-300 text-base leading-relaxed mb-8">
            {isDeleted
              ? 'Your account has been removed by the administrator. If you believe this is a mistake, please contact support.'
              : isRejected
                ? 'The administrator has removed your PRO seller access. You can re-apply if you believe this was done in error.'
                : 'Your PRO access has been revoked or expired. Apply for SpareHub PRO to access this dashboard.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!isDeleted && (
              <button
                onClick={() => navigate('/apply-pro')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-sm tracking-widest transition-all"
              >
                {isRejected ? 'Re-Apply for PRO' : 'Apply for PRO'}
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-black uppercase text-sm tracking-widest transition-all"
            >
              Back to Dashboard
            </button>
          </div>

          {isDeleted && (
            <p className="mt-6 text-xs text-zinc-600 uppercase tracking-widest font-bold">
              All associated data has been removed from the platform
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentTheme = BANNER_THEMES.find(t => t.id === shopData.theme) || BANNER_THEMES[0];

  const stats = [
    { label: 'Total Listings', value: myProducts.length, icon: <Package size={16} />, color: 'text-blue-400' },
    { label: 'Active', value: myProducts.filter(p => p.status === 'active').length, icon: <Check size={16} />, color: 'text-green-400' },
    { label: 'Total Views', value: myProducts.reduce((a, p) => a + (p.views || 0), 0).toLocaleString(), icon: <Eye size={16} />, color: 'text-yellow-400' },
    { label: 'Business Type', value: (user?.businessType || 'seller').replace('_', ' '), icon: <Store size={16} />, color: 'text-purple-400' },
  ];

  const saveShop = () => {
    setShopData({ ...tempData });
    localStorage.setItem(storageKey, JSON.stringify(tempData));
    setEditingShop(false);
    setShopSaved(true);
    setTimeout(() => setShopSaved(false), 3000);
  };

  const dismissWelcome = () => {
    const updated = { ...savedShop, welcomeDismissed: true };
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setShowWelcome(false);
  };

  const showWelcomeAgain = () => {
    setShowWelcome(true);
  };

  const getStarted = () => {
    setTempData(prev => ({ ...prev, shopName: user?.businessName || user?.name || '' }));
    setEditingShop(true);
    dismissWelcome();
  };

  const cancelEdit = () => {
    setTempData({ ...shopData });
    setEditingShop(false);
  };

  const toggleTag = (tag) => {
    setTempData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // Shop banner upload handler
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setShopImageError('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setShopImageError('Image must be under 5MB.');
      return;
    }
    setShopImageError('');
    setBannerUploading(true);
    try {
      const data = await uploadShopBanner(file);
      updateUser({ ...user, bannerImage: data.bannerImage });
      setShopSaved(true);
      setTimeout(() => setShopSaved(false), 3000);
    } catch (err) {
      setShopImageError(err.message || 'Banner upload failed.');
    } finally {
      setBannerUploading(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  // Shop avatar upload handler
  const handleShopAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setShopImageError('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setShopImageError('Image must be under 5MB.');
      return;
    }
    setShopImageError('');
    setShopAvatarUploading(true);
    try {
      const data = await uploadShopAvatar(file);
      updateUser({ ...user, shopAvatar: data.shopAvatar });
      setShopSaved(true);
      setTimeout(() => setShopSaved(false), 3000);
    } catch (err) {
      setShopImageError(err.message || 'Shop avatar upload failed.');
    } finally {
      setShopAvatarUploading(false);
      if (shopAvatarInputRef.current) shopAvatarInputRef.current.value = '';
    }
  };

  const nextImage = (e, idx, count) => {
    e.preventDefault(); e.stopPropagation();
    setImageIndexes(prev => ({ ...prev, [idx]: ((prev[idx] || 0) + 1) % count }));
  };
  const prevImage = (e, idx, count) => {
    e.preventDefault(); e.stopPropagation();
    setImageIndexes(prev => ({ ...prev, [idx]: ((prev[idx] || 0) - 1 + count) % count }));
  };

  // Welcome screen for newly approved PRO sellers
  if (showWelcome && user?.isPremium && user?.premiumStatus === 'approved') {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        
        {/* Hero Banner with Ken Burns effect */}
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img 
            src="/proimg.jpg" 
            alt="PRO" 
            className="absolute inset-0 w-full h-full object-cover animate-heroZoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          
          <div className="relative h-full max-w-6xl mx-auto px-6 flex flex-col justify-end pb-16">
            <div className="flex items-center gap-3 mb-4 animate-fadeUp">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500">
                <Sparkles size={14} className="text-blue-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">PRO Seller</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
              <span className="text-red-600 drop-shadow-lg">SPAREHUB</span><span className="text-white drop-shadow-lg">LK</span> <span className="text-blue-500">PRO</span>
            </h1>
            <p className="text-lg text-zinc-300 max-w-xl animate-fadeUp" style={{ animationDelay: '0.4s' }}>
              Congratulations {user?.name}! Your seller application has been approved. 
              Start building your shop now.
            </p>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="bg-zinc-950 border-b border-zinc-900">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap gap-8">
            {[
              { icon: <CheckCircle size={16} className="text-green-500" />, label: 'Verified Seller' },
              { icon: <Store size={16} className="text-blue-500" />, label: 'Custom Shop Page' },
              { icon: <TrendingUp size={16} className="text-blue-500" />, label: 'Priority Ranking' },
              { icon: <Package size={16} className="text-blue-500" />, label: 'Unlimited Listings' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 animate-fadeUp" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                {item.icon}
                <span className="text-xs font-black uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {[
              { icon: <Store size={28} />, title: 'Your Own Shop', desc: 'Get a custom URL like sparehub.lk/shop/your-business' },
              { icon: <Shield size={28} />, title: 'Verified Badge', desc: 'Blue checkmark builds customer trust' },
              { icon: <TrendingUp size={28} />, title: 'Priority Ranking', desc: 'Appear higher in search results' },
              { icon: <Package size={28} />, title: 'Unlimited Listings', desc: 'Post as many parts as you want' },
              { icon: <BarChart3 size={28} />, title: 'Seller Analytics', desc: 'Track views and performance' },
              { icon: <Truck size={28} />, title: 'Bulk Shipping', desc: 'Priority logistics support' },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-zinc-900/50 border border-zinc-800 p-6 hover:border-blue-500/50 hover:bg-zinc-900 transition-all duration-300 group animate-fadeUp"
                style={{ animationDelay: `${0.8 + i * 0.1}s` }}
              >
                <div className="text-blue-500 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">{feature.icon}</div>
                <h3 className="text-sm font-black uppercase mb-2 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-600/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-600/10 rounded-full blur-2xl" />
            
            <div className="relative text-center">
              <Award size={48} className="text-blue-500 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-black uppercase mb-4">
                Build Your <span className="text-red-600">SPAREHUB</span><span className="text-white">LK</span> <span className="text-blue-500">Shop</span>
              </h2>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Set up your shop name, choose your theme, and start listing your parts in minutes.
                Your custom shop page is ready to go.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={getStarted}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-black uppercase tracking-widest transition-all hover:scale-105"
                >
                  <Store size={18} /> Create My Shop
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={dismissWelcome}
                  className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-blue-500 text-blue-400 font-black uppercase tracking-widest transition-all"
                >
                  Maybe Later
                </button>
</div>
            </div>

          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-20">

        {/* Back to Welcome Button */}
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <button
            onClick={showWelcomeAgain}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Back to Welcome
          </button>
        </div>

        {/* PRO BANNER — Shop Preview Header */}
        <div className={`relative overflow-hidden border-b ${currentTheme.accent} border-opacity-40`}>
          {/* Banner background image or gradient */}
          {user?.bannerImage ? (
            <div className="absolute inset-0">
              <img src={user.bannerImage} alt="Shop Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            </div>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.from} ${currentTheme.via} ${currentTheme.to}`}>
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
              </div>
            </div>
          )}
          <div className="relative max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="flex items-end gap-6">
                {/* Shop Avatar or Logo circle */}
                {user?.shopAvatar ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0 bg-zinc-800">
                    <img src={user.shopAvatar} alt="Shop Avatar" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`w-20 h-20 ${currentTheme.badge} flex items-center justify-center text-2xl font-black text-white border-2 border-white/20 flex-shrink-0`}>
                    {shopData.logoText}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white/20 text-white text-[9px] font-black uppercase px-2 py-0.5 tracking-widest flex items-center gap-1">
                      <Shield size={8} /> Verified PRO
                    </span>
                    <span className="text-white/60 text-[9px] uppercase font-bold">{user?.businessType?.replace('_', ' ')}</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                    {shopData.shopName}<span className="text-white/40">.</span>
                  </h1>
                  <p className="text-white/60 text-xs mt-2 font-medium">{shopData.tagline}</p>
                  {shopData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {shopData.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-[8px] font-bold uppercase px-2 py-0.5 bg-white/10 text-white/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/shop/${encodeURIComponent(shopData.shopName)}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Globe size={12} /> View Public Shop
                </button>
                <button
                  onClick={() => { setActiveTab('customize'); setTempData({ ...shopData }); setEditingShop(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-all"
                >
                  <Palette size={12} /> Customize Shop
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="border-b border-zinc-900 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0">
              {[
                { id: 'overview', label: 'Overview', icon: <BarChart3 size={14} /> },
                { id: 'inventory', label: 'Inventory', icon: <Package size={14} /> },
                { id: 'customize', label: 'Shop Style', icon: <Palette size={14} /> },
                { id: 'settings', label: 'Settings', icon: <Settings size={14} /> },
                { id: 'account', label: 'PRO Account', icon: <Award size={14} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {shopSaved && (
                <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500 text-green-400 text-xs font-bold">
                  <Check size={14} /> Shop saved successfully!
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="bg-zinc-950 border border-zinc-900 p-5 hover:border-zinc-700 transition-colors">
                    <div className={`${s.color} mb-3`}>{s.icon}</div>
                    <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">{s.label}</p>
                    <p className="text-xl font-black capitalize">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* PRO Features Grid */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                  <Star size={12} className="text-yellow-400" /> PRO Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: <Shield size={20} />, title: 'Verified Badge', desc: 'Blue verified checkmark on all listings and your shop profile.', active: true },
                    { icon: <Store size={20} />, title: 'Custom Shop Page', desc: 'Your own branded shop page at /shop/your-name with theme colors.', active: true },
                    { icon: <Truck size={20} />, title: 'Bulk Shipping', desc: 'Priority logistics support for large wholesale orders.', active: true },
                    { icon: <FileText size={20} />, title: 'Invoice & Tax Docs', desc: 'Generate official invoices and tax documentation.', active: true },
                    { icon: <Package size={20} />, title: 'Unlimited Listings', desc: 'Post unlimited parts without any basic tier restrictions.', active: true },
                    { icon: <BarChart3 size={20} />, title: 'Analytics', desc: 'Track views, inquiries, and sales performance.', active: true },
                    { icon: <Users size={20} />, title: 'Direct OEM Access', desc: 'Get access to factory direct pricing networks.', active: true },
                    { icon: <TrendingUp size={20} />, title: 'Priority Listing', desc: 'Your listings appear higher in search results.', active: true },
                  ].map((feature, i) => (
                    <div key={i} className="bg-zinc-950 border border-zinc-900 p-5 hover:border-blue-500/40 transition-colors group">
                      <div className="text-blue-400 mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
                      <h4 className="text-xs font-black uppercase mb-1">{feature.title}</h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/post-ad')}
                  className="flex items-center justify-between p-5 bg-blue-500 hover:bg-blue-400 transition-all text-black"
                >
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase opacity-70">Quick Action</p>
                    <p className="text-sm font-black uppercase">Post New Listing</p>
                  </div>
                  <Plus size={20} />
                </button>
                <button
                  onClick={() => setActiveTab('customize')}
                  className="flex items-center justify-between p-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all"
                >
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase text-zinc-500">Quick Action</p>
                    <p className="text-sm font-black uppercase">Style My Shop</p>
                  </div>
                  <Palette size={20} className="text-zinc-400" />
                </button>
                <button
                  onClick={() => navigate(`/shop/${encodeURIComponent(shopData.shopName)}`)}
                  className="flex items-center justify-between p-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all"
                >
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase text-zinc-500">Quick Action</p>
                    <p className="text-sm font-black uppercase">View Public Shop</p>
                  </div>
                  <ExternalLink size={20} className="text-zinc-400" />
                </button>
              </div>
            </div>
          )}

          {/* ── INVENTORY TAB ── */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase">My Inventory</h2>
                  <p className="text-[10px] text-zinc-500 uppercase mt-1">{myProducts.length} total listings</p>
                </div>
                <button
                  onClick={() => navigate('/post-ad')}
                  className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all"
                >
                  <Plus size={14} /> Add Listing
                </button>
              </div>

              {loadingProducts && <p className="text-zinc-500 text-[10px] uppercase font-bold">Loading...</p>}

              {!loadingProducts && myProducts.length === 0 && (
                <div className="text-center py-20 border border-zinc-900 bg-zinc-950">
                  <Package size={40} className="text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 text-[10px] uppercase font-bold mb-4">No listings yet</p>
                  <button
                    onClick={() => navigate('/post-ad')}
                    className="px-6 py-3 bg-blue-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all"
                  >
                    Post Your First Part
                  </button>
                </div>
              )}

              {myProducts.map((product, idx) => {
                const currentIdx = imageIndexes[idx] || 0;
                const hasImages = product.images && product.images.length > 0;
                const count = product.images?.length || 0;
                return (
                  <div key={idx} className="bg-zinc-950 border border-zinc-900 p-4 flex items-center justify-between group hover:border-zinc-700 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                        {hasImages ? (
                          <>
                            <img src={product.images[currentIdx]} alt={product.title} className="w-full h-full object-cover" />
                            {count > 1 && (
                              <>
                                <button onClick={(e) => prevImage(e, idx, count)} className="absolute left-0 top-0 bottom-0 w-1/2 bg-black/40 hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                  <ChevronLeft size={10} className="text-white" />
                                </button>
                                <button onClick={(e) => nextImage(e, idx, count)} className="absolute right-0 top-0 bottom-0 w-1/2 bg-black/40 hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                  <ChevronRight size={10} className="text-white" />
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-600 font-black">
                            {product._id?.slice(-4).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase group-hover:text-blue-400 transition-colors">{product.title}</h4>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">LKR {Number(product.price).toLocaleString()}</p>
                        {product.location && (
                          <p className="text-[9px] text-zinc-700 uppercase flex items-center gap-1 mt-0.5">
                            <MapPin size={8} className="text-blue-500" /> {product.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden md:block text-right">
                        <p className="text-[8px] font-black text-zinc-600 uppercase">Views</p>
                        <p className="text-xs font-black">{product.views || 0}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${product.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{product.status}</span>
                      </div>
                      <button
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="p-2 border border-zinc-800 hover:border-blue-500 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── CUSTOMIZE TAB ── */}
          {activeTab === 'customize' && (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                  </button>
                  <div>
                    <h2 className="text-xl font-black uppercase">Shop Customization</h2>
                    <p className="text-[10px] text-zinc-500 uppercase mt-1">Style your public shop page</p>
                  </div>
                </div>
                {!editingShop ? (
                  <button
                    onClick={() => { setTempData({ ...shopData }); setEditingShop(true); }}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all"
                  >
                    <Edit3 size={14} /> Edit Shop
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={cancelEdit} className="flex items-center gap-1 px-4 py-3 bg-zinc-800 text-[10px] font-black uppercase hover:bg-zinc-700 transition-all">
                      <X size={12} /> Cancel
                    </button>
                    <button onClick={saveShop} className="flex items-center gap-1 px-4 py-3 bg-green-600 text-[10px] font-black uppercase hover:bg-green-500 transition-all">
                      <Check size={12} /> Save
                    </button>
                  </div>
                )}
              </div>

              {shopSaved && (
                <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500 text-green-400 text-xs font-bold">
                  <Check size={14} /> Shop customization saved!
                </div>
              )}

              {/* Theme Picker */}
              <div className="bg-zinc-950 border border-zinc-900 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Palette size={14} className="text-blue-400" /> Banner Theme
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {BANNER_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      disabled={!editingShop}
                      onClick={() => setTempData(prev => ({ ...prev, theme: theme.id }))}
                      className={`relative h-16 bg-gradient-to-br ${theme.from} ${theme.to} border-2 transition-all ${
                        (editingShop ? tempData.theme : shopData.theme) === theme.id
                          ? 'border-white scale-105'
                          : 'border-zinc-700 opacity-60 hover:opacity-100'
                      } ${!editingShop ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {(editingShop ? tempData.theme : shopData.theme) === theme.id && (
                        <Check size={16} className="absolute inset-0 m-auto text-white" />
                      )}
                      <span className="absolute bottom-1 left-0 right-0 text-center text-[7px] font-black text-white/70 uppercase">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop Images Upload */}
              <div className="bg-zinc-950 border border-zinc-900 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Camera size={14} className="text-blue-400" /> Shop Images
                </h3>

                {shopImageError && (
                  <p className="text-[9px] text-red-400 font-bold mb-3">{shopImageError}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Banner Upload */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Shop Banner</label>
                    <div className="relative h-32 bg-zinc-900 border border-zinc-800 overflow-hidden mb-2">
                      {user?.bannerImage ? (
                        <img src={user.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">No banner uploaded</div>
                      )}
                      {bannerUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 size={20} className="text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerUpload}
                    />
                    <button
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={bannerUploading}
                      className="w-full px-4 py-2 bg-zinc-800 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all disabled:opacity-50"
                    >
                      {bannerUploading ? 'Uploading...' : 'Upload Banner'}
                    </button>
                    <p className="text-[8px] text-zinc-600 mt-1">Recommended: 1200x400px, max 5MB</p>
                  </div>

                  {/* Shop Avatar Upload */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Shop Profile Image</label>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700">
                        {user?.shopAvatar ? (
                          <img src={user.shopAvatar} alt="Shop Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Store size={24} />
                          </div>
                        )}
                        {shopAvatarUploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                            <Loader2 size={20} className="text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={shopAvatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleShopAvatarUpload}
                        />
                        <button
                          onClick={() => shopAvatarInputRef.current?.click()}
                          disabled={shopAvatarUploading}
                          className="px-4 py-2 bg-zinc-800 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all disabled:opacity-50"
                        >
                          {shopAvatarUploading ? 'Uploading...' : 'Upload Profile Image'}
                        </button>
                        <p className="text-[8px] text-zinc-600 mt-1">Square image, max 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-zinc-950 border border-zinc-900 p-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Store size={14} className="text-blue-400" /> Shop Info
                </h3>
                {[
                  { label: 'Shop Name', field: 'shopName', placeholder: 'Your business name', type: 'text' },
                  { label: 'Logo Text (2 chars)', field: 'logoText', placeholder: 'AB', type: 'text', maxLength: 2 },
                  { label: 'Tagline', field: 'tagline', placeholder: 'Short slogan', type: 'text' },
                  { label: 'Phone', field: 'phone', placeholder: '+94 7X XXX XXXX', type: 'tel' },
                  { label: 'Email', field: 'email', placeholder: 'shop@email.com', type: 'email' },
                  { label: 'Website', field: 'website', placeholder: 'https://yoursite.com', type: 'url' },
                ].map(({ label, field, placeholder, type, maxLength }) => (
                  <div key={field}>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">{label}</label>
                    <input
                      type={type}
                      value={editingShop ? tempData[field] : shopData[field]}
                      onChange={e => setTempData(prev => ({ ...prev, [field]: maxLength ? e.target.value.toUpperCase().slice(0, maxLength) : e.target.value }))}
                      disabled={!editingShop}
                      placeholder={placeholder}
                      className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition-colors"
                    />
                  </div>
                ))}

                {/* Description */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Shop Description</label>
                  <textarea
                    rows={4}
                    value={editingShop ? tempData.description : shopData.description}
                    onChange={e => setTempData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={!editingShop}
                    placeholder="Describe your business, specialties, and what makes you stand out..."
                    className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition-colors"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="bg-zinc-950 border border-zinc-900 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4">Shop Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {SHOP_TAGS.map(tag => {
                    const selected = (editingShop ? tempData.tags : shopData.tags).includes(tag);
                    return (
                      <button
                        key={tag}
                        disabled={!editingShop}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all ${
                          selected
                            ? 'bg-blue-500 border-blue-500 text-black'
                            : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500'
                        } ${!editingShop ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        {selected && <Check size={8} className="inline mr-1" />}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview */}
              <div className="bg-zinc-950 border border-zinc-900 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-zinc-500">Live Preview</h3>
                <div className={`relative overflow-hidden ${user?.bannerImage ? '' : `bg-gradient-to-br ${currentTheme.from} ${currentTheme.via} ${currentTheme.to}`} p-6`}>
                  {user?.bannerImage && (
                    <div className="absolute inset-0">
                      <img src={user.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/50" />
                    </div>
                  )}
                  <div className="relative flex items-center gap-4">
                    {user?.shopAvatar ? (
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-white/20 bg-zinc-800">
                        <img src={user.shopAvatar} alt="Shop Avatar" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-14 h-14 ${currentTheme.badge} flex items-center justify-center text-lg font-black text-white`}>
                        {(editingShop ? tempData.logoText : shopData.logoText)}
                      </div>
                    )}
                    <div>
                      <span className="bg-white/20 text-white text-[8px] font-black uppercase px-2 py-0.5 tracking-widest">
                        Verified PRO
                      </span>
                      <h2 className="text-2xl font-black uppercase mt-0.5">
                        {(editingShop ? tempData.shopName : shopData.shopName) || 'Shop Name'}
                      </h2>
                      <p className="text-white/60 text-xs">{(editingShop ? tempData.tagline : shopData.tagline)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                </button>
                <div>
                  <h2 className="text-xl font-black uppercase">Profile Settings</h2>
                  <p className="text-[10px] text-zinc-500 uppercase mt-1">Update your account information</p>
                </div>
              </div>

              {profileSaved && (
                <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500 text-green-400 text-xs font-bold">
                  <Check size={14} /> Profile updated successfully!
                </div>
              )}

              {/* Avatar Section */}
              <div className="bg-zinc-950 border border-zinc-900 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4">Profile Picture</h3>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 border-2 border-red-600 overflow-hidden bg-zinc-900">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-zinc-600">
                          {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {avatarUploading ? (
                        <Loader2 size={20} className="text-white animate-spin" />
                      ) : (
                        <Camera size={20} className="text-white" />
                      )}
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          setAvatarError('Image must be under 5MB');
                          return;
                        }
                        setAvatarError('');
                        setAvatarUploading(true);
                        try {
                          const result = await uploadAvatar(file);
                          updateUser({ ...user, avatar: result.avatar });
                        } catch (err) {
                          setAvatarError(err.message || 'Upload failed');
                        } finally {
                          setAvatarUploading(false);
                          if (avatarInputRef.current) avatarInputRef.current.value = '';
                        }
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Profile Photo</p>
                    <p className="text-[10px] text-zinc-500">Click to upload. Max 5MB.</p>
                    {avatarError && <p className="text-[10px] text-red-500 mt-1">{avatarError}</p>}
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="bg-zinc-950 border border-zinc-900 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4">Account Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 block mb-2">Display Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 block mb-2">Business Name</label>
                    <input
                      type="text"
                      value={profileForm.businessName}
                      onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none transition-all"
                      placeholder="Your business name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 block mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none transition-all"
                        placeholder="07xxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-500 block mb-2">City</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none transition-all"
                        placeholder="Colombo"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 block mb-2">Location</label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm focus:border-red-600 outline-none transition-all"
                      placeholder="Colombo, Kandy, etc."
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setSavingProfile(true);
                      setProfileSaved(false);
                      try {
                        const result = await updateProfile(profileForm);
                        updateUser(result.user);
                        setProfileSaved(true);
                        setTimeout(() => setProfileSaved(false), 3000);
                      } catch (err) {
                        alert(err.message || 'Failed to update profile');
                      } finally {
                        setSavingProfile(false);
                      }
                    }}
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all disabled:opacity-50"
                  >
                    {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── PRO ACCOUNT TAB ── */}
          {activeTab === 'account' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-xl font-black uppercase">PRO Account</h2>

              <div className={`bg-gradient-to-br ${currentTheme.from} ${currentTheme.to} p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <Award size={28} className="text-yellow-300" />
                  <div>
                    <p className="text-[9px] font-black uppercase opacity-70">Member Status</p>
                    <h3 className="text-xl font-black uppercase">SpareHub PRO</h3>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] uppercase font-black opacity-60">Business Name</p>
                    <p className="font-bold text-sm">{user?.businessName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black opacity-60">Business Type</p>
                    <p className="font-bold text-sm capitalize">{user?.businessType?.replace('_', ' ') || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black opacity-60">City</p>
                    <p className="font-bold text-sm">{user?.city || user?.location || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black opacity-60">Verified Status</p>
                    <p className="font-bold text-sm text-green-300 flex items-center gap-1">
                      <Check size={12} /> Approved
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 p-6 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4">Account Details</h3>
                {[
                  { label: 'Full Name', value: user?.name },
                  { label: 'Email', value: user?.email },
                  { label: 'Phone', value: user?.phone },
                  { label: 'Location', value: user?.location },
                  { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-zinc-900">
                    <span className="text-[9px] font-black uppercase text-zinc-500">{label}</span>
                    <span className="text-xs font-bold">{value || '—'}</span>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-950 border border-zinc-900 p-6">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4">PRO Benefits Active</h3>
                {[
                  'Verified PRO badge on profile and listings',
                  'Custom branded shop page',
                  'Unlimited product listings',
                  'Priority position in search results',
                  'Bulk shipping logistics support',
                  'Invoice and tax document generation',
                  'Direct OEM factory pricing network access',
                  'Dedicated seller analytics dashboard',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-zinc-900 last:border-0">
                    <Shield size={12} className="text-blue-400 flex-shrink-0" />
                    <span className="text-xs text-zinc-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
