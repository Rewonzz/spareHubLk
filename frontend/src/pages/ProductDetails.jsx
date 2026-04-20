import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ProductDetails() {
  const { id } = useParams();

  const product = {
    id: id,
    title: "Brembo High-Performance Brake Pads",
    price: "12,500",
    img: "/brakes.jpg",
    location: "Colombo, Sri Lanka",
    condition: "Factory Grade",
    warranty: "6 Months",
    description: "Original Brembo ceramic brake pads providing superior stopping power and low dust. Compatible with most European performance sedans.",
    seller: "Elite Auto Parts",
    phone: "94771234567",
    isVerified: true
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 relative group">
            <div className="absolute inset-0 border-2 border-zinc-800 pointer-events-none z-10 m-4"></div>
            <div className="bg-zinc-900 aspect-[16/10] overflow-hidden">
              <img 
                src={product.img} 
                alt={product.title} 
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <span className="absolute bottom-8 left-8 text-[10px] font-mono text-zinc-600 tracking-[0.5em] uppercase">
              Ref ID: {id}ST-26
            </span>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1 tracking-widest uppercase italic">
                {product.condition}
              </span>
              {product.isVerified && (
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 p-0.5 rounded-full">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
                    Verified Dealer
                  </span>
                </div>
              )}
            </div>
            
            <h1 className="text-6xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
              {product.title}
            </h1>

            <div className="flex flex-col mb-10 border-y border-zinc-800 py-8">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Transaction Value</span>
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold text-zinc-600 uppercase">LKR</span>
                <span className="text-7xl font-black tracking-tighter text-white">{product.price}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-zinc-800 border border-zinc-800 mb-10">
              <div className="bg-[#0a0a0a] p-6">
                <span className="block text-[10px] font-black text-red-600 uppercase mb-2 italic">Origin</span>
                <span className="font-bold text-sm tracking-tight uppercase">{product.location}</span>
              </div>
              <div className="bg-[#0a0a0a] p-6">
                <span className="block text-[10px] font-black text-red-600 uppercase mb-2 italic">Warranty</span>
                <span className="font-bold text-sm tracking-tight uppercase">{product.warranty}</span>
              </div>
            </div>

            <div className="bg-zinc-900/30 p-8 border-l-2 border-zinc-800 mb-10">
              <Link to={`/shop/${product.seller}`} className="group block mb-6">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Authorized Provider</p>
                <h4 className="text-2xl font-black uppercase tracking-tighter group-hover:text-red-600 transition-colors flex items-center gap-3">
                  {product.seller}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </h4>
              </Link>

              <div className="space-y-3">
                <a 
                  href={`tel:${product.phone}`}
                  className="block w-full bg-white text-black text-center py-5 font-black uppercase tracking-[0.3em] text-xs hover:bg-red-600 hover:text-white transition-all duration-500"
                >
                  Direct Call
                </a>

                <a 
                  href={`https://wa.me/${product.phone}?text=I'm interested in the ${product.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full border border-zinc-700 py-5 font-black uppercase tracking-[0.3em] text-xs hover:bg-green-600 hover:border-green-600 transition-all duration-300"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Inquiry
                </a>
              </div>
            </div>

            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest text-center italic">
              Safety Verification Required Before Offline Payment.
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}