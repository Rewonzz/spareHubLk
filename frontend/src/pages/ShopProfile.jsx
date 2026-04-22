import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield, MapPin, Phone, Mail, Globe, Package,
  Star, Building, Clock, ChevronRight, Award
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { getSellerProducts } from '../services/api';

// Fetch seller by username — searches products for seller info
async function fetchSellerByName(sellerName) {
  // First search products to find a seller with this username
  const res = await fetch(`/api/products?search=`);
  const products = await res.json();
  const match = products.find(
    p => p.sellerUsername?.toLowerCase() === decodeURIComponent(sellerName).toLowerCase()
  );
  if (!match || !match.seller) return null;
  return match.seller; // This is the seller ObjectId from .populate
}

const THEME_COLORS = {
  blue: { from: 'from-blue-900', via: 'via-blue-800', to: 'to-slate-900', badge: 'bg-blue-500', accent: 'text-blue-400', border: 'border-blue-500/30' },
  red: { from: 'from-red-900', via: 'via-red-800', to: 'to-zinc-900', badge: 'bg-red-500', accent: 'text-red-400', border: 'border-red-500/30' },
  gold: { from: 'from-yellow-900', via: 'via-amber-800', to: 'to-zinc-900', badge: 'bg-yellow-500', accent: 'text-yellow-400', border: 'border-yellow-500/30' },
  green: { from: 'from-green-900', via: 'via-emerald-800', to: 'to-zinc-900', badge: 'bg-green-500', accent: 'text-green-400', border: 'border-green-500/30' },
  purple: { from: 'from-purple-900', via: 'via-violet-800', to: 'to-zinc-900', badge: 'bg-purple-500', accent: 'text-purple-400', border: 'border-purple-500/30' },
};

export default function ShopProfile() {
  const { sellerName, sellerId } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shopCustom, setShopCustom] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        let sellerIdValue = sellerId;

        if (!sellerIdValue && sellerName) {
          const res = await fetch(`/api/products`);
          const allProducts = await res.json();
          const matchedProduct = allProducts.find(
            p => p.sellerUsername?.toLowerCase() === decodeURIComponent(sellerName).toLowerCase()
          );
          if (!matchedProduct) {
            setError('Shop not found.');
            setLoading(false);
            return;
          }
          sellerIdValue = typeof matchedProduct.seller === 'object'
            ? matchedProduct.seller._id || matchedProduct.seller
            : matchedProduct.seller;
        }

        if (sellerIdValue) {
          const sellerProducts = await getSellerProducts(sellerIdValue);
          setProducts(sellerProducts);

          try {
            const profileRes = await fetch(`/api/premium/seller/${sellerIdValue}`);
            if (profileRes.ok) {
              const profile = await profileRes.json();
              setSeller(profile);
              const storageKey = `sparehub_shop_${sellerIdValue}`;
              const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
              setShopCustom(saved);
            } else if (sellerName) {
              setSeller({
                name: sellerName,
                isPremium: false,
              });
            }
          } catch {
            if (sellerName) {
              setSeller({ name: sellerName, isPremium: false });
            }
          }
        } else {
          setError('Shop not found.');
        }
      } catch {
        setError('Failed to load shop.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sellerName, sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest animate-pulse">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen text-center px-6">
          <div>
            <Building size={40} className="text-zinc-700 mx-auto mb-4" />
            <h2 className="text-xl font-black uppercase mb-2">Shop Not Found</h2>
            <p className="text-zinc-500 text-sm mb-6">{error || 'This seller profile does not exist.'}</p>
            <button onClick={() => navigate('/shop')} className="px-6 py-3 bg-red-600 font-black uppercase text-sm hover:bg-red-500 transition-all">
              Browse All Parts
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPremium = seller.isPremium;
  const themeName = shopCustom?.theme || 'blue';
  const theme = THEME_COLORS[themeName] || THEME_COLORS.blue;

  const shopName = shopCustom?.shopName || seller.businessName || seller.name;
  const tagline = shopCustom?.tagline || (isPremium ? 'Verified PRO Seller' : 'SpareHub Seller');
  const logoText = shopCustom?.logoText || shopName?.substring(0, 2).toUpperCase() || 'SP';
  const tags = shopCustom?.tags || [];
  const description = shopCustom?.description || '';
  const shopPhone = shopCustom?.phone || seller.phone;
  const shopEmail = shopCustom?.email || seller.email;
  const shopWebsite = shopCustom?.website || '';

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* HERO BANNER */}
      <header className={`relative bg-gradient-to-br ${theme.from} ${theme.via} ${theme.to} pt-24 pb-16`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="flex items-end gap-6">
              {/* Logo */}
              <div className={`w-20 h-20 ${theme.badge} flex items-center justify-center text-2xl font-black text-white border-2 border-white/20 flex-shrink-0`}>
                {logoText}
              </div>
              <div>
                {/* Badges */}
                <div className="flex items-center gap-2 mb-2">
                  {isPremium && (
                    <span className="flex items-center gap-1 bg-white/20 text-white text-[9px] font-black uppercase px-2 py-1 tracking-widest">
                      <Shield size={8} /> Verified PRO
                    </span>
                  )}
                  {seller.businessType && (
                    <span className="text-white/60 text-[9px] font-black uppercase tracking-widest capitalize">
                      {seller.businessType.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                  {shopName}<span className="text-white/30">.</span>
                </h1>
                <p className="text-white/60 text-sm mt-2 font-medium">{tagline}</p>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.slice(0, 5).map(tag => (
                      <span key={tag} className="text-[8px] font-bold uppercase px-2 py-0.5 bg-white/10 text-white/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 border-l border-white/20 pl-8">
              <div>
                <p className="text-white/50 text-[9px] font-black uppercase mb-1">Inventory</p>
                <p className="text-3xl font-black">{products.length}</p>
              </div>
              <div>
                <p className="text-white/50 text-[9px] font-black uppercase mb-1">Location</p>
                <p className="text-sm font-black">{seller.city || seller.location || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* SIDEBAR */}
          <div className="lg:col-span-1 space-y-4">
            {/* About */}
            {description && (
              <div className={`bg-zinc-950 border ${theme.border} p-5`}>
                <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">About</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">{description}</p>
              </div>
            )}

            {/* Contact */}
            <div className="bg-zinc-950 border border-zinc-900 p-5">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-4">Contact</h3>
              <div className="space-y-3">
                {shopPhone && (
                  <div className="flex items-center gap-3">
                    <Phone size={12} className="text-zinc-500 flex-shrink-0" />
                    <span className="text-xs font-bold">{shopPhone}</span>
                  </div>
                )}
                {shopEmail && (
                  <div className="flex items-center gap-3">
                    <Mail size={12} className="text-zinc-500 flex-shrink-0" />
                    <span className="text-xs font-bold break-all">{shopEmail}</span>
                  </div>
                )}
                {shopWebsite && (
                  <div className="flex items-center gap-3">
                    <Globe size={12} className="text-zinc-500 flex-shrink-0" />
                    <a href={shopWebsite} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-400 hover:underline break-all">
                      {shopWebsite.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {(seller.city || seller.location) && (
                  <div className="flex items-center gap-3">
                    <MapPin size={12} className="text-zinc-500 flex-shrink-0" />
                    <span className="text-xs font-bold">{seller.city || seller.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* PRO Badge */}
            {isPremium && (
              <div className={`bg-gradient-to-br ${theme.from} ${theme.to} p-5 border ${theme.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Award size={16} className="text-yellow-300" />
                  <h3 className="text-xs font-black uppercase">SpareHub PRO</h3>
                </div>
                <p className="text-[9px] text-white/60 leading-relaxed">
                  This seller is a verified PRO member. All listings are quality-checked and the seller has provided verified business documentation.
                </p>
              </div>
            )}
          </div>

          {/* PRODUCTS GRID */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-2">
                <Package size={12} /> Current Stock — {products.length} items
              </h3>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 border border-zinc-900 bg-zinc-950">
                <Package size={36} className="text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-xs uppercase font-bold">No active listings found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                {products.map(product => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    title={product.title}
                    price={product.price}
                    location={product.location}
                    condition={product.condition}
                    category={product.category}
                    subCategory={product.subCategory}
                    vehicleModel={product.vehicleModel}
                    vehicleYear={product.vehicleYear}
                    sellerUsername={product.sellerUsername}
                    images={product.images}
                    isDark={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
