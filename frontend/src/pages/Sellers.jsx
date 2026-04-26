import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Shield, Building, Filter, Store } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { searchPremiumSellers } from '../services/api';

const businessTypeLabels = {
    manufacturer: 'Manufacturer',
    wholesaler: 'Wholesaler',
    distributor: 'Distributor',
    authorized_seller: 'Authorized Seller',
};

const businessTypeColors = {
    manufacturer: 'bg-blue-600',
    wholesaler: 'bg-purple-600',
    distributor: 'bg-green-600',
    authorized_seller: 'bg-yellow-600',
};

export default function Sellers() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        loadSellers();
    }, []);

    const loadSellers = async (query = '', type = '') => {
        setLoading(true);
        try {
            const results = await searchPremiumSellers(query, type);
            setSellers(Array.isArray(results) ? results : []);
        } catch (err) {
            console.error('Failed to load sellers:', err);
            setSellers([]);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadSellers(searchQuery, businessType);
    };

    const handleSellerClick = (seller) => {
        navigate(`/seller/${seller._id}`);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Store className="text-red-600" size={40} />
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                            Sellers
                        </h1>
                    </div>
                    <p className="text-zinc-400 text-base max-w-2xl mx-auto">
                        Discover verified PRO sellers, manufacturers, and authorized dealers across Sri Lanka
                    </p>
                </div>

                <form onSubmit={handleSearch} className="mb-10">
                    <div className="flex flex-col md:flex-row gap-3 max-w-4xl mx-auto">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or business name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-zinc-950 border border-zinc-800 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                            <select
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                className="pl-11 pr-10 py-4 bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-red-600 appearance-none min-w-[200px] cursor-pointer"
                            >
                                <option value="">All Business Types</option>
                                <option value="manufacturer">Manufacturer</option>
                                <option value="wholesaler">Wholesaler</option>
                                <option value="distributor">Distributor</option>
                                <option value="authorized_seller">Authorized Seller</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-widest transition-all"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-zinc-500 mt-4 text-sm uppercase font-bold tracking-widest">Loading sellers...</p>
                    </div>
                ) : initialLoad ? null : sellers.length === 0 ? (
                    <div className="text-center py-20 border border-zinc-900 bg-zinc-950">
                        <Filter size={40} className="text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 text-lg uppercase font-bold tracking-tight">No sellers found</p>
                        <p className="text-zinc-600 text-sm mt-2">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sellers.map((seller) => (
                            <div
                                key={seller._id}
                                onClick={() => handleSellerClick(seller)}
                                className="bg-zinc-900 border border-zinc-800 hover:border-red-600 transition-all cursor-pointer group"
                            >
                                {/* Banner Image */}
                                <div className="relative h-32 overflow-hidden">
                                    {seller.bannerImage ? (
                                        <img 
                                            src={seller.bannerImage} 
                                            alt="" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                                    
                                    {/* PRO Badge */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1">
                                        <Shield size={10} /> PRO
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0 -mt-10 relative z-10">
                                            {seller.shopAvatar || seller.avatar ? (
                                                <img 
                                                    src={seller.shopAvatar || seller.avatar} 
                                                    alt={seller.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-500 text-lg font-black">
                                                    {seller.name?.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-lg truncate text-white group-hover:text-red-500 transition-colors">
                                                {seller.businessName || seller.name}
                                            </h3>
                                            {seller.businessName && seller.name !== seller.businessName && (
                                                <p className="text-zinc-500 text-xs truncate">{seller.name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {seller.businessType && (
                                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 ${businessTypeColors[seller.businessType]} text-white`}>
                                                {businessTypeLabels[seller.businessType] || seller.businessType}
                                            </span>
                                        )}
                                        {seller.city && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-zinc-800 text-zinc-400 flex items-center gap-1">
                                                <MapPin size={9} /> {seller.city}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">View Shop</span>
                                        <span className="text-red-600 text-sm font-black group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
