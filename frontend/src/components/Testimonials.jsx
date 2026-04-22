import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const reviews = [
    { name: "Kasun Perera", text: "Found a genuine Axio headlight within minutes. Great seller communication.", stars: 5, pfp: "https://i.pravatar.cc/150?u=1" },
    { name: "Dilshan R.", text: "The direct deal was smooth. Seller was very transparent about the part condition.", stars: 4, pfp: "https://i.pravatar.cc/150?u=2" },
    { name: "Sandun M.", text: "Best platform in SL for spare parts. Saved me a lot of time traveling to shops.", stars: 5, pfp: "https://i.pravatar.cc/150?u=3" },
    { name: "Nimali Silva", text: "Negotiated a fair price directly. Highly recommend this marketplace.", stars: 5, pfp: "https://i.pravatar.cc/150?u=4" },
    { name: "Prasanna J.", text: "Very reliable sellers here. Found a rare engine part for my Prado easily.", stars: 5, pfp: "https://i.pravatar.cc/150?u=5" },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] w-8 bg-red-600"></div>
              <span className="text-red-600 text-[9px] font-black uppercase tracking-[0.4em]">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter">
              Buyer <span className="text-red-600">Feedback</span>
            </h2>
          </div>
          <div className="hidden md:block text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            Verified Reviews // 2026
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex animate-scroll hover:animate-scroll-paused">
          {[...reviews, ...reviews].map((rev, index) => (
            <div
              key={index}
              className="inline-block w-[350px] mx-3 p-8 bg-zinc-50 border border-zinc-100 hover:shadow-lg transition-shadow duration-300 flex-shrink-0"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < rev.stars ? 'text-red-600 fill-red-600' : 'text-zinc-300'}
                  />
                ))}
              </div>
              <p className="text-zinc-700 text-sm italic whitespace-normal mb-6 leading-relaxed">
                "{rev.text}"
              </p>
              <div className="flex items-center gap-4 border-t border-zinc-200 pt-4">
                <img
                  src={rev.pfp}
                  alt={rev.name}
                  className="w-10 h-10 object-cover border-2 border-red-600"
                />
                <div>
                  <span className="text-black font-bold text-sm uppercase tracking-tight">
                    {rev.name}
                  </span>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
