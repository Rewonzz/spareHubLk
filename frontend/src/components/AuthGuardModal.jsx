import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, UserPlus, X } from 'lucide-react';

/**
 * AuthGuardModal
 * Shown when a guest user tries to access a protected action.
 *
 * Props:
 *   isOpen     – boolean to control visibility
 *   onClose    – function to close the modal
 *   action     – short string describing what they tried (e.g. "add to wishlist")
 */
export default function AuthGuardModal({ isOpen, onClose, action = 'perform this action' }) {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    // Trigger the profile dropdown in Navbar by dispatching a custom event
    window.dispatchEvent(new CustomEvent('sparehub:open-login'));
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-zinc-950 border border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.25)] relative">

        {/* Top accent bar */}
        <div className="h-[3px] bg-red-600 w-full" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-600 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>

        <div className="p-8">
          {/* Icon + status label */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-red-600/10 border border-red-600/30">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-[7px] font-black text-red-600 uppercase tracking-[0.4em]">
                Access_Denied
              </p>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                Authorization Required
              </p>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-white font-black text-sm uppercase tracking-widest mb-2">
            Login Required
          </h2>

          {/* Message */}
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider leading-relaxed mb-6">
            You must be logged in to{' '}
            <span className="text-white">{action}</span>.
            Register or sign in to access all SpareHubLK features.
          </p>

          {/* Divider */}
          <div className="border-t border-zinc-800 mb-5" />

          {/* CTA buttons */}
          <div className="space-y-2">
            <button
              onClick={handleLogin}
              className="w-full bg-red-600 text-white py-3 text-[9px] font-black uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={12} />
              Sign In
            </button>
            <button
              onClick={handleRegister}
              className="w-full border border-zinc-700 py-3 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:border-red-600 hover:text-red-600 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={12} />
              Register Free
            </button>
          </div>
        </div>

        {/* Bottom HUD label */}
        <div className="px-8 pb-4">
          <p className="text-[7px] text-zinc-700 font-black uppercase tracking-[0.4em]">
            SpareHubLK — Sri Lanka's Largest Marketplace
          </p>
        </div>
      </div>
    </div>
  );
}
