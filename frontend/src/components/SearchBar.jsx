import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    part: '',
    model: '',
    year: '',
    engine: ''
  });

  const handleChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchData.part) params.set('search', searchData.part);
    if (searchData.model) params.set('model', searchData.model);
    if (searchData.year) params.set('year', searchData.year);
    if (searchData.engine) params.set('engine', searchData.engine);

    navigate(`/shop?${params.toString()}`);
  };

  return (
    <div className="w-full px-4 md:px-10 mb-16 relative z-20">
      <div className="w-full flex items-center my-10 select-none">
        <div className="flex-1 h-[1px] bg-zinc-800"></div>
        <p className="px-8 text-white font-black uppercase tracking-[0.3em] text-xs md:text-sm whitespace-nowrap">
          Precision <span className="text-red-600">Search</span>
        </p>
        <div className="flex-1 h-[1px] bg-zinc-800"></div>
      </div>

      <div className="bg-zinc-950 p-3 w-full border border-zinc-800">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">

          <input
            name="part"
            value={searchData.part}
            onChange={handleChange}
            className="w-full px-4 py-4 bg-zinc-900 text-white text-sm placeholder-zinc-500 outline-none border border-zinc-800 focus:border-red-600 transition-all"
            placeholder="Required Part"
          />

          <input
            name="model"
            value={searchData.model}
            onChange={handleChange}
            className="w-full px-4 py-4 bg-zinc-900 text-white text-sm placeholder-zinc-500 outline-none border border-zinc-800 focus:border-red-600 transition-all"
            placeholder="Model"
          />

          <input
            name="year"
            value={searchData.year}
            onChange={handleChange}
            className="w-full px-4 py-4 bg-zinc-900 text-white text-sm placeholder-zinc-500 outline-none border border-zinc-800 focus:border-red-600 transition-all"
            placeholder="Year"
          />

          <input
            name="engine"
            value={searchData.engine}
            onChange={handleChange}
            className="w-full px-4 py-4 bg-zinc-900 text-white text-sm placeholder-zinc-500 outline-none border border-zinc-800 focus:border-red-600 transition-all"
            placeholder="Engine (optional)"
          />

          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-sm tracking-wide transition-all duration-300 py-4">
            Find Auto Parts
          </button>

        </form>
      </div>
    </div>
  );
}