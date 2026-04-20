import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, BrainCircuit, Target, Zap, Activity, Globe, Shield, Cpu } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();

  const aiFeatures = [
    { title: "Neural VIN Scan", desc: "Instant part ID via visual uplink.", icon: <ScanFace size={20} />, tag: "CORE_AI" },
    { title: "Market Telemetry", desc: "Real-time value analysis.", icon: <BrainCircuit size={20} />, tag: "DATA_NODE" },
    { title: "Precision Fitment", desc: "Zero-error chassis matching.", icon: <Target size={20} />, tag: "LOGIC_V8" },
    { title: "Rapid Injection", desc: "Auto-deployment in < 60s.", icon: <Zap size={20} />, tag: "TURBO_GEN" }
  ];

  return (
    <div className="relative min-h-[1000px] w-full overflow-hidden bg-black text-white">
      
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
        <div className="flex-1 flex flex-col justify-center py-20">
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
              onClick={() => navigate('/register')}
              className="px-12 py-5 border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300 font-black uppercase text-sm tracking-widest"
            >
              Start Selling
            </button>
          </div>
        </div>

        {/* --- AI FEATURE CARDS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-12">
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
      </div>

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