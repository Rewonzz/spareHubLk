import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Disc, Wrench, Radio, Box, Car, Upload, X, CheckCircle2, Eye, ShieldCheck, ArrowRight, ArrowLeft, MapPin, Share2, Lock, AlertCircle } from "lucide-react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { createProduct } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PostAd() {
  const [step, setStep] = useState(1);
  const [isDeployed, setIsDeployed] = useState(false);
  const [deployedProduct, setDeployedProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    condition: 'New',
    vehicleModel: '',
    location: '',
  });

  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const categories = [
    { name: "Engine", icon: <Cpu />, items: ["Turbochargers", "Pistons", "Clutch Kits"] },
    { name: "Braking", icon: <Disc />, items: ["Pads", "Rotors", "Calipers"] },
    { name: "Suspension", icon: <Wrench />, items: ["Coilovers", "Strut Bars"] },
    { name: "Electronics", icon: <Radio />, items: ["ECUs", "Lighting", "Sensors"] },
    { name: "Exterior", icon: <Box />, items: ["Spoilers", "Body Kits"] },
    { name: "Wheels", icon: <Car />, items: ["Alloys", "Tires"] },
  ];

  const getPriceAnalysis = () => {
    const price = parseFloat(formData.price);
    if (!price || !selectedCat) return null;
    const marketMedians = {
      "Engine": 150000, "Braking": 25000, "Suspension": 85000,
      "Electronics": 15000, "Exterior": 45000, "Wheels": 120000
    };
    const median = marketMedians[selectedCat.name] || 50000;
    const ratio = price / median;
    if (ratio < 0.8) return { label: "Competitive", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" };
    if (ratio <= 1.2) return { label: "Fair Market", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    return { label: "High Value", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" };
  };

  const analysis = getPriceAnalysis();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length <= 5) {
      setImages([...images, ...files]);
    }
  };

  const handleDeploy = async () => {
    if (!isLoggedIn) {
      setSubmitError('You must be logged in to post a listing.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const data = await createProduct({
        title: formData.title,
        price: formData.price,
        condition: formData.condition,
        category: selectedCat?.name || 'General',
        subCategory: selectedSubCat,
        vehicleModel: formData.vehicleModel,
        location: formData.location || user?.sector || 'Colombo, LK',
      });
      setDeployedProduct(data.product);
      setIsDeployed(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- SUCCESS SCREEN ---
  if (isDeployed) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen text-white selection:bg-red-600">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-32 text-center animate-in fade-in zoom-in-95 duration-1000">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-600/10 border border-red-600/50 mb-8 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <CheckCircle2 size={48} className="text-red-600" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none">
            INJECTION <span className="text-red-600">SUCCESS.</span>
          </h1>
          <p className="text-zinc-500 uppercase tracking-[0.4em] text-[10px] font-black mb-12 italic">
            Listing ID: {deployedProduct?._id?.slice(-8).toUpperCase() || 'CORE-SYS'} // System Validated
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 border-y border-zinc-900 py-12 mb-12">
            <div className="px-6 border-r border-zinc-900">
              <p className="text-zinc-600 text-[8px] font-black uppercase mb-2 tracking-widest">Part</p>
              <p className="font-bold text-sm uppercase italic">{deployedProduct?.title}</p>
            </div>
            <div className="px-6 border-r border-zinc-900">
              <p className="text-zinc-600 text-[8px] font-black uppercase mb-2 tracking-widest">Price</p>
              <p className="font-bold text-sm uppercase italic text-red-600">LKR {Number(deployedProduct?.price).toLocaleString()}</p>
            </div>
            <div className="px-6">
              <p className="text-zinc-600 text-[8px] font-black uppercase mb-2 tracking-widest">Pricing Meta</p>
              <p className={`font-bold text-sm uppercase italic ${analysis?.color || 'text-white'}`}>
                {analysis?.label || 'Standard'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="px-12 py-5 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
              <Eye size={14} /> View Live Shop
            </Link>
            <button onClick={() => navigate('/dashboard')} className="px-12 py-5 border border-zinc-800 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-900 transition-all flex items-center justify-center gap-2">
              <Share2 size={14} /> Go to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // --- GUARD: Not logged in ---
  if (!isLoggedIn) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center p-10 border border-zinc-800 bg-zinc-950 max-w-md">
            <Lock size={40} className="text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Access Denied</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-6">You must be logged in to post a listing.</p>
            <Link to="/register" className="inline-block bg-red-600 px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Create Account</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans antialiased selection:bg-red-600">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-24 flex flex-col lg:flex-row gap-20">

        {/* LEFT: FORM SECTION */}
        <div className="flex-1">
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-red-600 text-white px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase italic">
                PHASE 0{step}
              </span>
              <div className="h-[2px] flex-1 bg-zinc-900">
                <div
                  className="h-full bg-red-600 transition-all duration-700 ease-in-out"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>
            <h1 className="text-7xl font-black uppercase tracking-tighter leading-none">
              LIST <span className="text-red-600">PART.</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-4 italic">Automotive Component Injection System</p>
          </div>

          {submitError && (
            <div className="mb-6 bg-red-900/20 border border-red-600/40 text-red-400 text-[10px] font-bold uppercase tracking-widest p-4 flex items-center gap-2">
              <AlertCircle size={14} /> {submitError}
            </div>
          )}

          {/* STEP 1: Category + Title + Vehicle Model */}
          {step === 1 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => { setSelectedCat(cat); setSelectedSubCat(''); }}
                    className={`p-8 border-2 flex flex-col items-center gap-4 transition-all duration-500 group ${selectedCat?.name === cat.name
                        ? "border-red-600 bg-red-600/10 shadow-[0_0_30px_rgba(220,38,38,0.1)]"
                        : "border-zinc-900 bg-zinc-900/30 hover:border-zinc-700"
                      }`}
                  >
                    <div className={`${selectedCat?.name === cat.name ? "text-red-500" : "text-zinc-600 group-hover:text-zinc-400"}`}>
                      {React.cloneElement(cat.icon, { size: 28 })}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Sub-category if cat selected */}
              {selectedCat && (
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Sub-Category</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCat.items.map(item => (
                      <button
                        key={item}
                        onClick={() => setSelectedSubCat(item)}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${selectedSubCat === item ? 'border-red-600 bg-red-600/10 text-red-500' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                          }`}
                      >{item}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Component Nomenclature (Part Name)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ENTER PART NAME..."
                  className="w-full bg-transparent border-b border-zinc-800 py-4 outline-none focus:border-red-600 text-2xl font-black uppercase placeholder:text-zinc-800 transition-all"
                />
              </div>

              {/* NEW: Vehicle Model */}
              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Compatible Vehicle Model</label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  placeholder="E.G. TOYOTA COROLLA KSP130 / HONDA CIVIC FD4"
                  className="w-full bg-transparent border-b border-zinc-800 py-4 outline-none focus:border-red-600 text-xl font-bold uppercase text-white placeholder:text-zinc-800 transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Images + Price */}
          {step === 2 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label className="aspect-square border-2 border-dashed border-zinc-900 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 hover:bg-red-600/5 transition-all group">
                  <Upload className="text-zinc-700 group-hover:text-red-600" size={32} />
                  <span className="text-[9px] font-black uppercase mt-4 text-zinc-600 tracking-widest">Upload Visuals</span>
                  <input type="file" multiple className="hidden" onChange={handleImageUpload} />
                </label>
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square bg-zinc-900 overflow-hidden border border-zinc-800 group">
                    <img src={URL.createObjectURL(img)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="part" />
                    <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-3 right-3 bg-red-600 text-white p-1.5 hover:bg-white hover:text-red-600 transition-all">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Market Value (LKR)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="000,000"
                    className="w-full bg-transparent border-b border-zinc-800 py-4 outline-none focus:border-red-600 text-5xl font-black text-white placeholder:text-zinc-900"
                  />
                </div>
                {analysis && (
                  <div className={`inline-flex items-center gap-3 px-4 py-2 border ${analysis.border} ${analysis.bg} animate-in zoom-in-95 duration-300`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${analysis.color.replace('text', 'bg')} animate-pulse`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${analysis.color}`}>Neural Check: {analysis.label}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Location + Condition */}
          {step === 3 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-1 gap-10">
                {/* NEW: Seller Location */}
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <MapPin size={12} className="text-red-600" /> Your Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="E.G. COLOMBO 07, WESTERN PROVINCE"
                    className="w-full bg-transparent border-b border-zinc-800 py-4 outline-none focus:border-red-600 text-xl font-bold uppercase text-white placeholder:text-zinc-900 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Part Condition</label>
                  <div className="flex gap-4">
                    {["New", "Used"].map(cond => (
                      <button
                        key={cond}
                        onClick={() => setFormData({ ...formData, condition: cond })}
                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border transition-all ${formData.condition === cond ? "bg-white text-black border-white" : "border-zinc-800 text-zinc-600 hover:border-zinc-500"
                          }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-red-600/5 border border-red-600/20 p-8 flex items-start gap-4">
                <ShieldCheck className="text-red-600 shrink-0" size={24} />
                <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                  By deploying, you confirm that the component meets <span className="text-white">CORE SAFETY STANDARDS</span>. Inaccurate metadata may lead to system de-indexing.
                </p>
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex gap-4 pt-16">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="px-10 py-5 border border-zinc-800 font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2">
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <Link to="/shop" className="px-10 py-5 border border-zinc-900 text-zinc-700 font-black uppercase text-[10px] tracking-widest hover:text-zinc-400 transition-all">
                Cancel
              </Link>
            )}
            <button
              onClick={() => step < 3 ? setStep(step + 1) : handleDeploy()}
              disabled={submitting}
              className="flex-1 bg-red-600 py-5 text-white font-black uppercase text-[10px] tracking-[0.4em] hover:bg-white hover:text-red-600 transition-all shadow-[0_10px_40px_rgba(220,38,38,0.2)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Deploying...' : step === 3 ? 'Deploy Listing' : 'Proceed'} <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* RIGHT: LIVE RENDER SIDEBAR */}
        <aside className="lg:w-80 shrink-0">
          <div className="sticky top-32">
            <div className="flex items-center gap-3 mb-8 border-l-2 border-red-600 pl-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Live Render</span>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-5 group">
              <div className="aspect-[4/5] bg-black mb-5 overflow-hidden relative border border-zinc-800">
                {images[0] ? (
                  <img src={URL.createObjectURL(images[0])} className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-700" alt="render" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-800 gap-2 italic">
                    <Car size={40} className="opacity-10" />
                    <span className="font-black text-[8px] tracking-widest uppercase opacity-20">No Media Input</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-red-600 text-white text-[7px] font-black px-2 py-1 uppercase italic tracking-widest">
                  {formData.condition}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-black uppercase tracking-tight text-white group-hover:text-red-500 transition-colors truncate">
                    {formData.title || "SYSTEM_PENDING"}
                  </h3>
                  {analysis && (
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 border ${analysis.border} ${analysis.color} shrink-0`}>
                      {analysis.label}
                    </span>
                  )}
                </div>

                {formData.vehicleModel && (
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                    🚗 {formData.vehicleModel}
                  </p>
                )}

                {selectedCat && (
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                    {selectedCat.name}{selectedSubCat ? ` › ${selectedSubCat}` : ''}
                  </p>
                )}

                <p className="text-red-600 font-black text-2xl tracking-tighter mt-1 italic">
                  LKR {formData.price ? Number(formData.price).toLocaleString() : "0.00"}
                </p>

                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={10} className="text-red-600" /> {formData.location || user?.sector || "Location Required"}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse delay-75"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
      <Footer />
    </div>
  );
}