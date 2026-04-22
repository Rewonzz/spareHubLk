import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import ChatBot from "../components/ChatBot";
import { Cpu, Search, X, Loader2 } from "lucide-react";
import { getProducts } from '../services/api';

export default function Shop() {
  const [conditionFilter, setConditionFilter] = useState("All");
  const [priceRange, setPriceRange] = useState(200000);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [allParts, setAllParts] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // --- SINGLE SOURCE OF TRUTH: URL PARAMS ---
  const urlParams = new URLSearchParams(location.search);
  const activeSearch = urlParams.get("search") || "";
  const activeCategory = urlParams.get("category") || "";
  const activeModel = urlParams.get("model") || "";
  const activeYear = urlParams.get("year") || "";
  const activeEngine = urlParams.get("engine") || "";
  const isPrecisionActive = activeSearch || activeCategory || activeModel || activeYear || activeEngine;

  // --- FETCH PRODUCTS WITH PRECISION PARAMS ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const apiParams = {};
        if (activeSearch) apiParams.search = activeSearch;
        if (activeCategory) apiParams.category = activeCategory;
        if (activeModel) apiParams.model = activeModel;
        if (activeYear) apiParams.year = activeYear;
        if (activeEngine) apiParams.engine = activeEngine;

        const data = await getProducts(apiParams);
        setAllParts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search]);

  // --- CLIENT-SIDE FILTERING (price + condition only) ---
  const filteredResults = allParts.filter(part => {
    const matchesCondition = conditionFilter === "All" || part.condition === conditionFilter;
    const matchesPrice = part.price <= priceRange;
    return matchesCondition && matchesPrice;
  });

  const clearFilters = () => {
    setConditionFilter("All");
    setPriceRange(200000);
    navigate('/shop');
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-zinc-300 font-sans antialiased selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* --- DYNAMIC HEADER --- */}
      <section className="bg-gradient-to-b from-zinc-900 to-[#0a0a0a] pt-32 pb-16 px-6 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-3">
              <div className={`h-[2px] w-12 ${isPrecisionActive ? 'bg-blue-600' : 'bg-red-600'}`}></div>
              <span className={`${isPrecisionActive ? 'text-blue-500' : 'text-red-500'} text-[9px] font-black uppercase tracking-[0.5em] italic`}>
                {isPrecisionActive ? "Precision Search Protocol Active" : "Global Inventory Feed"}
              </span>
            </div>

            <h1 className="text-white text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
              {isPrecisionActive ? (
                <span className="flex flex-wrap items-center gap-x-4">
                  SEARCH<span className="text-blue-600">_</span>RESULTS
                  <span className="text-zinc-800 text-4xl md:text-6xl mx-2">//</span>
                  <span className="text-blue-600 italic">
                    "{activeSearch || activeCategory || activeModel || activeYear || activeEngine}"
                  </span>
                </span>
              ) : activeCategory ? (
                <span>{activeCategory}<span className="text-red-600"></span></span>
              ) : (
                <span>SpareHub<span className="text-red-600">.</span>Market</span>
              )}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center gap-6 pt-4">
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                <Search size={12} className={isPrecisionActive ? "text-blue-500" : "text-red-600"} />
                {isPrecisionActive
                  ? `Found ${filteredResults.length} results`
                  : "Browse quality spare parts"}
              </p>
              {isPrecisionActive && (
                <button onClick={clearFilters} className="text-[9px] font-black uppercase bg-blue-600/10 text-blue-500 border border-blue-600/20 px-3 py-1 hover:bg-blue-600 hover:text-white transition-all w-fit">
                  Clear Search
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-16">
        <aside className="w-full lg:w-80 shrink-0 space-y-12">
          {/* Active Precision Filters Display */}
          {isPrecisionActive && (
            <div className="space-y-2">
              <p className="text-[7px] font-black uppercase text-blue-500 tracking-[0.2em] mb-2">Active_Filters</p>
              {activeSearch && (
                <div className="bg-blue-600/5 border border-blue-600/20 p-3 flex justify-between items-center group">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">Part: {activeSearch}</p>
                  <button onClick={() => { urlParams.delete('search'); navigate(`/shop?${urlParams.toString()}`); }} className="p-1 hover:bg-blue-600 transition-colors">
                    <X size={12} className="text-blue-500 group-hover:text-white" />
                  </button>
                </div>
              )}
              {activeCategory && (
                <div className="bg-blue-600/5 border border-blue-600/20 p-3 flex justify-between items-center group">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">Category: {activeCategory}</p>
                  <button onClick={() => { urlParams.delete('category'); navigate(`/shop?${urlParams.toString()}`); }} className="p-1 hover:bg-blue-600 transition-colors">
                    <X size={12} className="text-blue-500 group-hover:text-white" />
                  </button>
                </div>
              )}
              {activeModel && (
                <div className="bg-blue-600/5 border border-blue-600/20 p-3 flex justify-between items-center group">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">Model: {activeModel}</p>
                  <button onClick={() => { urlParams.delete('model'); navigate(`/shop?${urlParams.toString()}`); }} className="p-1 hover:bg-blue-600 transition-colors">
                    <X size={12} className="text-blue-500 group-hover:text-white" />
                  </button>
                </div>
              )}
              {activeYear && (
                <div className="bg-blue-600/5 border border-blue-600/20 p-3 flex justify-between items-center group">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">Year: {activeYear}</p>
                  <button onClick={() => { urlParams.delete('year'); navigate(`/shop?${urlParams.toString()}`); }} className="p-1 hover:bg-blue-600 transition-colors">
                    <X size={12} className="text-blue-500 group-hover:text-white" />
                  </button>
                </div>
              )}
              {activeEngine && (
                <div className="bg-blue-600/5 border border-blue-600/20 p-3 flex justify-between items-center group">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">Engine: {activeEngine}</p>
                  <button onClick={() => { urlParams.delete('engine'); navigate(`/shop?${urlParams.toString()}`); }} className="p-1 hover:bg-blue-600 transition-colors">
                    <X size={12} className="text-blue-500 group-hover:text-white" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Filters (Price, Condition, etc) - Styles Remain Same */}
          <div className="space-y-10">
            <div className="bg-zinc-900/20 p-4 border-l border-zinc-800">
               <div className="flex justify-between items-end mb-6">
                <h4 className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Price_Threshold</h4>
                <span className="text-xs font-black text-red-600 tracking-tighter">LKR {priceRange.toLocaleString()}</span>
              </div>
              <input type="range" min="5000" max="200000" step="5000" value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))} className="w-full h-1 bg-zinc-900 appearance-none cursor-pointer accent-red-600" />
            </div>

            <div className="grid grid-cols-1 gap-1">
              {["All", "New", "Used"].map((type) => (
                <button key={type} onClick={() => setConditionFilter(type)} className={`text-left px-5 py-4 text-[9px] font-black uppercase tracking-[0.3em] border transition-all ${conditionFilter === type ? "bg-red-600 text-white" : "text-zinc-600 border-zinc-900"}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* --- PRODUCTS GRID --- */}
        <div className="flex-1">
          {loading ? (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-zinc-900">
              <Loader2 size={32} className="text-red-600 animate-spin mb-4" />
              <p className="text-zinc-600 uppercase font-black text-[10px] tracking-widest">Loading Inventory...</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
              {filteredResults.map((item) => {
                  const sellerIsPremium = item.seller?.isPremium === true;
                  return (
                    <ProductCard
                      key={item._id || item.id}
                      id={item._id || item.id}
                      title={item.title}
                      price={item.price}
                      location={item.location}
                      condition={item.condition}
                      category={item.category}
                      subCategory={item.subCategory}
                      vehicleModel={item.vehicleModel}
                      vehicleYear={item.vehicleYear}
                      sellerUsername={item.sellerUsername}
                      images={item.images}
                      isDark={true}
                      isPro={sellerIsPremium}
                      averageRating={item.averageRating}
                      reviewCount={item.reviewCount}
                    />
                  );
                })}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-zinc-900">
              <p className="text-zinc-600 uppercase font-black text-[10px] tracking-widest">No Components Found</p>
              <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-white text-black text-[9px] font-black uppercase">Reset</button>
            </div>
          )}
        </div>
      </div>

      {/* --- AI ASSISTANT --- */}
      <div className="fixed bottom-10 right-10 z-[100]">
        {isChatOpen ? (
          <ChatBot
            variant="floating"
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-zinc-900 text-red-600 border border-zinc-800 p-5 hover:border-red-600 hover:bg-red-600/10 transition-all group"
          >
            <Cpu className="w-6 h-6 animate-pulse group-hover:animate-none" />
          </button>
        )}
      </div>

      <Footer />
    </div>
  );
}