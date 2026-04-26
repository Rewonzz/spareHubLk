import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">

          <div>
            <h2 className="text-3xl font-black tracking-tighter mb-6">
              SPARE<span className="text-red-600">HUB</span>
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Sri Lanka's premier marketplace for genuine automotive parts. Connecting buyers and sellers directly for a seamless experience.
            </p>
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
              Sri Lanka's Premium Auto Marketplace
            </div>
          </div>

          <div>
            <h3 className="text-red-600 font-bold uppercase tracking-widest text-xs mb-8">Quick Links</h3>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Browse Parts</Link></li>
              <li><Link to="/sellers" className="hover:text-white transition-colors">Verified Sellers</Link></li>
              <li><Link to="/ai-tools" className="hover:text-white transition-colors">AI Tools</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-red-600 font-bold uppercase tracking-widest text-xs mb-8">Community</h3>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li>
                <button onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors text-left">
                  Rate SpareHub
                </button>
              </li>
              <li>
                <button onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors text-left">
                  Buyer Feedback
                </button>
              </li>
              <li><Link to="/apply-pro" className="hover:text-white transition-colors">Become a PRO Seller</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-zinc-900 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
            © 2026 SpareHub LK // All Rights Reserved
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            Back to Top
            <div className="w-8 h-[1px] bg-zinc-800 group-hover:bg-red-600 transition-colors"></div>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
