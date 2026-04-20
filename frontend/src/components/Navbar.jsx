import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import { Search, Heart, User, LayoutDashboard, X, ChevronDown, Cpu, Disc, Wrench, Radio, Box, Car, UserPlus, Lock, Mail, LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

const navCategories = [
  { name: "Engine & Drivetrain", icon: <Cpu className="w-4 h-4" />, items: ["Turbochargers", "Pistons", "Gearboxes", "Clutch Kits"] },
  { name: "Braking Systems", icon: <Disc className="w-4 h-4" />, items: ["Brembo Pads", "Rotors", "Lines", "Calipers"] },
  { name: "Suspension", icon: <Wrench className="w-4 h-4" />, items: ["Coilovers", "Bushings", "Strut Bars", "Arms"] },
  { name: "Electronics", icon: <Radio className="w-4 h-4" />, items: ["ECUs", "Sensors", "Wiring", "Lighting"] },
  { name: "Exterior/Body", icon: <Box className="w-4 h-4" />, items: ["Spoilers", "Hoods", "Diffusers", "Grilles"] },
  { name: "Performance", icon: <Car className="w-4 h-4" />, items: ["Exhausts", "Intakes", "Intercoolers", "Fuel Rails"] },
];

export default function Navbar({ onSearch }) {
  const { isLoggedIn, user, login, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [localSearch, setLocalSearch] = useState("");
  const [isCatOpen, setIsCatOpen] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync local input with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlQuery = params.get("search") || "";
    setLocalSearch(urlQuery);
  }, [location.search]);

  const handleSearchChange = (val) => {
    setLocalSearch(val);
    if (location.pathname === "/shop" && onSearch) {
      onSearch(val);
      const params = new URLSearchParams(location.search);
      if (val) params.set("search", val); else params.delete("search");
      navigate({ search: params.toString() }, { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(localSearch)}`);
  };

  const clearSearch = () => {
    setLocalSearch("");
    if (onSearch) onSearch("");
    navigate("/shop");
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setLoginError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const data = await loginUser(loginForm);
      login(data.token, data.user);
      setIsProfileOpen(false);
      setLoginForm({ email: '', password: '' });
      navigate('/shop');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  const avatarSeed = user?.username || 'Pilot';

  return (
    <nav className="w-full bg-black text-white sticky top-0 z-50 border-b border-zinc-800">
      <div className="flex justify-between items-center px-6 py-2 bg-zinc-950 border-b border-zinc-900">
        <div className="flex gap-6">
          <a href="#" className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-red-600 transition-colors">About Us</a>
          <a href="#" className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-red-600 transition-colors">FAQ</a>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Sri Lanka's Premium Auto Marketplace</div>
      </div>

      <div className="w-full flex items-center px-6 py-4 gap-10">
        <Link to="/" className="flex items-center gap-1 shrink-0">
          <label className="text-red-600 font-black text-3xl tracking-tighter cursor-pointer">SPARE</label>
          <label className="text-white font-black text-3xl tracking-tighter cursor-pointer">HUBLK</label>
        </Link>

        <div className="hidden xl:flex items-center gap-10 text-xs font-black uppercase tracking-widest">
          {["Home", "Shop", "Categories", "Wheels"].map((item) => (
            item === "Categories" ? (
              <div key={item} className="relative py-2 group cursor-pointer" onMouseEnter={() => setIsCatOpen(true)} onMouseLeave={() => setIsCatOpen(false)}>
                <div className="flex items-center gap-2 group-hover:text-red-600 transition-colors duration-300">
                  <span>{item}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
                </div>
                <div className={`absolute top-full left-0 mt-0 w-[800px] bg-zinc-900 border border-zinc-800 shadow-2xl transition-all duration-300 origin-top z-[100] ${isCatOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                  <div className="grid grid-cols-3 gap-0 divide-x divide-zinc-800">
                    {navCategories.map((cat, idx) => (
                      <div key={idx} className="p-6 hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center gap-2 mb-4 text-red-600">
                          {cat.icon} <span className="text-[10px] font-black uppercase text-white">{cat.name}</span>
                        </div>
                        <ul className="space-y-2">
                          {cat.items.map((subItem, i) => (
                            <li key={i}><Link to={`/shop?category=${subItem.toLowerCase()}`} className="text-[9px] font-bold text-zinc-500 hover:text-red-500 transition-colors block">{subItem}</Link></li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="bg-red-600 p-3 text-center"><Link to="/shop" className="text-[9px] font-black uppercase tracking-[0.3em] text-white hover:underline">View Full Diagnostic Catalog</Link></div>
                </div>
              </div>
            ) : (
              <Link key={item} to={item === "Home" ? "/" : item === "Shop" ? "/shop" : item === "Wheels" ? "/shop?category=wheels" : "#"} className="relative py-2 group overflow-hidden">
                <span className="group-hover:text-red-600 transition-colors duration-300">{item}</span>
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300"></span>
              </Link>
            )
          ))}
        </div>

        <div className="flex-1 max-w-lg ml-auto">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <input
              type="text"
              value={localSearch}
              placeholder="Search parts by name..."
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs uppercase tracking-tight font-bold px-4 py-3 outline-none focus:border-red-600 focus:bg-black transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {localSearch && <X onClick={clearSearch} className="w-4 h-4 text-zinc-500 hover:text-white cursor-pointer transition-colors" />}
              <Search className="w-4 h-4 text-zinc-600 group-focus-within:text-red-600 transition-colors" />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-5 border-r border-zinc-800 pr-6 ml-4">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <LayoutDashboard className="w-5 h-5 group-hover:text-red-600 transition-colors" />
            <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">Console</span>
          </Link>

          <Heart className="w-5 h-5 hover:text-red-600 transition-colors cursor-pointer" />

          {/* PROFILE HUD TRIGGER */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center gap-2 p-1 border transition-all ${isProfileOpen ? 'border-red-600 bg-red-600/5' : 'border-transparent'}`}
            >
              <div className="relative">
                {isLoggedIn ? (
                  <div className="w-8 h-8 border border-red-600 overflow-hidden bg-zinc-800 rounded-sm">
                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`} alt="PFP" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <User className="w-5 h-5 text-zinc-500 hover:text-white transition-colors" />
                )}
                {isLoggedIn && <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black animate-pulse"></span>}
              </div>
              <ChevronDown size={12} className={`text-zinc-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN MENU */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-4 w-80 bg-black border border-zinc-800 shadow-[0_30px_60px_rgba(0,0,0,1)] z-[110]">
                {!isLoggedIn ? (
                  <div className="p-6">
                    <p className="text-[7px] font-black text-red-600 uppercase tracking-[0.4em] mb-1">Authorization_Required</p>
                    <h3 className="text-white text-sm font-black uppercase mb-4">Pilot Identity</h3>

                    {/* INLINE LOGIN FORM */}
                    <form onSubmit={handleLogin} className="space-y-3 mb-3">
                      {loginError && (
                        <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider bg-red-900/20 border border-red-900/40 px-3 py-2">
                          ⚠ {loginError}
                        </p>
                      )}
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
                        <input
                          required
                          name="email"
                          type="email"
                          value={loginForm.email}
                          onChange={handleLoginChange}
                          placeholder="EMAIL"
                          className="w-full bg-zinc-900 border border-zinc-800 pl-8 pr-3 py-3 text-[9px] font-bold uppercase tracking-widest focus:border-red-600 focus:bg-zinc-950 outline-none transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
                        <input
                          required
                          name="password"
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginForm.password}
                          onChange={handleLoginChange}
                          placeholder="PASSWORD"
                          className="w-full bg-zinc-900 border border-zinc-800 pl-8 pr-9 py-3 text-[9px] font-bold uppercase tracking-widest focus:border-red-600 focus:bg-zinc-950 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                        >
                          {showLoginPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full bg-red-600 text-white py-3 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <LogIn size={12} />
                        {loginLoading ? 'Authenticating...' : 'Existing Pilot Login'}
                      </button>
                    </form>

                    {/* REGISTRATION BUTTON */}
                    <button
                      onClick={() => { navigate('/register'); setIsProfileOpen(false); }}
                      className="w-full border border-zinc-800 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:border-red-600 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus size={14} />
                      New Pilot Registration
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-5 border-b border-zinc-900 bg-zinc-900/40">
                      <div className="flex gap-4 items-center mb-4">
                        <div className="w-10 h-10 border border-red-600 p-0.5">
                          <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`} className="w-full h-full" alt="PFP" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase italic">{user?.username}</p>
                          <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">{user?.sector} • {user?.role}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black p-2 border border-zinc-900 text-center">
                          <p className="text-[6px] text-zinc-600 uppercase font-black">Email</p>
                          <p className="text-[8px] text-white font-black truncate">{user?.email}</p>
                        </div>
                        <div className="bg-black p-2 border border-zinc-900 text-center">
                          <p className="text-[6px] text-zinc-600 uppercase font-black">Sector</p>
                          <p className="text-[10px] text-green-500 font-black">{user?.sector}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button onClick={() => { navigate('/dashboard'); setIsProfileOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 text-[9px] font-black uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all group">Garage Hub <Box size={14} className="group-hover:text-red-600" /></button>
                    </div>
                    <button onClick={handleLogout} className="w-full p-4 bg-red-900/10 text-red-600 text-[8px] font-black uppercase tracking-[0.2em] border-t border-zinc-900 hover:bg-red-900/20 transition-all">Log_out</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}