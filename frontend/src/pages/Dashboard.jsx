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
  MapPin
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getMyProducts } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="p-6 lg:p-10 pt-28 max-w-7xl mx-auto">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-l-4 border-red-600 pl-6">
          <div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-2">Command_Console_v2.1</p>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Pilot Dashboard</h1>
            {user && (
              <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
                <MapPin size={10} className="text-red-600" /> {user.username} · {user.sector}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/post-ad')}
            className="bg-white text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Deploy New Listing
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

            {myProducts.map((product, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-900 p-4 flex items-center justify-between group hover:bg-zinc-900/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[8px] font-black text-zinc-600 italic">
                    {product._id?.slice(-4).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase group-hover:text-red-600 transition-colors">{product.title}</h4>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase">
                      LKR {Number(product.price).toLocaleString()}
                      {product.vehicleModel && <span className="text-zinc-600"> · {product.vehicleModel}</span>}
                    </p>
                    {product.location && (
                      <p className="text-[9px] text-zinc-700 uppercase flex items-center gap-1">
                        <MapPin size={8} className="text-red-600" /> {product.location}
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
            ))}
          </div>

          {/* SIDEBAR TOOLS */}
          <div className="space-y-6">
            <div className="bg-red-600 p-6">
              <h3 className="text-sm font-black uppercase mb-2">Premium Status</h3>
              <p className="text-[10px] font-bold uppercase mb-6 leading-relaxed opacity-80">Your Pilot account is currently on the Basic Tier. Upgrade to list unlimited parts.</p>
              <button className="w-full bg-black text-white py-3 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all">Upgrade System</button>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 p-6">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Settings size={14} className="text-red-600" /> System Settings
              </h3>
              <div className="space-y-1">
                {["Identity Profile", "Communication Logs", "Billing History", "Security Protocol"].map((item) => (
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