import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, BrainCircuit, Target, Zap, Activity, Globe, Shield, Cpu, Award, CheckCircle, ArrowRight, Gauge, Wrench, Star } from 'lucide-react';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthGuardModal from './AuthGuardModal';

export default function Hero() {
  const navigate = useNavigate();
  const { guardAction, AuthGuardModalProps } = useAuthGuard();

  const aiFeatures = [
    { title: "VIN Decoder", desc: "Instant part verification.", icon: <ScanFace size={20} />, tag: "AI POWERED" },
    { title: "Price Analysis", desc: "Real-time market pricing.", icon: <BrainCircuit size={20} />, tag: "DATA DRIVEN" },
    { title: "Precision Fitment", desc: "Exact chassis matching.", icon: <Target size={20} />, tag: "ACCURATE" },
    { title: "Quick Listing", desc: "Post your ad in under 60s.", icon: <Zap size={20} />, tag: "FAST" }
  ];

  return (
    <div className="relative min-h-[900px] w-full overflow-hidden bg-black text-white">
      
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
        
        {/* --- TACTICAL TOP HUD --- */}
        <div className="mt-8 flex items-center justify-between border-y border-white/5 py-3 backdrop-blur-md bg-white/5 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">System: Online</span>
            </div>
            <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-6">
              <Globe size={12} className="text-red-600" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Node: Colombo_HQ</span>
            </div>
          </div>
          
          {/* Scrolling Ticker */}
          <div className="flex-1 max-w-md mx-10 overflow-hidden hidden lg:block border-x border-white/5 px-4">
            <div className="whitespace-nowrap animate-ticker text-[8px] font-bold uppercase tracking-[0.3em] text-red-600/60">
              NEW TURBOCHARGER LISTED IN KANDY • MARKET VOLATILITY: LOW • AI ENGINE V3.0 ACTIVATED • SECURE TRADING PROTOCOLS ENABLED • 
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Shield size={12} className="text-zinc-600" />
            <Cpu size={12} className="text-zinc-600" />
            <Activity size={12} className="text-red-600 animate-pulse" />
          </div>
        </div>

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
            <span className="text-red-600 italic">Know Its Value.</span>
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

        {/* --- SILVIA SHOWCASE BANNER --- */}
        <div className="relative py-6 pb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="flex-1 border-t border-dashed border-white/10"></div>
            <div className="flex-1 border-t border-dashed border-white/10"></div>
          </div>
          
          <div className="relative flex items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-zinc-600">
              <Wrench size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Builds</span>
            </div>
            
            <div className="relative group">
              <div className="relative w-[300px] md:w-[450px] h-[140px] md:h-[180px] overflow-hidden border border-zinc-800 bg-zinc-950/80">
                <img 
                  src="/silvia1.png" 
                  alt="Silvia Build"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 filter grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge size={12} className="text-red-600" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-red-600">Featured Build</span>
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-white">Nissan Silvia S15</h4>
                  <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">SR20DET • RB25DET Swap Ready</p>
                </div>
                
                <div className="absolute top-3 right-3 flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} size={10} className="text-yellow-600 fill-yellow-600" />
                  ))}
                </div>
              </div>
              
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 flex items-center justify-center border-2 border-black">
                <span className="text-[8px] font-black text-white">01</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-zinc-600">
              <span className="text-[10px] font-black uppercase tracking-widest">Parts</span>
              <Wrench size={14} />
            </div>
          </div>
        </div>

{/* --- AI FEATURE CARDS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
          {aiFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-zinc-950/80 border border-zinc-900 p-6 hover:border-red-600 transition-all duration-500 backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10 group-hover:border-red-600 transition-colors"></div>
              <div className="flex justify-between items-start mb-6">
                <div className="text-red-600 p-2 bg-red-600/10 border border-red-600/20 group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <span className="text-[8px] font-black text-zinc-700 group-hover:text-red-600 tracking-widest uppercase italic">{feature.tag}</span>
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-2 group-hover:text-red-600 transition-colors">{feature.title}</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed tracking-tight">{feature.desc}</p>
            </div>
          ))}
</div>

{/* --- VERIFIED SHOP SECTION --- */}
        <div className="pb-12">
          <div className="relative bg-gradient-to-r from-zinc-900/90 to-zinc-950/90 border border-blue-500/30 p-8 overflow-hidden">
            {/* Blue accent glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 flex items-center justify-center bg-blue-500/10 border-2 border-blue-500">
                  <Award size={40} className="text-blue-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} className="text-blue-500" />
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Verified Partner</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight"><span className="text-red-600">SPAREHUB</span><span className="text-white">LK</span> <span className="text-blue-500">PRO</span></h3>
                  <p className="text-sm text-zinc-400 mt-1 max-w-md">
                    Exclusive wholesale pricing for verified manufacturers and bulk sellers. 
                    Get direct access to OEM parts at factory rates.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <span>✓</span>
                  <span>Authentic Parts</span>
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  <span>Wholesale Rates</span>
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  <span>Priority Support</span>
                </div>
                <button 
                  onClick={() => navigate('/apply-pro')}
                  className="group px-10 py-4 bg-blue-600 hover:bg-blue-500 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                >
                  <span className="flex items-center gap-2 font-black uppercase text-sm tracking-widest text-white">
                    Apply for PRO
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthGuardModal {...AuthGuardModalProps} />

      {/* Global Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        @keyframes slideRight {
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-ticker { animation: ticker 30s linear infinite; }
        .animate-kenburns { animation: kenburns 20s ease-in-out infinite; }
        .animate-slideRight { animation: slideRight 1s ease-out forwards; }
      `}} />
    </div>
  );
}