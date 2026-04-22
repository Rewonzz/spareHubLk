import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Shield, Star } from 'lucide-react';
import StarRating from './StarRating';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return path;
};

const truncateLocation = (location, maxLen = 20) => {
  if (!location) return '';
  if (location.length <= maxLen) return location;
  return location.slice(0, maxLen) + '...';
};

export default function ProductCard({ id, title, price, location, condition, category, subCategory, vehicleModel, vehicleYear, sellerUsername, images, isDark, isPro, averageRating, reviewCount }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasImages = images && images.length > 0;

  const accentClass = isPro ? 'text-blue-600' : 'text-red-600';
  const bgClass = isPro ? 'bg-blue-600' : 'bg-red-600';

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <Link to={`/product/${id}`} className="block group">
      <div className="relative flex flex-col space-y-4">
        
        {/* Image Container */}
        <div className={`relative aspect-[4/5] overflow-hidden rounded-sm border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-[#f9f9f9] border-zinc-100'}`}>
          {hasImages ? (
            <img 
              src={getImageUrl(images[currentImageIndex])} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
              <span className="text-zinc-700 text-4xl font-black uppercase opacity-20">{title.charAt(0)}</span>
            </div>
          )}

          {/* Image Navigation Arrows */}
          {hasImages && images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:${bgClass} p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300`}
              >
                <ChevronLeft size={16} className="text-white" />
              </button>
              <button 
                onClick={nextImage}
                className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:${bgClass} p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300`}
              >
                <ChevronRight size={16} className="text-white" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? `${bgClass} w-3` : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* PRO Badge (Top Left) */}
          {isPro && (
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 shadow-xl">
              <Shield size={10} /> PRO
            </div>
          )}

          {/* Condition Tag (Top Right) */}
          <div className={`absolute top-4 right-4 ${bgClass} text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 italic shadow-xl`}>
            {condition || "New"}
          </div>

          {/* Category Badge (Top Left) */}
          {category && (
            <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1.5 shadow-sm border backdrop-blur-md ${isDark ? 'bg-black/50 border-zinc-700' : 'bg-white/90 border-zinc-200'}`}>
              <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {category}
              </span>
            </div>
          )}

          {/* Image Count Badge */}
          {hasImages && images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[8px] font-bold px-2 py-1 rounded-sm">
              {currentImageIndex + 1}/{images.length}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h4 className={`text-[14px] font-bold uppercase tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-zinc-900'} group-hover:${accentClass}`}>
              {title}
            </h4>
          </div>
          
          {/* Vehicle Model */}
          {vehicleModel && (
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className={accentClass}>🚗</span> {vehicleModel}
              {vehicleYear && ` • ${vehicleYear}`}
            </p>
          )}
          
          {/* Sub Category */}
          {subCategory && (
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
              {subCategory}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <p className={`text-[15px] font-black tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>
                LKR {Number(price).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{truncateLocation(location)}</span>
              {sellerUsername && (
                <span className="text-[8px] text-zinc-600 font-medium">@{sellerUsername}</span>
              )}
            </div>
          </div>

          {/* Rating */}
          {(averageRating > 0 || reviewCount > 0) && (
            <div className="flex items-center gap-2 pt-1">
              <StarRating rating={averageRating} size={12} />
              <span className="text-[10px] text-zinc-500 font-bold">{averageRating.toFixed(1)}</span>
              <span className="text-[9px] text-zinc-600">({reviewCount})</span>
            </div>
          )}
        </div>

        {/* Animated Accent Line */}
        <div className={`h-[1px] w-0 ${accentClass.replace('text-', 'bg-')} transition-all duration-500 group-hover:w-full`}></div>
      </div>
    </Link>
  );
}
