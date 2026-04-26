import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import {
  Search, Heart, User, LayoutDashboard, X, ChevronDown,
  Cpu, Disc, Wrench, Radio, Box, Car, UserPlus, Lock, Mail,
  LogIn, Eye, EyeOff, Camera, Upload, Loader2, Settings, Store, LogOut, Edit3, Save
} from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { loginUser, uploadAvatar, updateProfile } from '../services/api';
import AuthGuardModal from './AuthGuardModal';
import { useAuthGuard } from '../hooks/useAuthGuard';

const navCategories = [
  { name: "Engine & Drivetrain", icon: <Cpu className="w-4 h-4" />, items: ["Turbochargers", "Pistons", "Gearboxes", "Clutch Kits"] },
  { name: "Braking Systems", icon: <Disc className="w-4 h-4" />, items: ["Brembo Pads", "Rotors", "Lines", "Calipers"] },
  { name: "Suspension", icon: <Wrench className="w-4 h-4" />, items: ["Coilovers", "Bushings", "Strut Bars", "Arms"] },
  { name: "Electronics", icon: <Radio className="w-4 h-4" />, items: ["ECUs", "Sensors", "Wiring", "Lighting"] },
  { name: "Exterior/Body", icon: <Box className="w-4 h-4" />, items: ["Spoilers", "Hoods", "Diffusers", "Grilles"] },
  { name: "Performance", icon: <Car className="w-4 h-4" />, items: ["Exhausts", "Intakes", "Intercoolers", "Fuel Rails"] },
];

export default function Navbar({ onSearch }) {
  const { isLoggedIn, user, login, logout, updateUser } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [localSearch, setLocalSearch] = useState("");
  const [isCatOpen, setIsCatOpen] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ emailOrUsername: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  // Name edit state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Auth guard hook (for guest users trying protected actions)
  const { guardAction, AuthGuardModalProps } = useAuthGuard();

  // Listen for the open-login event dispatched by AuthGuardModal
  useEffect(() => {
    const handler = () => {
      setIsProfileOpen(true);
    };
    window.addEventListener('sparehub:open-login', handler);
    return () => window.removeEventListener('sparehub:open-login', handler);
  }, []);

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
      setLoginForm({ emailOrUsername: '', password: '' });
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

  // Avatar file selection handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setAvatarError('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be under 5MB.');
      return;
    }

    setAvatarError('');
    setAvatarUploading(true);
    try {
      const data = await uploadAvatar(file);
      // Update user in context with new avatar URL
      updateUser({ ...user, avatar: data.avatar });
    } catch (err) {
      setAvatarError(err.message || 'Upload failed.');
    } finally {
      setAvatarUploading(false);
      // Reset input so same file can be re-selected
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const avatarSeed = user?.name || 'User';
  // Use uploaded avatar if available, otherwise DiceBear
  const avatarSrc = user?.avatar
    ? user.avatar
    : `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

  return (
    <>
      {/* Auth Guard Modal — shown when guest tries a protected action */}
      <AuthGuardModal {...AuthGuardModalProps} />

      <nav className="w-full bg-black text-white sticky top-0 z-50 border-b border-zinc-800">
        <div className="w-full flex items-center px-6 py-4 gap-10">
          <Link to="/" className="flex items-center gap-1 shrink-0">
            <label className="text-red-600 font-black text-3xl tracking-tighter cursor-pointer">SPARE</label>
            <label className="text-white font-black text-3xl tracking-tighter cursor-pointer">HUBLK</label>
          </Link>

          <div className="hidden xl:flex items-center gap-10 text-xs font-black uppercase tracking-widest">
            {["Home", "Shop", "Categories", "Sellers", "Wheels"].map((item) => (
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
                <Link key={item} to={item === "Home" ? "/" : item === "Shop" ? "/shop" : item === "Sellers" ? "/sellers" : item === "Wheels" ? "/shop?category=wheels" : "#"} className="relative py-2 group overflow-hidden">
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
            {/* Dashboard — protected */}
            <button
              onClick={() => guardAction('access the dashboard', () => navigate('/dashboard'))}
              className="flex items-center gap-2 group bg-transparent border-0"
            >
              <LayoutDashboard className="w-5 h-5 group-hover:text-red-600 transition-colors" />
              <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">Dashboard</span>
            </button>

            {/* Wishlist — protected */}
            <button
              onClick={() => guardAction('save items to your wishlist', () => {})}
              className="bg-transparent border-0 p-0"
            >
              <Heart className="w-5 h-5 hover:text-red-600 transition-colors cursor-pointer" />
            </button>

            {/* PROFILE HUD TRIGGER */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 p-1 border transition-all ${isProfileOpen ? 'border-red-600 bg-red-600/5' : 'border-transparent'}`}
              >
                <div className="relative">
                  {isLoggedIn ? (
                    <div className="w-8 h-8 border border-red-600 overflow-hidden bg-zinc-800 rounded-full">
                      <img src={avatarSrc} alt="PFP" className="w-full h-full object-cover" />
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
                      <h3 className="text-white text-sm font-black uppercase mb-4">Member Login</h3>

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
                            name="emailOrUsername"
                            type="text"
                            value={loginForm.emailOrUsername}
                            onChange={handleLoginChange}
                            placeholder="USERNAME OR EMAIL"
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
                          {loginLoading ? 'Authenticating...' : 'Login'}
                        </button>
                      </form>

                      {/* REGISTRATION BUTTON */}
                      <button
                        onClick={() => { navigate('/register'); setIsProfileOpen(false); }}
                        className="w-full border border-zinc-800 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:border-red-600 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus size={14} />
                        Register Free
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* LOGGED-IN PROFILE PANEL */}
                      <div className="p-5 border-b border-zinc-900 bg-zinc-900/40">
                        {/* Profile Header */}
                        <div className="flex items-center gap-4 mb-5">
                          <div className="relative group/avatar shrink-0">
                            <div className="w-16 h-16 border-2 border-red-600 overflow-hidden bg-zinc-800 rounded-full">
                              <img src={avatarSrc} className="w-full h-full object-cover" alt="PFP" />
                            </div>
                            <button
                              onClick={() => avatarInputRef.current?.click()}
                              disabled={avatarUploading}
                              title="Change profile photo"
                              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full cursor-pointer"
                            >
                              {avatarUploading ? (
                                <Loader2 size={16} className="text-white animate-spin" />
                              ) : (
                                <Camera size={16} className="text-white" />
                              )}
                            </button>
                            <input
                              ref={avatarInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            {editingName ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={nameInput}
                                  onChange={(e) => setNameInput(e.target.value)}
                                  className="bg-zinc-900 border border-zinc-700 px-2 py-1 text-sm font-bold text-white focus:border-red-500 outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={async () => {
                                    if (!nameInput.trim()) return;
                                    setSavingName(true);
                                    try {
                                      const result = await updateProfile({ name: nameInput.trim() });
                                      updateUser(result.user);
                                      setEditingName(false);
                                    } catch (err) {
                                      setAvatarError(err.message || 'Failed to update name');
                                    } finally {
                                      setSavingName(false);
                                    }
                                  }}
                                  disabled={savingName}
                                  className="p-1 bg-green-600 text-white"
                                >
                                  {savingName ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                </button>
                                <button
                                  onClick={() => { setEditingName(false); setNameInput(''); }}
                                  className="p-1 bg-zinc-700 text-zinc-400"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-black text-white truncate">{user?.name}</p>
                                  <button
                                    onClick={() => { setNameInput(user?.name || ''); setEditingName(true); }}
                                    className="p-1 text-zinc-500 hover:text-white transition-colors"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-red-600 text-white">
                                    {user?.role === 'admin' ? 'Admin' : user?.isPremium ? 'PRO' : 'Member'}
                                  </span>
                                  <span className="text-[8px] text-zinc-500">{user?.city || user?.location}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-black p-3 border border-zinc-900">
                            <p className="text-[6px] text-zinc-500 uppercase font-black mb-1">Email</p>
                            <p className="text-[9px] text-white font-medium truncate">{user?.email}</p>
                          </div>
                          <div className="bg-black p-3 border border-zinc-900">
                            <p className="text-[6px] text-zinc-500 uppercase font-black mb-1">Phone</p>
                            <p className="text-[9px] text-white font-medium">{user?.phone || '—'}</p>
                          </div>
                        </div>

                        {avatarError && (
                          <p className="text-[8px] text-red-500 font-bold bg-red-900/20 border border-red-900/40 px-3 py-2 mb-3">
                            ⚠ {avatarError}
                          </p>
                        )}
                      </div>

                      {/* Menu Links */}
                      <div className="p-2 space-y-1">
                        <button 
                          onClick={() => { navigate('/dashboard'); setIsProfileOpen(false); }} 
                          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all rounded-lg"
                        >
                          <LayoutDashboard size={16} /> My Dashboard
                        </button>
                        
                        {user?.isPremium && (
                          <button 
                            onClick={() => { navigate('/pro-dashboard'); setIsProfileOpen(false); }} 
                            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all rounded-lg"
                          >
                            <Store size={16} className="text-yellow-500" /> PRO Shop
                          </button>
                        )}
                        
                        <button 
                          onClick={() => { navigate('/shop'); setIsProfileOpen(false); }} 
                          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all rounded-lg"
                        >
                          <Box size={16} /> Browse Shop
                        </button>
                      </div>

                      <div className="border-t border-zinc-900 p-2">
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-red-500 hover:bg-red-900/20 transition-all rounded-lg"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
