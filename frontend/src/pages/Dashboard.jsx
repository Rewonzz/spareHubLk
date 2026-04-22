import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Package,
  MessageSquare,
  TrendingUp,
  Plus,
  Settings,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getMyProducts } from '../services/api';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return path;
};

const truncateLocation = (location, maxLen = 25) => {
  if (!location) return '';
  if (location.length <= maxLen) return location;
  return location.slice(0, maxLen) + '...';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user]);

  if (user?.role === 'admin') {
    return null;
  }
  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [imageIndexes, setImageIndexes] = useState({});

  useEffect(() => {
    getMyProducts()
      .then(setMyProducts)
      .catch(() => setMyProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  const stats = [
    { label: "Active Listings", value: myProducts.filter(p => p.status === 'active').length.toString(), icon: <Package size={18} />, color: "text-blue-500" },
    { label: "Total Views", value: myProducts.reduce((acc, p) => acc + (p.views || 0), 0).toLocaleString(), icon: <BarChart3 size={18} />, color: "text-red-600" },
    { label: "Inquiries", value: "–", icon: <MessageSquare size={18} />, color: "text-green-500" },
    { label: "Products", value: myProducts.length.toString(), icon: <TrendingUp size={18} />, color: "text-purple-500" },
  ];

  const getProStatus = () => {
    if (!user) return null;
    if (user.premiumStatus === 'approved' || user.isPremium) {
      return { status: 'approved', label: 'Verified Pro Seller', icon: <CheckCircle size={16} /> };
    }
    if (user.premiumStatus === 'pending') {
      return { status: 'pending', label: 'Verification Pending', icon: <Clock size={16} /> };
    }
    return { status: 'none', label: 'Apply for PRO', icon: <Award size={16} /> };
  };

  const proStatus = getProStatus();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="p-6 lg:p-10 pt-28 max-w-7xl mx-auto">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-l-4 border-red-600 pl-6">
          <div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-2">My Dashboard</p>
            <h1 className="text-4xl font-black uppercase tracking-tighter">My Listings</h1>
            {user && (
              <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
                <MapPin size={10} className="text-red-600" /> {user.name} · {user.location}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/post-ad')}
            className="bg-white text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Post New Ad
          </button>
        </div>

        {/* TELEMETRY STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-zinc-950 border border-zinc-900 p-6 group hover:border-red-600 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-zinc-900 text-zinc-400 group-hover:text-red-600 transition-colors">{stat.icon}</div>
                <span className="text-[10px] font-black text-zinc-700">0{i + 1}</span>
              </div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ACTIVE INVENTORY */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600"></div> Active Inventory
              </h3>
              <span className="text-[10px] text-zinc-600 uppercase font-bold">Total: {myProducts.length} Units</span>
            </div>

            {loadingProducts && (
              <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">Loading listings...</p>
            )}

            {!loadingProducts && myProducts.length === 0 && (
              <div className="border border-zinc-900 bg-zinc-950 p-10 text-center">
                <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mb-4">No listings yet</p>
                <button
                  onClick={() => navigate('/post-ad')}
                  className="bg-red-600 px-6 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  Post Your First Ad
                </button>
              </div>
            )}

            {myProducts.map((product, idx) => {
              const currentIdx = imageIndexes[idx] || 0;
              const hasImages = product.images && product.images.length > 0;
              const imageCount = product.images?.length || 0;
              
              const nextImage = (e) => {
                e.preventDefault();
                e.stopPropagation();
                setImageIndexes(prev => ({ ...prev, [idx]: (currentIdx + 1) % imageCount }));
              };
              
              const prevImage = (e) => {
                e.preventDefault();
                e.stopPropagation();
                setImageIndexes(prev => ({ ...prev, [idx]: (currentIdx - 1 + imageCount) % imageCount }));
              };
              
              return (
              <div key={idx} className="bg-zinc-950 border border-zinc-900 p-4 flex items-center justify-between group hover:bg-zinc-900/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                    {hasImages ? (
                      <>
                        <img src={getImageUrl(product.images[currentIdx])} alt={product.title} className="w-full h-full object-cover" />
                        {imageCount > 1 && (
                          <>
                            <button onClick={prevImage} className="absolute left-0 top-0 bottom-0 w-1/2 bg-black/40 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <ChevronLeft size={12} className="text-white" />
                            </button>
                            <button onClick={nextImage} className="absolute right-0 top-0 bottom-0 w-1/2 bg-black/40 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <ChevronRight size={12} className="text-white" />
                            </button>
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[7px] px-1.5 py-0.5">
                              {currentIdx + 1}/{imageCount}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-zinc-600 italic">
                        {product._id?.slice(-4).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase group-hover:text-red-600 transition-colors">{product.title}</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase">
                      LKR {Number(product.price).toLocaleString()}
                      {product.vehicleModel && <span className="text-zinc-600"> · {product.vehicleModel}</span>}
                    </p>
                    {product.location && (
                      <p className="text-[9px] text-zinc-700 uppercase flex items-center gap-1">
                        <MapPin size={8} className="text-red-600" /> {truncateLocation(product.location)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="hidden md:block text-right">
                    <p className="text-[8px] font-black text-zinc-600 uppercase">Views</p>
                    <p className="text-xs font-black">{product.views || 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${product.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                    <span className="text-[9px] font-black uppercase tracking-widest">{product.status}</span>
                  </div>
                  <button className="p-2 border border-zinc-800 hover:border-white transition-colors">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
              );
            })}
          </div>

          {/* SIDEBAR TOOLS */}
          <div className="space-y-6">
            {/* PREMIUM STATUS BLOCK */}
            {user?.isPremium ? (
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} className="text-yellow-300" />
                  <h3 className="text-sm font-black uppercase">SpareHub PRO</h3>
                </div>
                <p className="text-[10px] font-bold uppercase mb-4 leading-relaxed opacity-80">
                  You are a verified PRO member. Access your premium shop and features.
                </p>
                <button
                  onClick={() => navigate('/pro-dashboard')}
                  className="w-full bg-black text-white py-3 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all flex items-center justify-center gap-2"
                >
                  <Award size={12} /> Go to PRO Dashboard
                </button>
              </div>
            ) : user?.premiumStatus === 'pending' ? (
              <div className="bg-yellow-600 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} />
                  <h3 className="text-sm font-black uppercase">Application Pending</h3>
                </div>
                <p className="text-[10px] font-bold uppercase mb-4 leading-relaxed opacity-80">
                  Your PRO application is under review. We'll notify you within 2-3 business days.
                </p>
              </div>
            ) : user?.premiumStatus === 'rejected' ? (
              <div className="bg-zinc-900 border border-red-600 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={16} className="text-red-500" />
                  <h3 className="text-sm font-black uppercase text-red-500">Application Rejected</h3>
                </div>
                <p className="text-[10px] font-bold uppercase mb-4 leading-relaxed text-zinc-400">
                  Your application was not approved. You may re-apply with updated documents.
                </p>
                <button
                  onClick={() => navigate('/apply-pro')}
                  className="w-full bg-red-600 text-white py-3 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-500 transition-all"
                >
                  Re-Apply for PRO
                </button>
              </div>
            ) : (
              <div className="bg-red-600 p-6">
                <h3 className="text-sm font-black uppercase mb-2">Premium Status</h3>
                <p className="text-[10px] font-bold uppercase mb-6 leading-relaxed opacity-80">Your account is currently on the Basic Tier. Upgrade to list unlimited parts and get verified.</p>
                <button
                  onClick={() => navigate('/apply-pro')}
                  className="w-full bg-black text-white py-3 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all"
                >
                  Upgrade to PRO
                </button>
              </div>
            )}

            <div className="bg-zinc-950 border border-zinc-900 p-6">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Settings size={14} className="text-red-600" /> System Settings
              </h3>
              <div className="space-y-1">
                {["Identity Profile", "Communication Logs", "Security Protocol"].map((item) => (
                  <button key={item} className="w-full flex items-center justify-between py-3 text-[9px] font-black uppercase text-zinc-500 hover:text-white border-b border-zinc-900 transition-all">
                    {item} <ChevronRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}