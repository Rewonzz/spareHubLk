import React from 'react';
import { ShieldCheck, Search, Handshake } from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    { 
      title: "Genuine Listings", 
      desc: "Connect with verified sellers across Sri Lanka offering authentic spare parts.", 
      icon: <Search className="w-8 h-8 text-red-600" /> 
    },
    { 
      title: "Direct Deals", 
      desc: "No middlemen. Negotiate and finalize transactions directly with the seller.", 
      icon: <Handshake className="w-8 h-8 text-red-600" /> 
    },
    { 
      title: "Verified Sellers", 
      desc: "We prioritize trust by highlighting reputable sellers within our community.", 
      icon: <ShieldCheck className="w-8 h-8 text-red-600" /> 
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
      
      {/* LEFT: HEADING */}
      <div className="lg:w-1/2 w-full">
        <div className="inline-block px-4 py-1 border border-red-600 text-red-600 text-[10px] font-black uppercase tracking-[0.5em] mb-6">
          The Advantage
        </div>
        <h2 className="text-7xl md:text-[90px] font-black text-white leading-[0.9] uppercase tracking-tighter mb-8">
          WHY TRUST <br />
          <span className="text-red-600 italic">SPAREHUB.</span>
        </h2>
        <p className="text-zinc-500 text-sm uppercase tracking-[0.2em] max-w-md leading-relaxed">
          Building the most trusted marketplace for Sri Lankan automotive enthusiasts through transparency and direct communication.
        </p>
      </div>

      {/* RIGHT: FEATURE GRID */}
      <div className="lg:w-1/2 w-full grid grid-cols-1 gap-4">
        {features.map((item, index) => (
          <div 
            key={index} 
            className="group bg-zinc-900/50 border border-zinc-900 p-10 hover:border-red-600 hover:bg-zinc-900 transition-all duration-500 flex items-start gap-8"
          >
            <div className="shrink-0 group-hover:scale-110 transition-transform duration-500">
              {item.icon}
            </div>
            <div>
              <div className="text-zinc-700 font-mono text-[10px] mb-2">0{index + 1}</div>
              <h3 className="text-white font-black text-xl mb-3 uppercase tracking-tighter">
                {item.title}
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed max-w-sm font-medium">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseUs;