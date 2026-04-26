import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, TrendingUp, Loader2, Shield, Store } from 'lucide-react';
import { getPlatformFeedback, getSellerReviews } from '../services/api';
import StarRating from './StarRating';

export default function RecentReviews() {
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentReviews();
  }, []);

  const loadRecentReviews = async () => {
    setLoading(true);
    try {
      // Get platform feedback and merge with some seller reviews
      const [platformFb] = await Promise.all([
        getPlatformFeedback().catch(() => []),
      ]);

      const platformItems = (Array.isArray(platformFb) ? platformFb : []).map(fb => ({
        _id: fb._id,
        type: 'platform',
        name: fb.userName,
        avatar: fb.user?.avatar || fb.userAvatar,
        rating: fb.rating,
        comment: fb.comment,
        date: fb.createdAt,
        target: 'SpareHub Platform',
      }));

      // Limit to latest 6
      const combined = platformItems.slice(0, 6);
      setRecentReviews(combined);
    } catch {
      setRecentReviews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Loader2 size={24} className="text-zinc-600 mx-auto mb-3 animate-spin" />
          <p className="text-zinc-500 text-xs uppercase font-bold">Loading recent reviews...</p>
        </div>
      </section>
    );
  }

  if (recentReviews.length === 0) {
    return null; // Hide if no reviews
  }

  return (
    <section className="py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-red-600" />
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">Live Activity</span>
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
              Recently <span className="text-red-600">Added</span>
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2 text-zinc-500 text-xs uppercase font-bold tracking-widest">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            Latest Ratings & Feedback
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentReviews.map((review) => (
            <div
              key={review._id}
              className="bg-zinc-950 border border-zinc-900 p-5 hover:border-red-900/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt=""
                      className="w-10 h-10 object-cover border border-zinc-800"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <span className="text-xs font-black text-zinc-500">
                        {(review.name || 'U').charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase text-white">{review.name}</p>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-black text-yellow-500">{review.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {review.type === 'platform' ? (
                  <span className="text-[8px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-0.5 border border-blue-400/20 flex items-center gap-1">
                    <Shield size={8} /> Platform
                  </span>
                ) : (
                  <span className="text-[8px] font-black uppercase tracking-widest text-green-400 bg-green-400/10 px-2 py-0.5 border border-green-400/20 flex items-center gap-1">
                    <Store size={8} /> Seller
                  </span>
                )}
                <span className="text-[9px] text-zinc-600">{review.target}</span>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed mb-3">
                "{review.comment}"
              </p>

              <StarRating rating={review.rating} size={12} />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-800 hover:border-red-600 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <MessageSquare size={12} /> Browse All Reviews
          </Link>
        </div>
      </div>
    </section>
  );
}
