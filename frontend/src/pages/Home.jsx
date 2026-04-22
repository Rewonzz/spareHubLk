import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import Features from "../components/Features";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { getProducts } from '../services/api';
import { ArrowRight, TrendingUp, Users, Package, ShieldCheck, Loader2, Star } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [stats, setStats] = useState({ products: 0, sellers: 0, views: 0 });
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("search") || "");
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProducts();
        const products = Array.isArray(data) ? data : [];
        const top = [...products]
          .filter(p => p.status === 'active')
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 8);
        setFeaturedProducts(top);
        setStats({
          products: products.length,
          sellers: new Set(products.map(p => p.sellerUsername)).size,
          views: products.reduce((acc, p) => acc + (p.views || 0), 0),
        });
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-white overflow-x-hidden">
      <Navbar onSearch={setQuery} />
      
      <Hero />
      <div className="relative z-10 -mt-8 px-6">
        <SearchBar />
      </div>

      {/* Stats Strip */}
      <section className="border-y border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Listings', value: stats.products.toLocaleString(), icon: <Package size={20} strokeWidth={1.5} />, color: 'text-red-600' },
              { label: 'Trusted Sellers', value: stats.sellers.toLocaleString(), icon: <Users size={20} strokeWidth={1.5} />, color: 'text-zinc-900' },
              { label: 'Total Views', value: stats.views.toLocaleString(), icon: <TrendingUp size={20} strokeWidth={1.5} />, color: 'text-zinc-900' },
              { label: 'Verified PRO', value: '100%', icon: <ShieldCheck size={20} strokeWidth={1.5} />, color: 'text-zinc-900' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`${stat.color} mb-2 flex justify-center`}>{stat.icon}</div>
                <p className="text-3xl font-black tracking-tighter text-zinc-900">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[2px] w-8 bg-red-600"></div>
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">Trending Now</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black leading-[0.9]">
              Featured <span className="text-red-600">Parts</span>
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-red-600 transition-colors group"
          >
            View All
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="h-[300px] flex flex-col items-center justify-center border border-dashed border-zinc-200">
            <Loader2 size={32} className="text-red-600 animate-spin mb-4" />
            <p className="text-zinc-400 uppercase font-black text-[10px] tracking-widest">Loading Inventory...</p>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((item) => (
              <ProductCard
                key={item._id}
                id={item._id}
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
                isDark={false}
                isPro={item.seller?.isPremium}
                averageRating={item.averageRating}
                reviewCount={item.reviewCount}
              />
            ))}
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center border border-dashed border-zinc-200">
            <p className="text-zinc-400 uppercase font-black text-[10px] tracking-widest">No products listed yet</p>
            <button
              onClick={() => navigate('/post-ad')}
              className="mt-4 px-6 py-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all"
            >
              Be the First to List
            </button>
          </div>
        )}
      </section>

      <Features />

      <section className="w-full bg-zinc-950">
        <WhyChooseUs />
      </section>

      <Testimonials />

      {/* CTA Banner */}
      <section className="bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 text-black">
            Ready to Find Your <span className="text-red-600">Part?</span>
          </h2>
          <p className="text-zinc-500 text-sm max-w-lg mx-auto mb-10 leading-relaxed">
            Join thousands of Sri Lankan automotive enthusiasts. Browse verified listings, 
            compare prices, and connect directly with sellers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/shop')}
              className="px-10 py-4 bg-red-600 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all duration-300"
            >
              Start Browsing
            </button>
            <button
              onClick={() => navigate('/ai-tools')}
              className="px-10 py-4 border border-zinc-200 text-zinc-600 font-black uppercase text-xs tracking-[0.2em] hover:border-red-600 hover:text-red-600 transition-all duration-300"
            >
              Try AI Tools
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
