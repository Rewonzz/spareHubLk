import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StarRating from "../components/StarRating";
import { useAuth } from '../context/AuthContext';
import { getProductById, getReviews, addReview, deleteReview } from '../services/api';
import { Loader2, MapPin, Calendar, Car, Tag, ChevronLeft, ChevronRight, Info, Send, Trash2, MessageSquare, Star } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const { isLoggedIn, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const mapRef = useRef(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const [data, reviewData] = await Promise.all([
          getProductById(id),
          getReviews(id).catch(() => [])
        ]);
        setProduct(data);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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
      const result = await addReview(id, { rating: reviewRating, comment: reviewComment.trim() });
      setReviews(prev => [result.review, ...prev]);
      setReviewRating(0);
      setReviewComment('');
      setReviewSuccess('Review posted successfully!');
      // Update product average rating locally
      if (product) {
        const newCount = (product.reviewCount || 0) + 1;
        const newAvg = ((product.averageRating || 0) * (product.reviewCount || 0) + reviewRating) / newCount;
        setProduct({ ...product, averageRating: Math.round(newAvg * 10) / 10, reviewCount: newCount });
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to post review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      // Refresh product to get updated stats
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      setReviewError(err.message || 'Failed to delete review.');
    }
  };

  // Initialize map when product loads with coordinates
  useEffect(() => {
    if (product?.locationCoords?.lat && product?.locationCoords?.lng && mapRef.current) {
      // Load Leaflet CSS
      const linkEl = document.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkEl);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        if (window.L) {
          const map = window.L.map(mapRef.current, {
            center: [product.locationCoords.lat, product.locationCoords.lng],
            zoom: 14,
          });

          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
          }).addTo(map);

          window.L.marker([product.locationCoords.lat, product.locationCoords.lng]).addTo(map);
        }
      };
      document.head.appendChild(script);
    }
  }, [product]);

  const hasImages = product?.images && product.images.length > 0;
  const hasSpecs = product?.specs && product.specs.length > 0;

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <Loader2 size={40} className="text-red-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <p className="text-zinc-500 uppercase font-black text-[10px] tracking-widest mb-4">Product Not Found</p>
            <Link to="/shop" className="px-8 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Image Gallery */}
          <div className="lg:col-span-7 relative group">
            <div className="absolute inset-0 border-2 border-zinc-800 pointer-events-none z-10 m-4"></div>
            <div className="bg-zinc-900 aspect-[16/10] overflow-hidden relative">
              {hasImages ? (
                <img 
                  src={product.images[currentImageIndex]} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-zinc-700 text-[120px] font-black uppercase opacity-20">
                    {product.title.charAt(0)}
                  </span>
                </div>
              )}

              {hasImages && product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-red-600 p-3 transition-all duration-300"
                  >
                    <ChevronLeft size={24} className="text-white" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-red-600 p-3 transition-all duration-300"
                  >
                    <ChevronRight size={24} className="text-white" />
                  </button>
                </>
              )}
            </div>

            {hasImages && product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`shrink-0 w-20 h-20 border-2 overflow-hidden transition-all ${
                      idx === currentImageIndex ? 'border-red-600' : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <span className="absolute bottom-8 left-8 text-[10px] font-mono text-zinc-600 tracking-[0.5em] uppercase">
              Ref ID: {product._id?.slice(-8).toUpperCase() || 'N/A'}
            </span>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 tracking-widest uppercase italic">
                {product.condition}
              </span>
              {product.category && (
                <span className="bg-zinc-800 text-zinc-300 text-[9px] font-black px-3 py-1 tracking-widest uppercase">
                  {product.category}
                </span>
              )}
            </div>
            
            <h1 className="text-6xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
              {product.title}
            </h1>

            <div className="flex flex-col mb-10 border-y border-zinc-800 py-8">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Transaction Value</span>
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold text-zinc-600 uppercase">LKR</span>
                <span className="text-7xl font-black tracking-tighter text-white">
                  {Number(product.price).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-zinc-800 border border-zinc-800 mb-10">
              <div className="bg-[#0a0a0a] p-6">
                <span className="flex items-center gap-1 text-[10px] font-black text-red-600 uppercase mb-2 italic">
                  <MapPin size={12} /> Location
                </span>
                <span className="font-bold text-sm tracking-tight uppercase">{product.location || 'Colombo, LK'}</span>
              </div>
              <div className="bg-[#0a0a0a] p-6">
                <span className="flex items-center gap-1 text-[10px] font-black text-red-600 uppercase mb-2 italic">
                  <Calendar size={12} /> Year
                </span>
                <span className="font-bold text-sm tracking-tight uppercase">{product.vehicleYear || 'N/A'}</span>
              </div>
            </div>

            {/* Vehicle Details */}
            {product.vehicleModel && (
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Car size={16} className="text-red-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Compatible Vehicle</span>
                </div>
                <p className="text-xl font-black uppercase tracking-tight">{product.vehicleModel}</p>
                {product.chassisNumber && (
                  <p className="text-[10px] text-zinc-500 font-mono mt-2">Chassis: {product.chassisNumber}</p>
                )}
              </div>
            )}

            {/* Sub Category */}
            {product.subCategory && (
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={16} className="text-red-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Part Type</span>
                </div>
                <p className="text-lg font-bold uppercase tracking-tight">{product.subCategory}</p>
              </div>
            )}

            {/* Additional Specifications */}
            {hasSpecs && (
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={16} className="text-red-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Specifications</span>
                </div>
                <div className="space-y-3">
                  {product.specs.map((spec, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{spec.key}</span>
                      <span className="text-sm font-bold text-white uppercase">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Maps Location */}
            {product.locationCoords?.lat && product.locationCoords?.lng && (
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={16} className="text-red-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Seller Location</span>
                </div>
                <div ref={mapRef} className="w-full h-[200px] border border-zinc-700"></div>
                <p className="text-[9px] text-zinc-600 font-mono mt-2">
                  {product.locationCoords.lat.toFixed(4)}, {product.locationCoords.lng.toFixed(4)}
                </p>
              </div>
            )}

            <div className="bg-zinc-900/30 p-8 border-l-2 border-zinc-800 mb-10">
              <div className="group block mb-6">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Seller</p>
                <h4 className="text-2xl font-black uppercase tracking-tighter group-hover:text-red-600 transition-colors">
                  @{product.seller?.name || product.sellerUsername || 'Anonymous'}
                </h4>
              </div>

              <div className="space-y-3">
                {(product.seller?.phone || product.sellerPhone) && (
                  <div className="text-center">
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Contact</p>
                    <p className="text-white text-sm font-bold">{product.seller?.phone || product.sellerPhone}</p>
                  </div>
                )}
                <a 
                  href={(product.seller?.phone || product.sellerPhone) ? `tel:+94${(product.seller?.phone || product.sellerPhone).slice(1)}` : '#'}
                  className="block w-full bg-white text-black text-center py-5 font-black uppercase tracking-[0.3em] text-xs hover:bg-red-600 hover:text-white transition-all duration-500"
                >
                  Contact Seller
                </a>

                <a 
                  href={(product.seller?.phone || product.sellerPhone) ? `https://wa.me/94${(product.seller?.phone || product.sellerPhone).slice(1)}?text=I'm interested in the ${product.title}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full border border-zinc-700 py-5 font-black uppercase tracking-[0.3em] text-xs hover:bg-green-600 hover:border-green-600 transition-all duration-300"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Inquiry
                </a>
              </div>
            </div>

            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest text-center italic">
              Safety Verification Required Before Offline Payment.
            </div>
          </div>
        </div>

        {/* ── REVIEWS SECTION ── */}
        <div className="mt-20 border-t border-zinc-800 pt-16">
          <div className="flex items-center gap-3 mb-10">
            <MessageSquare size={20} className="text-red-600" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Ratings & Feedback</h2>
            {product.reviewCount > 0 && (
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                {product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Average Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-6 mb-12 bg-zinc-900/30 border border-zinc-800 p-6">
              <div className="text-center">
                <p className="text-5xl font-black text-white">{product.averageRating?.toFixed(1) || '0.0'}</p>
                <StarRating rating={product.averageRating || 0} size={18} />
              </div>
              <div className="h-12 w-px bg-zinc-800"></div>
              <div>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                  Based on {product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''}
                </p>
                <div className="mt-2 flex gap-2">
                  {[5,4,3,2,1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const pct = product.reviewCount > 0 ? (count / product.reviewCount) * 100 : 0;
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
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 mb-10">
              <h3 className="text-sm font-black uppercase mb-4">Write a Review</h3>
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
                  placeholder="Share your experience with this part..."
                  rows={4}
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
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 mb-10 text-center">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                <Link to="/register" className="text-red-500 hover:underline">Sign up</Link> or log in to leave a review
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
            <div className="p-12 text-center border border-dashed border-zinc-800">
              <Star size={32} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-xs uppercase font-bold">No reviews yet</p>
              <p className="text-[10px] text-zinc-600 mt-1">Be the first to share your feedback</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review._id} className="bg-black border border-zinc-800 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {review.user?.avatar ? (
                        <img src={review.user.avatar} alt="" className="w-8 h-8 object-cover border border-zinc-800" />
                      ) : (
                        <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <span className="text-[10px] font-black text-zinc-500">{(review.userName || 'U').charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold uppercase">{review.userName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating rating={review.rating} size={12} />
                          <span className="text-[9px] text-zinc-600">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {(user?.role === 'admin' || user?.id === review.user?._id) && (
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
      </main>

      <Footer />
    </div>
  );
}
