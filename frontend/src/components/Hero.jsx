import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, BrainCircuit, Target, Zap, Award, ArrowRight, Clock, CheckCircle, Store, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthGuardModal from './AuthGuardModal';

export default function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { guardAction, AuthGuardModalProps } = useAuthGuard();

  const isApprovedPro = user?.isPremium && user?.premiumStatus === 'approved';
  const isPending = user?.premiumStatus === 'pending';
  const isRejected = user?.premiumStatus === 'rejected';

  const aiFeatures = [
    { title: "VIN Decoder", desc: "Instant part verification.", icon: <ScanFace size={20} />, tag: "AI POWERED" },
    { title: "Price Analysis", desc: "Real-time market pricing.", icon: <BrainCircuit size={20} />, tag: "DATA DRIVEN" },
    { title: "Precision Fitment", desc: "Exact chassis matching.", icon: <Target size={20} />, tag: "ACCURATE" },
    { title: "Quick Listing", desc: "Post your ad in under 60s.", icon: <Zap size={20} />, tag: "FAST" }
  ];

  return (
    <div className="relative min-h-[80vh] w-full overflow-hidden bg-black text-white">
      
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full">
        <img 
          src="/hero-bg.jpg" 
          className="w-full h-full object-cover opacity-50 contrast-125 animate-kenburns"
          alt="Automotive Hero"
        />
      </div>
      
      {/* Gradient Overlay - Darker at top and bottom to blend elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/30 to-black z-10"></div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex flex-col">
        
        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col justify-center py-16">
          {/* Top Tagline */}
          <div className="flex items-center gap-3 mb-6 overflow-hidden">
            <div className="w-12 h-[2px] bg-red-600 animate-slideRight"></div>
            <span className="text-red-600 font-black uppercase tracking-[0.4em] text-xs">
              Sri Lanka's #1 Marketplace
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-8 tracking-tighter uppercase">
            Know Your Part <br />
            <span className="text-red-600">Know Its Value.</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl leading-relaxed font-medium">
            Experience <span className="text-white font-bold">AI-Driven</span> recommendations and instant VIN recognition. 
            The smartest way for Sri Lankan buyers and sellers to trade with precision.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/shop')}
              className="relative group px-12 py-5 bg-red-600 overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
            >
              <span className="relative z-10 font-black uppercase text-sm tracking-widest transition-colors duration-300 group-hover:text-black">
                Browse Inventory
              </span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>

            <button
              onClick={() => guardAction('list parts for sale', () => navigate('/post-ad'))}
              className="px-12 py-5 border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300 font-black uppercase text-sm tracking-widest"
            >
              Start Selling
            </button>
          </div>
        </div>

        {/* --- PRO SELLER BANNER --- */}
        <div className="pb-8">
          {isApprovedPro ? (
            /* APPROVED PRO */
            <div className="relative bg-green-950/30 border border-green-800/50 p-6 md:p-8 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-green-600/20 border border-green-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle size={28} className="text-green-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-0.5 border border-green-500/20">PRO Seller</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black uppercase text-white tracking-tight">
                      Welcome back, <span className="text-green-500">{user?.businessName || user?.name}</span>
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Your PRO shop is live. Manage listings, track performance, and reach more buyers.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => navigate('/pro-dashboard')}
                    className="group flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-black uppercase text-xs tracking-widest transition-all"
                  >
                    <Store size={14} />
                    Visit Your Shop
                  </button>
                  <button
                    onClick={() => navigate('/post-ad')}
                    className="flex items-center gap-2 px-6 py-3 border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-white font-black uppercase text-xs tracking-widest transition-all"
                  >
                    <Zap size={14} /> List Product
                  </button>
                </div>
              </div>
            </div>
          ) : isPending ? (
            /* PENDING */
            <div className="relative bg-yellow-950/20 border border-yellow-800/40 p-6 md:p-8 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-yellow-600/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                    <Clock size={28} className="text-yellow-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2 py-0.5 border border-yellow-500/20">Application Submitted</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black uppercase text-white tracking-tight">
                      Waiting for <span className="text-yellow-500">Approval.</span>
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Your PRO application is under admin review. Check back soon for updates.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-6 py-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-widest shrink-0">
                  <Clock size={14} className="animate-pulse" />
                  Under Review
                </div>
              </div>
            </div>
          ) : isRejected ? (
            /* REJECTED */
            <div className="relative bg-red-950/20 border border-red-800/40 p-6 md:p-8 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
                    <AlertTriangle size={28} className="text-red-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 border border-red-500/20">Not Approved</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black uppercase text-white tracking-tight">
                      Re-Apply for <span className="text-red-500">PRO.</span>
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Your previous application was not approved. Update your details and try again.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/apply-pro')}
                  className="group flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-widest transition-all shrink-0"
                >
                  Re-Apply
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            /* DEFAULT: Not applied */
            <div className="relative bg-zinc-900/80 border border-zinc-800 p-6 md:p-8 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Award size={28} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black uppercase text-white tracking-tight">
                      Sell on SpareHub<span className="text-blue-500">.</span>
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      Verified PRO sellers get featured placement, custom shop pages, and bulk listing tools.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => guardAction('apply for PRO seller status', () => navigate('/apply-pro'))}
                  className="group flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest transition-all shrink-0"
                >
                  Apply for PRO
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- AI FEATURES --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12">
          {aiFeatures.map((feature, index) => (
            <div
              key={index}
              className="group bg-zinc-900 border border-zinc-800 p-5 hover:border-red-600 transition-all duration-300"
            >
              <div className="text-red-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-1 text-white">{feature.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <AuthGuardModal {...AuthGuardModalProps} />

      {/* Global Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        @keyframes slideRight {
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-kenburns { animation: kenburns 20s ease-in-out infinite; }
        .animate-slideRight { animation: slideRight 1s ease-out forwards; }
      `}} />
    </div>
  );
}