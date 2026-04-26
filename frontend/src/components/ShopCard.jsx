import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Award } from 'lucide-react';

const ShopCard = ({ sellerId, name, avatar, shopAvatar, bannerImage, businessName, businessType, city, isPremium }) => {
  const displayName = businessName || name;
  const avatarSeed = name || 'User';
  const profileSrc = shopAvatar || avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

  const typeLabels = {
    manufacturer: 'Manufacturer',
    wholesaler: 'Wholesaler',
    distributor: 'Distributor',
    authorized_seller: 'Authorized Seller',
  };

  return (
    <Link to={`/seller/${sellerId}`} className="block group">
      <div className="relative bg-zinc-900 border border-zinc-800 hover:border-red-600 transition-all duration-300 overflow-hidden">
        {/* Banner Image */}
        <div className="relative h-32 overflow-hidden">
          {bannerImage ? (
            <img
              src={bannerImage}
              alt={`${displayName} banner`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

          {/* PRO Badge */}
          {isPremium && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1">
              <Award size={10} /> PRO
            </div>
          )}

          {/* Profile Image - overlapping banner */}
          <div className="absolute -bottom-8 left-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 group-hover:border-red-600 transition-colors">
              <img
                src={profileSrc}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pt-10 pb-5 px-4">
          <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1 group-hover:text-red-600 transition-colors">
            {displayName}
          </h3>

          {businessType && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
              {typeLabels[businessType] || businessType}
            </p>
          )}

          <div className="flex items-center gap-1.5 text-zinc-400">
            <MapPin size={12} className="text-red-600" />
            <span className="text-xs font-medium">{city || 'Sri Lanka'}</span>
          </div>

          {/* Bottom accent line */}
          <div className="h-[2px] w-0 bg-red-600 mt-4 transition-all duration-500 group-hover:w-full"></div>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
