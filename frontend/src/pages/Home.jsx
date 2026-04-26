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
import ShopCard from "../components/ShopCard";
import ProPromoSection from "../components/ProPromoSection";
import RecentReviews from "../components/RecentReviews";
import { getFeaturedSellers, getProducts } from "../services/api";

export default function Home() {
  const [query, setQuery] = useState("");
  const [featuredSellers, setFeaturedSellers] = useState([]);
  const [searchProducts, setSearchProducts] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || "";
    setQuery(q);

    if (q) {
      // Search mode: fetch real products
      setLoadingProducts(true);
      getProducts({ search: q })
        .then(data => setSearchProducts(Array.isArray(data) ? data : []))
        .catch(() => setSearchProducts([]))
        .finally(() => setLoadingProducts(false));
    }
  }, [location.search]);

  useEffect(() => {
    if (!query) {
      setLoadingSellers(true);
      getFeaturedSellers()
        .then(data => setFeaturedSellers(Array.isArray(data) ? data : []))
        .catch(() => setFeaturedSellers([]))
        .finally(() => setLoadingSellers(false));
    }
  }, [query]);

  return (
    <div className="relative min-h-screen w-full bg-black overflow-x-hidden bg-noise">
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
        {/* Inventory / Best Sellers Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          {query && (
            <div className="mb-12">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
                {searchProducts.length > 0 ? "Search Results" : "No Matches"}
              </h2>
              <p className="text-sm text-zinc-400 mt-2">
                Results for "{query}"
              </p>
            </div>
          )}

          {!query && (
            <div className="mb-10 flex items-baseline justify-between border-b border-zinc-800 pb-6">
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter">
                Best <span className="text-red-600">Sellers</span>
              </h2>
              <span className="text-sm text-zinc-500">
                Featured Shops
              </span>
            </div>
          )}

          {query ? (
            // Search results: show products
            <>
              {loadingProducts ? (
                <div className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-zinc-500 text-sm">Searching products...</p>
                </div>
              ) : searchProducts.length === 0 ? (
                <div className="text-center py-12 border border-zinc-900">
                  <p className="text-zinc-500 text-sm">No products found for "{query}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {searchProducts.map((item) => (
                    <ProductCard key={item._id || item.id} {...item} isDark={true} />
                  ))}
                </div>
              )}
            </>
          ) : (
            // Normal view: show featured sellers
            <>
              {loadingSellers ? (
                <div className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-zinc-500 text-sm">Loading featured sellers...</p>
                </div>
              ) : featuredSellers.length === 0 ? (
                <div className="text-center py-12 border border-zinc-900">
                  <p className="text-zinc-500 text-sm">No featured sellers yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredSellers.map((seller) => (
                    <ShopCard key={seller._id} {...seller} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* The Advantage - Immersive Breakout Section */}
        {!query && (
          <section className="w-full bg-zinc-950">
             <WhyChooseUs />
          </section>
        )}

        {/* PRO Seller Promo */}
        {!query && <ProPromoSection />}

        {/* Recently Added Reviews */}
        {!query && <RecentReviews />}

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
