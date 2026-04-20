import React from 'react';

export default function SearchBar() {
  return (
    <div className="w-full px-4 md:px-10 mb-16 relative z-20">
      <div className="w-full flex items-center my-10 select-none">
        <div className="flex-1 h-[1px] bg-zinc-200"></div>
        <p className="px-8 text-black font-black uppercase tracking-[0.3em] text-xs md:text-sm whitespace-nowrap">
          Precision <span className="text-red-600">Search</span>
        </p>
        <div className="flex-1 h-[1px] bg-zinc-200"></div>
      </div>

      <div className="bg-zinc-950 p-2 shadow-2xl w-full border border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">

          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 text-[10px] font-black tracking-tighter transition-all group-focus-within:text-white">01 </span>
            <input 
              className="w-full pl-16 pr-4 py-4 bg-zinc-900 text-white text-sm placeholder-zinc-600 outline-none border border-transparent focus:border-red-600 transition-all uppercase font-bold tracking-tight" 
              placeholder="Required Part" 
            />
          </div>

          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 text-[10px] font-black tracking-tighter transition-all group-focus-within:text-white">02 </span>
            <input 
              className="w-full pl-16 pr-4 py-4 bg-zinc-900 text-white text-sm placeholder-zinc-600 outline-none border border-transparent focus:border-red-600 transition-all uppercase font-bold tracking-tight" 
              placeholder="Model" 
            />
          </div>

          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 text-[10px] font-black tracking-tighter transition-all group-focus-within:text-white">03 </span>
            <input 
              className="w-full pl-16 pr-4 py-4 bg-zinc-900 text-white text-sm placeholder-zinc-600 outline-none border border-transparent focus:border-red-600 transition-all uppercase font-bold tracking-tight" 
              placeholder="Year" 
            />
          </div>

          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 text-[10px] font-black tracking-tighter transition-all group-focus-within:text-white">04 </span>
            <input 
              className="w-full pl-16 pr-4 py-4 bg-zinc-900 text-white text-sm placeholder-zinc-600 outline-none border border-transparent focus:border-red-600 transition-all uppercase font-bold tracking-tight" 
              placeholder="Engine" 
            />
          </div>

          <button className="bg-red-600 hover:bg-white text-white hover:text-black font-black uppercase text-xs tracking-widest transition-all duration-300 py-4 shadow-lg active:scale-95">
            Find Auto Parts
          </button>

        </div>
      </div>
    </div>
  );
}