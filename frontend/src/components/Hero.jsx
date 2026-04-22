import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, BrainCircuit, Target, Zap, ArrowRight, ChevronDown } from 'lucide-react';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthGuardModal from './AuthGuardModal';

export default function Hero() {
  const navigate = useNavigate();
  const { guardAction, AuthGuardModalProps } = useAuthGuard();

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-[90vh] w-full overflow-hidden bg-black text-white flex items-center">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full">
        <img
          src="/hero-bg.jpg"
          className="w-full h-full object-cover opacity-50"
          alt="Automotive Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-20 pb-12">
        <div className="max-w-3xl">
          {/* Tagline */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[2px] w-10 bg-red-600"></div>
            <span className="text-red-500 font-black uppercase tracking-[0.3em] text-[11px]">
              Sri Lanka's #1 Marketplace
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-8 tracking-tighter uppercase">
            Know Your Part <br />
            <span className="text-red-600 italic">Know Its Value.</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed font-medium">
            Experience <span className="text-white font-bold">AI-Driven</span> recommendations and instant VIN recognition. 
            The smartest way for Sri Lankan buyers and sellers to trade with precision.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={() => navigate('/shop')}
              className="group px-12 py-5 bg-red-600 overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
            >
              <span className="relative z-10 font-black uppercase text-sm tracking-widest transition-colors duration-300 group-hover:text-black flex items-center gap-2">
                Browse Inventory <ArrowRight size={14} />
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

          {/* Quick feature pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: <ScanFace size={14} />, label: 'VIN Decoder' },
              { icon: <BrainCircuit size={14} />, label: 'AI Pricing' },
              { icon: <Target size={14} />, label: 'Exact Fitment' },
              { icon: <Zap size={14} />, label: 'Instant Match' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:border-red-600/50 hover:text-red-400 transition-all cursor-default"
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600 hover:text-red-500 transition-colors group"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown size={16} className="animate-bounce" />
      </button>

      <AuthGuardModal {...AuthGuardModalProps} />
    </div>
  );
}
