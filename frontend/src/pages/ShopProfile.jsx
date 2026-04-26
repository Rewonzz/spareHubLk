import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Shield, MapPin, Phone, Mail, Globe, Package,
  Star, Building, Clock, ChevronRight, Award,
  MessageSquare, Send, Loader2, Trash2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import {
  getSellerProducts, getSellerReviews, getSellerReviewStats,
  addSellerReview, deleteSellerReview,
} from '../services/api';

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
  const { isLoggedIn, user } = useAuth();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shopCustom, setShopCustom] = useState(null);

  // Seller reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ total: 0, avgRating: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

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

          // Load seller reviews
          setReviewsLoading(true);
          try {
            const [revData, revStats] = await Promise.all([
              getSellerReviews(sellerIdValue).catch(() => []),
              getSellerReviewStats(sellerIdValue).catch(() => ({ total: 0, avgRating: 0 })),
            ]);
            setReviews(Array.isArray(revData) ? revData : []);
            setReviewStats(revStats);
          } catch {
            setReviews([]);
          } finally {
            setReviewsLoading(false);
          }

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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating || !reviewComment.trim()) {
      setReviewError('Please provide a rating and comment.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      const sellerIdValue = sellerId || seller?._id;
      const result = await addSellerReview(sellerIdValue, { rating: reviewRating, comment: reviewComment.trim() });
      setReviews(prev => [result.review, ...prev]);
      setReviewStats(prev => ({
        total: prev.total + 1,
        avgRating: Math.round(((prev.avgRating * prev.total) + reviewRating) / (prev.total + 1) * 10) / 10,
      }));
      setReviewRating(0);
      setReviewComment('');
      setReviewSuccess('Review posted successfully!');
    } catch (err) {
      setReviewError(err.message || 'Failed to post review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteSellerReview(reviewId);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (err) {
      setReviewError(err.message);
    }
  };

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

      {/* PRO VERIFICATION STRIP */}
      {isPremium && (
        <div className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b border-blue-700">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center gap-2">
            <Shield size={14} className="text-blue-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">
              Verified SpareHub PRO Seller — Quality Guaranteed
            </span>
            <Award size={14} className="text-yellow-400" />
          </div>
        </div>
      )}

      {/* HERO BANNER */}
      <header className={`relative overflow-hidden pt-24 pb-16 ${!seller.bannerImage ? `bg-gradient-to-br ${theme.from} ${theme.via} ${theme.to}` : ''}`}>
        {/* Banner background image */}
        {seller.bannerImage && (
          <div className="absolute inset-0">
            <img src={seller.bannerImage} alt="Shop Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/60" />
          </div>
        )}
        {/* Fallback gradient decorations */}
        {!seller.bannerImage && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="flex items-end gap-6">
              {/* Shop Avatar or Logo */}
              {seller.shopAvatar ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0 bg-zinc-800">
                  <img src={seller.shopAvatar} alt="Shop Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-20 h-20 ${theme.badge} flex items-center justify-center text-2xl font-black text-white border-2 border-white/20 flex-shrink-0`}>
                  {logoText}
                </div>
              )}
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
            <div className="grid grid-cols-3 gap-8 border-l border-white/20 pl-8">
              <div>
                <p className="text-white/50 text-[9px] font-black uppercase mb-1">Inventory</p>
                <p className="text-3xl font-black">{products.length}</p>
              </div>
              <div>
                <p className="text-white/50 text-[9px] font-black uppercase mb-1">Reviews</p>
                <p className="text-3xl font-black">{reviewStats.total}</p>
                {reviewStats.total > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] text-white/70 font-bold">{reviewStats.avgRating}</span>
                  </div>
                )}
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
            <div className={`flex items-center justify-between mb-6 p-4 border ${isPremium ? 'bg-blue-950/20 border-blue-900/40' : 'bg-zinc-950 border-zinc-900'}`}>
              <div className="flex items-center gap-3">
                {isPremium && <Shield size={16} className="text-blue-500" />}
                <h3 className={`text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 ${isPremium ? 'text-blue-400' : 'text-zinc-400'}`}>
                  <Package size={12} /> {isPremium ? 'PRO Inventory' : 'Current Stock'} — {products.length} items
                </h3>
              </div>
              {isPremium && (
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 border border-blue-500/20">
                  Verified Listings
                </span>
              )}
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
                    isPro={isPremium}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── SELLER REVIEWS SECTION ── */}
        <div className="mt-16 border-t border-zinc-900 pt-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-10">
              <MessageSquare size={20} className="text-red-600" />
              <h2 className="text-2xl font-black uppercase tracking-tighter">Seller Reviews</h2>
              {reviewStats.total > 0 && (
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                  {reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Average Rating */}
            {reviewStats.total > 0 && (
              <div className="flex items-center gap-6 mb-12 bg-zinc-950 border border-zinc-900 p-6">
                <div className="text-center">
                  <p className="text-5xl font-black text-white">{reviewStats.avgRating.toFixed(1)}</p>
                  <StarRating rating={reviewStats.avgRating} size={18} />
                </div>
                <div className="h-12 w-px bg-zinc-800"></div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                    Based on {reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''}
                  </p>
                  <div className="mt-2 flex gap-2">
                    {[5,4,3,2,1].map(star => {
                      const count = reviews.filter(r => r.rating === star).length;
                      const pct = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-1.5">
                          <Star size={10} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-[9px] text-zinc-400 font-bold">{star}</span>
                          <div className="w-16 h-1 bg-zinc-800">
                            <div className="h-full bg-yellow-500" style={{width: `${pct}%`}}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Review Form */}
            {isLoggedIn ? (
              <div className="bg-zinc-950 border border-zinc-900 p-6 mb-10">
                <h3 className="text-sm font-black uppercase mb-4">Review this Seller</h3>
                {reviewError && (
                  <p className="text-[10px] text-red-400 font-bold uppercase bg-red-900/20 border border-red-900/40 px-3 py-2 mb-3">{reviewError}</p>
                )}
                {reviewSuccess && (
                  <p className="text-[10px] text-green-400 font-bold uppercase bg-green-900/20 border border-green-900/40 px-3 py-2 mb-3">{reviewSuccess}</p>
                )}
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-2">Your Rating</p>
                    <StarRating rating={reviewRating} size={24} interactive onRate={setReviewRating} />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this seller..."
                    rows={3}
                    maxLength={500}
                    className="w-full bg-black border border-zinc-800 p-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-600 transition-all resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-600">{reviewComment.length}/500</span>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all disabled:opacity-50"
                    >
                      <Send size={12} /> {reviewSubmitting ? 'Posting...' : 'Post Review'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-zinc-950 border border-zinc-900 p-6 mb-10 text-center">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                  <Link to="/register" className="text-red-500 hover:underline">Sign up</Link> or log in to review this seller
                </p>
              </div>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="p-8 text-center">
                <Loader2 size={24} className="text-zinc-600 mx-auto mb-2 animate-spin" />
                <p className="text-zinc-500 text-[10px] uppercase font-bold">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-zinc-900">
                <Star size={32} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-xs uppercase font-bold">No reviews yet</p>
                <p className="text-[10px] text-zinc-600 mt-1">Be the first to review this seller</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map(review => (
                  <div key={review._id} className="bg-zinc-950 border border-zinc-900 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {review.reviewer?.avatar || review.reviewerAvatar ? (
                          <img src={review.reviewer?.avatar || review.reviewerAvatar} alt="" className="w-8 h-8 object-cover border border-zinc-700" />
                        ) : (
                          <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <span className="text-[10px] font-black text-zinc-500">{(review.reviewerName || 'U').charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold uppercase">{review.reviewerName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating rating={review.rating} size={12} />
                            <span className="text-[9px] text-zinc-600">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {(user?.role === 'admin' || user?.id === (review.reviewer?._id || review.reviewer)) && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="p-1.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                          title="Delete Review"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-zinc-300 mt-3 leading-relaxed">{review.comment}</p>
                  </div>
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
