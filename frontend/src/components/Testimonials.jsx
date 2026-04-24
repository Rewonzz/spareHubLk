import React from 'react';

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
      <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-black uppercase tracking-tighter">
            Buyer <span className="text-red-600">Feedback</span>
          </h2>
          <div className="w-12 h-1 bg-red-600 mt-2"></div>
        </div>
        <div className="hidden md:block text-zinc-400 text-xs font-mono uppercase tracking-widest">
          Verified Reviews // 2026
        </div>
      </div>

      <div className="relative flex">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...reviews, ...reviews].map((rev, index) => (
            <div 
              key={index} 
              className="inline-block w-[350px] mx-4 p-8 bg-zinc-50 border border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(rev.stars)].map((_, i) => (
                  <span key={i} className="text-red-600 text-lg">★</span>
                ))}
              </div>
              <p className="text-zinc-700 text-sm italic whitespace-normal mb-6 leading-relaxed">
                "{rev.text}"
              </p>
              <div className="flex items-center gap-4 border-t border-zinc-200 pt-4">
                <img 
                  src={rev.pfp} 
                  alt={rev.name} 
                  className="w-10 h-10 rounded-full border-2 border-red-600 object-cover"
                />
                <span className="text-black font-bold text-sm uppercase tracking-tight">
                  {rev.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}} />
    </section>
  );
};

export default Testimonials;