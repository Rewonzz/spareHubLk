import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import {
  getPlatformFeedback,
  getPlatformFeedbackStats,
  addPlatformFeedback,
  deletePlatformFeedback,
} from '../services/api';
import StarRating from './StarRating';
import AuthGuardModal from './AuthGuardModal';

export default function Testimonials() {
  const { user } = useAuth();
  const { guardAction, AuthGuardModalProps } = useAuthGuard();

  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('platform');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const [fbData, statsData] = await Promise.all([
        getPlatformFeedback().catch(() => []),
        getPlatformFeedbackStats().catch(() => ({ total: 0, avgRating: 0, distribution: {} })),
      ]);
      setFeedbacks(Array.isArray(fbData) ? fbData : []);
      setStats(statsData);
    } catch {
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      setError('Please provide a rating and comment.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const result = await addPlatformFeedback({ rating, comment: comment.trim(), category });
      setFeedbacks(prev => [result.feedback, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        avgRating: Math.round(((prev.avgRating * prev.total) + rating) / (prev.total + 1) * 10) / 10,
      }));
      setRating(0);
      setComment('');
      setSuccess('Thank you for your feedback!');
      setTimeout(() => setShowForm(false), 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await deletePlatformFeedback(id);
      setFeedbacks(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const displayFeedbacks = feedbacks.length > 0 ? feedbacks : [
    { _id: 'demo1', userName: 'Kasun Perera', comment: 'Found a genuine Axio headlight within minutes. Great seller communication.', rating: 5, createdAt: new Date().toISOString() },
    { _id: 'demo2', userName: 'Dilshan R.', comment: 'The direct deal was smooth. Seller was very transparent about the part condition.', rating: 4, createdAt: new Date().toISOString() },
    { _id: 'demo3', userName: 'Sandun M.', comment: 'Best platform in SL for spare parts. Saved me a lot of time traveling to shops.', rating: 5, createdAt: new Date().toISOString() },
    { _id: 'demo4', userName: 'Nimali Silva', comment: 'Negotiated a fair price directly. Highly recommend this marketplace.', rating: 5, createdAt: new Date().toISOString() },
    { _id: 'demo5', userName: 'Prasanna J.', comment: 'Very reliable sellers here. Found a rare engine part for my Prado easily.', rating: 5, createdAt: new Date().toISOString() },
  ];

  return (
    <section id="testimonials" className="py-24 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
            Buyer <span className="text-red-600">Feedback</span>
          </h2>
          <div className="w-12 h-1 bg-red-600 mt-2"></div>
        </div>
        <div className="flex items-center gap-4">
          {stats.total > 0 && (
            <div className="text-right hidden md:block">
              <p className="text-3xl font-black text-white">{stats.avgRating.toFixed(1)}</p>
              <StarRating rating={stats.avgRating} size={14} />
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{stats.total} reviews</p>
            </div>
          )}
          <button
            onClick={() => guardAction('submit platform feedback', () => setShowForm(!showForm))}
            className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <MessageSquare size={14} /> {showForm ? 'Close' : 'Rate Platform'}
          </button>
        </div>
      </div>

      {/* Feedback Form */}
      {showForm && (
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <div className="bg-zinc-950 border border-zinc-800 p-6 md:p-8 max-w-xl">
            <h3 className="text-sm font-black uppercase mb-4">Rate SpareHub</h3>
            {error && <p className="text-[10px] text-red-400 font-bold bg-red-900/20 border border-red-900/40 px-3 py-2 mb-3">{error}</p>}
            {success && <p className="text-[10px] text-green-400 font-bold bg-green-900/20 border border-green-900/40 px-3 py-2 mb-3">{success}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-2">Your Rating</p>
                <StarRating rating={rating} size={24} interactive onRate={setRating} />
              </div>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-black border border-zinc-800 px-4 py-3 text-xs text-white outline-none focus:border-red-600"
              >
                <option value="platform">Platform Experience</option>
                <option value="buying">Buying Experience</option>
                <option value="selling">Selling Experience</option>
                <option value="support">Customer Support</option>
              </select>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience with SpareHub..."
                rows={3}
                maxLength={500}
                className="w-full bg-black border border-zinc-800 p-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-600 resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-zinc-600">{comment.length}/500</span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scrolling Testimonials */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 size={24} className="text-zinc-600 mx-auto mb-3 animate-spin" />
          <p className="text-zinc-500 text-xs uppercase font-bold">Loading reviews...</p>
        </div>
      ) : (
        <div className="relative flex">
          <div className="flex animate-scroll whitespace-nowrap">
            {[...displayFeedbacks, ...displayFeedbacks].map((fb, index) => (
              <div
                key={`${fb._id}-${index}`}
                className="inline-block w-[350px] mx-4 p-8 bg-zinc-900 border border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < fb.rating ? 'text-red-600' : 'text-zinc-700'}`}>★</span>
                  ))}
                </div>
                <p className="text-zinc-300 text-sm italic whitespace-normal mb-6 leading-relaxed">
                  "{fb.comment}"
                </p>
                <div className="flex items-center justify-between border-t border-zinc-700 pt-4">
                  <div className="flex items-center gap-3">
                    {fb.user?.avatar || fb.userAvatar ? (
                      <img src={fb.user?.avatar || fb.userAvatar} alt="" className="w-10 h-10 object-cover border border-zinc-700" />
                    ) : (
                      <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                        <span className="text-xs font-black text-zinc-500">{(fb.userName || 'U').charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-white font-bold text-sm uppercase tracking-tight block">{fb.userName}</span>
                      <span className="text-[9px] text-zinc-600 uppercase font-bold">{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {(user?.role === 'admin' || user?.id === (fb.user?._id || fb.user)) && (
                    <button onClick={() => handleDelete(fb._id)} className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}} />

      <AuthGuardModal {...AuthGuardModalProps} />
    </section>
  );
}
