import { Link } from 'react-router-dom';

export default function ProductCard({ id, img, title, price, location, verified, condition, warranty, isDark }) {
  return (
    <Link to={`/product/${id}`} className="block group">
      <div className="relative flex flex-col space-y-4">
        
        {/* Image Container */}
        <div className={`relative aspect-[4/5] overflow-hidden rounded-sm border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-[#f9f9f9] border-zinc-100'}`}>
          <img 
            src={img} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110" 
          />

          {/* Condition Tag (Top Right) */}
          <div className="absolute top-4 right-4 bg-red-600 text-white text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 italic shadow-xl">
            {condition || "Used"}
          </div>

          {/* Verified Seller Badge (Top Left) */}
          {verified && (
            <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1.5 shadow-sm border backdrop-blur-md ${isDark ? 'bg-black/50 border-zinc-700' : 'bg-white/90 border-zinc-200'}`}>
              <div className="bg-blue-600 rounded-full p-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Verified Seller
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            {/* DYNAMIC TITLE COLOR: Switches between text-white and text-zinc-900 */}
            <h4 className={`text-[14px] font-bold uppercase tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-zinc-900'} group-hover:text-red-600`}>
              {title}
            </h4>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {/* DYNAMIC PRICE COLOR: Switches between text-white and text-black */}
              <p className={`text-[15px] font-black tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>
                LKR {price.toLocaleString()}
              </p>
              
              {/* Warranty Info */}
              {warranty && (
                <span className="text-[9px] text-green-500 font-bold uppercase tracking-tighter">
                  {warranty} Warranty
                </span>
              )}
            </div>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{location}</span>
          </div>
        </div>

        {/* Animated Accent Line */}
        <div className="h-[1px] w-0 bg-red-600 transition-all duration-500 group-hover:w-full"></div>
      </div>
    </Link>
  );
}