import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Shield, Building, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { searchPremiumSellers } from '../services/api';

const businessTypeLabels = {
    manufacturer: 'Manufacturer (OMD)',
    wholesaler: 'Wholesaler',
    distributor: 'Distributor',
    authorized_seller: 'Authorized Seller',
};

const businessTypeColors = {
    manufacturer: 'bg-blue-500',
    wholesaler: 'bg-purple-500',
    distributor: 'bg-green-500',
    authorized_seller: 'bg-yellow-500',
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
            setSellers(results);
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
                        <Shield className="text-yellow-400" size={40} />
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                            Find Sellers
                        </h1>
                    </div>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Discover verified premium sellers, manufacturers, and authorized dealers
                    </p>
                </div>

                <form onSubmit={handleSearch} className="mb-10">
                    <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or business name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 font-medium"
                            />
                        </div>
                        <div className="relative">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <select
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                className="pl-12 pr-10 py-4 bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-yellow-500 font-medium appearance-none min-w-[200px]"
                            >
                                <option value="">All Business Types</option>
                                <option value="manufacturer">Manufacturer (OMD)</option>
                                <option value="wholesaler">Wholesaler</option>
                                <option value="distributor">Distributor</option>
                                <option value="authorized_seller">Authorized Seller</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="px-8 py-4 bg-yellow-500 text-black font-black uppercase tracking-wider hover:bg-yellow-400 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-zinc-500 mt-4 text-sm uppercase font-bold">Loading sellers...</p>
                    </div>
                ) : initialLoad ? null : sellers.length === 0 ? (
                    <div className="text-center py-20 border border-zinc-900 bg-zinc-950">
                        <Filter size={40} className="text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 text-lg uppercase font-bold">No sellers found</p>
                        <p className="text-zinc-600 text-sm mt-2">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sellers.map((seller) => (
                            <div
                                key={seller._id}
                                onClick={() => handleSellerClick(seller)}
                                className="bg-zinc-950 border border-zinc-900 p-6 hover:border-yellow-500/50 hover:bg-zinc-900/50 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-zinc-800 flex items-center justify-center text-xl font-black text-zinc-400 group-hover:text-yellow-400 transition-colors">
                                        {seller.avatar ? (
                                            <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
                                        ) : (
                                            seller.name?.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-lg truncate">{seller.name}</h3>
                                            <Shield size={14} className="text-yellow-400 flex-shrink-0" />
                                        </div>
                                        {seller.businessName && (
                                            <p className="text-zinc-400 text-sm truncate mb-2">{seller.businessName}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {seller.businessType && (
                                                <span className={`text-[10px] font-black uppercase px-2 py-1 ${businessTypeColors[seller.businessType]} text-white`}>
                                                    {businessTypeLabels[seller.businessType] || seller.businessType}
                                                </span>
                                            )}
                                            {seller.city && (
                                                <span className="text-[10px] font-bold uppercase px-2 py-1 bg-zinc-800 text-zinc-400 flex items-center gap-1">
                                                    <MapPin size={10} /> {seller.city}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between">
                                    <span className="text-xs text-zinc-500 uppercase font-bold">View Shop</span>
                                    <span className="text-yellow-500 text-sm font-black group-hover:translate-x-1 transition-transform">→</span>
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