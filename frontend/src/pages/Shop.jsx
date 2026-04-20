import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { Cpu, Camera, Send, X, Fingerprint, Search, ArrowRight } from "lucide-react";

export default function Shop() {
  // --- STATE MANAGEMENT ---
  const [query, setQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [priceRange, setPriceRange] = useState(200000);
  const [isChatOpen, setIsChatOpen] = useState(false); // FIXED: Defined state
  const [categoryFilter, setCategoryFilter] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();

  // --- URL SYNC LOGIC ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("search") || "");
    setCategoryFilter(params.get("category") || "");
  }, [location.search]);


  const urlParams = new URLSearchParams(location.search);
  const activeSearch = query || urlParams.get("search") || "";
  const activeCategory = categoryFilter || urlParams.get("category") || "";

 
  const allParts = [
    { id: "1", title: "Brembo Brake Pads", category: "Braking Systems", price: 12500, img: "/brakes.jpg", location: "Colombo", verified: true, condition: "New" },
    { id: "2", title: "LED Headlights", category: "Electronics", price: 8000, img: "/led.jpg", location: "Kandy", verified: false, condition: "Used" },
    { id: "3", title: "Turbo Charger", category: "Engine & Drivetrain", price: 145000, img: "/turbo.jpg", location: "Galle", verified: true, condition: "New" },
    { id: "4", title: "Alloy Wheels", category: "Wheels", price: 95000, img: "/wheels.jpg", location: "Colombo", verified: true, condition: "Used" },
    { id: "5", title: "LED Headlights", category: "Lighting", price: 12000, img: "/led-lighting.jpg", location: "Colombo", verified: true, condition: "New" },
    { id: "6", title: "Intercooler", category: "Performance", price: 45000, img: "/intercooler.jpg", location: "Kandy", verified: false, condition: "New" },
  ];

  const filteredResults = allParts.filter(part => {
    const matchesCategory = activeCategory === "" || 
      part.category?.toLowerCase().includes(activeCategory.toLowerCase()) ||
      part.title.toLowerCase().includes(activeCategory.toLowerCase());

    const matchesSearch = activeSearch === "" || part.title.toLowerCase().includes(activeSearch.toLowerCase());
    const matchesCondition = conditionFilter === "All" || part.condition === conditionFilter;
    const matchesPrice = part.price <= priceRange;

    return matchesCategory && matchesSearch && matchesCondition && matchesPrice;
  });

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter("");
    navigate('/shop');
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-zinc-300 font-sans antialiased selection:bg-red-600 selection:text-white">
      <Navbar onSearch={setQuery} />
      
      {/* --- DYNAMIC HEADER --- */}
      <section className="bg-gradient-to-b from-zinc-900 to-[#0a0a0a] pt-32 pb-16 px-6 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-3">
              <div className={`h-[2px] w-12 ${activeSearch ? 'bg-blue-600' : 'bg-red-600'}`}></div>
              <span className={`${activeSearch ? 'text-blue-500' : 'text-red-500'} text-[9px] font-black uppercase tracking-[0.5em] italic`}>
                {activeSearch ? "Precision Search Protocol Active" : "Global Inventory Feed"}
              </span>
            </div>

            <h1 className="text-white text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
              {activeSearch ? (
                <span className="flex flex-wrap items-center gap-x-4">
                  SEARCH<span className="text-blue-600">_</span>RESULTS
                  <span className="text-zinc-800 text-4xl md:text-6xl mx-2">//</span>
                  <span className="text-blue-600 italic">"{activeSearch}"</span>
                </span>
              ) : activeCategory ? (
                <span>{activeCategory}<span className="text-red-600"></span></span>
              ) : (
                <span>CORE<span className="text-red-600">.</span>SHOP</span>
              )}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center gap-6 pt-4">
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                <Search size={12} className={activeSearch ? "text-blue-500" : "text-red-600"} />
                {activeSearch 
                  ? `SYSTEM_FOUND: ${filteredResults.length} MATCHING_NODES` 
                  : "PREMIUM AUTOMOTIVE COMPONENT INJECTION SYSTEM"}
              </p>
              {activeSearch && (
                <button onClick={clearFilters} className="text-[9px] font-black uppercase bg-blue-600/10 text-blue-500 border border-blue-600/20 px-3 py-1 hover:bg-blue-600 hover:text-white transition-all w-fit">
                  Terminate_Search [X]
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-16">
        <aside className="w-full lg:w-80 shrink-0 space-y-12">
          {/* Active Category Display */}
          {activeCategory && (
            <div className="bg-red-600/5 border border-red-600/20 p-5 rounded-sm flex justify-between items-center group">
              <div>
                <p className="text-[7px] font-black uppercase text-red-500 tracking-[0.2em] mb-1">Active_Filter</p>
                <p className="text-xs font-bold text-white uppercase tracking-wider">{activeCategory}</p>
              </div>
              <button onClick={() => navigate('/shop')} className="p-2 hover:bg-red-600 transition-colors">
                <X size={14} className="text-red-500 group-hover:text-white" />
              </button>
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
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
              {filteredResults.map((item) => (
                <ProductCard key={item.id} {...item} isDark={true} />
              ))}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-zinc-900">
              <p className="text-zinc-600 uppercase font-black text-[10px] tracking-widest">No Components Found</p>
              <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-white text-black text-[9px] font-black uppercase">Reset</button>
            </div>
          )}
        </div>
      </div>

      {/* --- NEURAL CHAT FIX --- */}
      <div className="fixed bottom-10 right-10 z-[100]">
        {isChatOpen ? (
          <div className="bg-[#0b0b0b] w-80 h-[450px] shadow-2xl border border-zinc-800 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-zinc-900 p-4 flex justify-between items-center border-b border-zinc-800">
              <span className="text-white text-[10px] font-black uppercase">Nexus_Core v2.4</span>
              <X className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-white" onClick={() => setIsChatOpen(false)} />
            </div>
            <div className="flex-1 p-4 text-[11px] text-zinc-400">Awaiting input...</div>
            <div className="p-4 bg-black border-t border-zinc-900 flex gap-2">
              <input type="text" placeholder="PROMPT..." className="flex-1 bg-transparent text-[10px] font-bold uppercase outline-none" />
              <button className="bg-red-600 p-2"><Send size={14} /></button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsChatOpen(true)} className="bg-zinc-900 text-red-600 border border-zinc-800 p-5 hover:border-red-600 transition-all">
            <Cpu className="w-6 h-6 animate-pulse" />
          </button>
        )}
      </div>

      <Footer />
    </div>
  );
}