import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import Features from "../components/Features";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("search") || "");
  }, [location.search]);

  const allParts = [
    { id: "1", title: "Brembo Brake Pads", price: "12,500", img: "/brakes.jpg", location: "Colombo", verified: true, condition: "New" },
    { id: "2", title: "LED Headlights", price: "8,000", img: "/led.jpg", location: "Kandy", verified: false, condition: "Used" },
    { id: "3", title: "Turbo Charger", price: "145,000", img: "/turbo.jpg", location: "Galle", verified: true, condition: "New" },
    { id: "4", title: "Alloy Wheels", price: "95,000", img: "/wheels.jpg", location: "Colombo", verified: true, condition: "Used" },
  ];

  const searchResults = allParts.filter(part => 
    part.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full bg-white overflow-x-hidden">
      <Navbar onSearch={setQuery} />
      
      {!query && (
        <>
          <Hero />
          <div className="relative z-10 -mt-8 px-6">
            <SearchBar onSearch={setQuery} />
          </div>
          <Features />
        </>
      )}

      {/* Main Content Area */}
      <main className="w-full">
        {/* Inventory Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          {query && (
            <div className="mb-16">
              <h2 className="text-[8vw] md:text-[72px] font-black uppercase tracking-tighter leading-none text-black">
                {searchResults.length > 0 ? "MATCHED" : "NO MATCHES"}<span className="text-red-600">.</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mt-4 underline decoration-red-600 underline-offset-8">
                Results for: "{query}"
              </p>
            </div>
          )}

          <div className="mb-12 flex items-baseline justify-between border-b border-zinc-100 pb-8">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black">
              BEST<span className="text-red-600"> SELLERS</span>
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              {query ? 'Search Results' : 'Premium Selection'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(query ? searchResults : allParts).map((item) => (
              <ProductCard key={item.id} {...item} />
            ))}
          </div>
        </section>

        {/* The Advantage - Immersive Breakout Section */}
        {!query && (
          <section className="w-full bg-zinc-950">
             <WhyChooseUs />
          </section>
        )}

        {/* Testimonials */}
        {!query && (
          <section className="max-w-7xl mx-auto px-6 py-20">
            <Testimonials />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}