import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    part: '',
    model: '',
    year: '',
    engine: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
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
    <div className="w-full max-w-5xl mx-auto">
      {/* Section header */}
      <div className="w-full flex items-center my-8 select-none">
        <div className="flex-1 h-[1px] bg-zinc-200"></div>
        <p className="px-8 text-black font-black uppercase tracking-[0.3em] text-xs md:text-sm whitespace-nowrap">
          Precision <span className="text-red-600">Search</span>
        </p>
        <div className="flex-1 h-[1px] bg-zinc-200"></div>
      </div>

      <div className="bg-zinc-950 p-2 shadow-2xl w-full border border-zinc-800">
        <form onSubmit={handleSubmit}>
          {/* Primary row */}
          <div className="flex items-center">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                name="part"
                value={searchData.part}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-zinc-900 text-white text-sm placeholder-zinc-600 outline-none border-none uppercase font-bold tracking-tight"
                placeholder="What part are you looking for?"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-4 text-zinc-500 hover:text-white transition-colors border-l border-zinc-800"
            >
              <SlidersHorizontal size={16} />
            </button>
            <button
              type="submit"
              className="px-8 py-4 bg-red-600 hover:bg-white text-white hover:text-black font-black uppercase text-xs tracking-widest transition-all duration-300"
            >
              Find Auto Parts
            </button>
          </div>

          {/* Expanded filters */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800 transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-40' : 'max-h-0'}`}>
            {[
              { name: 'model', label: 'Model', placeholder: 'e.g. Toyota Axio' },
              { name: 'year', label: 'Year', placeholder: 'e.g. 2015' },
              { name: 'engine', label: 'Engine', placeholder: 'e.g. 1NZ-FE (optional)' },
            ].map((field) => (
              <div key={field.name} className="bg-zinc-950 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 text-[10px] font-black tracking-tighter">
                  {field.label}
                </span>
                <input
                  name={field.name}
                  value={searchData[field.name]}
                  onChange={handleChange}
                  className="w-full pl-16 pr-4 py-4 bg-transparent text-white text-sm placeholder-zinc-700 outline-none border-none uppercase font-bold tracking-tight"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
        </form>
      </div>

      {/* Quick tags */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {['Brake Pads', 'Headlights', 'Turbo', 'Coilovers', 'ECU', 'Alloys'].map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setSearchData({ ...searchData, part: tag });
              navigate(`/shop?search=${encodeURIComponent(tag)}`);
            }}
            className="px-3 py-1.5 bg-zinc-100 border border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
