import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

export default function ShopProfile() {
  const { sellerName } = useParams();

  const sellerInfo = {
    name: "Elite Auto Parts",
    location: "Colombo 07",
    joined: "January 2024",
    isVerified: true,
    rating: "4.9",
    partsCount: 12
  };

  const sellerParts = [
    { id: "1", title: "Brembo Brake Pads", price: "12,500", img: "/brakes.jpg", location: "Colombo", verified: true, condition: "New" },
    { id: "3", title: "Turbo Charger", price: "145,000", img: "/turbo.jpg", location: "Galle", verified: true, condition: "New" },
    { id: "5", title: "Suspension Kit", price: "85,000", img: "/suspension.jpg", location: "Colombo", verified: true, condition: "Used" },
    { id: "6", title: "Radiator Fan", price: "15,500", img: "/fan.jpg", location: "Colombo", verified: true, condition: "New" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <header className="bg-[#0a0a0a] text-white pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {sellerInfo.isVerified && (
                <span className="bg-blue-600 text-[10px] font-black uppercase px-2 py-1 tracking-widest">
                  Verified Dealer
                </span>
              )}
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                Est. {sellerInfo.joined}
              </span>
            </div>
            <h1 className="text-7xl font-black uppercase tracking-tighter leading-none">
                {sellerName}<span className="text-red-600">.</span>
            </h1>
            <p className="text-zinc-400 mt-4 font-medium uppercase tracking-widest text-xs">
              Official Distributor / {sellerInfo.location}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 border-l border-zinc-800 pl-8">
            <div>
              <p className="text-zinc-500 text-[9px] font-black uppercase mb-1">Inventory</p>
              <p className="text-3xl font-black">{sellerInfo.partsCount}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[9px] font-black uppercase mb-1">Rating</p>
              <p className="text-3xl font-black text-red-600">{sellerInfo.rating}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 mb-12">
          Current Stock Selection
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {sellerParts.map((item) => (
            <ProductCard key={item.id} {...item} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}