import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Disc, Wrench, Radio, Box, Car, Upload, X, CheckCircle2, Eye, ShieldCheck, ArrowRight, ArrowLeft, MapPin, Share2, Lock, AlertCircle, Plus, Trash2 } from "lucide-react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { createProduct, uploadProductImages } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PostAd() {
  const [step, setStep] = useState(1);
  const [isPosted, setIsPosted] = useState(false);
  const [postedProduct, setPostedProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Additional Specs State
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  
  // Google Maps State
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    condition: 'New',
    vehicleModel: '',
    chassisNumber: '',
    vehicleYear: '',
    location: '',
  });

  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  // Check token validity
  const isTokenValid = () => {
    const token = localStorage.getItem('sparehub_token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  // Force re-login if token is invalid
  const handleAuthError = () => {
    logout();
    navigate('/register', { state: { message: 'Session expired. Please log in again.' } });
  };

  const categories = [
    { name: "Engine", icon: <Cpu />, items: ["Turbochargers", "Pistons", "Clutch Kits"] },
    { name: "Braking", icon: <Disc />, items: ["Pads", "Rotors", "Calipers"] },
    { name: "Suspension", icon: <Wrench />, items: ["Coilovers", "Strut Bars"] },
    { name: "Electronics", icon: <Radio />, items: ["ECUs", "Lighting", "Sensors"] },
    { name: "Exterior", icon: <Box />, items: ["Spoilers", "Body Kits"] },
    { name: "Wheels", icon: <Car />, items: ["Alloys", "Tires"] },
  ];

  // Specs handlers
  const addSpec = () => {
    if (specs.length < 5) {
      setSpecs([...specs, { key: '', value: '' }]);
    }
  };

  const removeSpec = (index) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index, field, val) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  // Google Maps initialization
  const initMap = useCallback(() => {
    if (!mapRef.current || mapLoaded) return;

    // Load Leaflet CSS
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(linkEl);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
      
      const sriLanka = [6.9271, 79.8612];
      const initialPos = selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : sriLanka;

      const map = window.L.map(mapRef.current, {
        center: initialPos,
        zoom: 12,
      });

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const marker = window.L.marker(initialPos, { draggable: true }).addTo(map);
      markerRef.current = { marker, map };

      // Click on map
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateLocationFromCoords(lat, lng);
      });

      // Drag marker
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateLocationFromCoords(pos.lat, pos.lng);
      });
    };
    document.head.appendChild(script);
  }, [selectedLocation, mapLoaded]);

  useEffect(() => {
    if (step === 3 && !mapLoaded) {
      initMap();
    }
  }, [step, mapLoaded, initMap]);

  const updateLocationFromCoords = async (lat, lng) => {
    setSelectedLocation({ lat, lng });
    
    // Reverse geocode using Nominatim (OpenStreetMap)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        const address = data.display_name;
        setLocationAddress(address);
        setFormData(prev => ({ ...prev, location: address }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setFormData(prev => ({ ...prev, location: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (markerRef.current) {
            markerRef.current.marker.setLatLng([lat, lng]);
            markerRef.current.map.setView([lat, lng], 14);
          }
          
          updateLocationFromCoords(lat, lng);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

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

  const validateStep = (currentStep) => {
    setFieldErrors({});
    const errors = {};
    if (currentStep === 1) {
      if (!selectedCat) {
        errors.category = 'Please select a category.';
      }
      if (!formData.title.trim()) {
        errors.title = 'Please enter the part name.';
      }
      if (!formData.vehicleModel.trim()) {
        errors.vehicleModel = 'Please enter the compatible vehicle model.';
      }
      if (!formData.vehicleYear.trim()) {
        errors.vehicleYear = 'Please enter the vehicle year.';
      } else if (formData.vehicleYear.length !== 4 || !/^\d{4}$/.test(formData.vehicleYear)) {
        errors.vehicleYear = 'Please enter a valid 4-digit year.';
      }
    }
    if (currentStep === 2) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        errors.price = 'Please enter a valid price.';
      }
    }
    if (currentStep === 3) {
      if (!formData.location.trim() && !selectedLocation) {
        errors.location = 'Please select your location on the map.';
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = images.length;
    const newCount = files.length;
    const maxAllowed = 5 - currentCount;
    
    if (maxAllowed <= 0) {
      return;
    }
    
    const filesToAdd = files.slice(0, maxAllowed);
    setImages([...images, ...filesToAdd]);
    
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setSubmitError('You must be logged in to post a listing.');
      return;
    }

    // Check if token is valid before submitting
    if (!isTokenValid()) {
      setSubmitError('Session expired. Redirecting to login...');
      setTimeout(handleAuthError, 2000);
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      let imageUrls = [];
      if (images.length > 0) {
        const uploadResult = await uploadProductImages(images);
        imageUrls = uploadResult.images;
      }

      const validSpecs = specs.filter(s => s.key.trim() && s.value.trim());

      const data = await createProduct({
        title: formData.title,
        price: formData.price,
        condition: formData.condition,
        category: selectedCat?.name || 'General',
        subCategory: selectedSubCat,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear,
        chassisNumber: formData.chassisNumber,
        location: formData.location || user?.location || 'Colombo, LK',
        locationCoords: selectedLocation,
        specs: validSpecs,
        images: imageUrls,
      });
      setPostedProduct(data.product);
      setIsPosted(true);
    } catch (err) {
      // Handle auth errors specifically
      if (err.message.includes('token') || err.message.includes('403') || err.message.includes('expired')) {
        setSubmitError('Session expired. Redirecting to login...');
        setTimeout(handleAuthError, 2000);
      } else {
        setSubmitError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isPosted) {
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
            Listing ID: {postedProduct?._id?.slice(-8).toUpperCase() || 'SYSTEM'} // System Validated
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 border-y border-zinc-900 py-12 mb-12">
            <div className="px-6 border-r border-zinc-900">
              <p className="text-zinc-600 text-[8px] font-black uppercase mb-2 tracking-widest">Part</p>
              <p className="font-bold text-sm uppercase italic">{postedProduct?.title}</p>
            </div>
            <div className="px-6 border-r border-zinc-900">
              <p className="text-zinc-600 text-[8px] font-black uppercase mb-2 tracking-widest">Price</p>
              <p className="font-bold text-sm uppercase italic text-red-600">LKR {Number(postedProduct?.price).toLocaleString()}</p>
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
        <div className="flex-1">
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-red-600 text-white px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase italic">
                PHASE 0{step}
              </span>
              <div className="h-[2px] flex-1 bg-zinc-900">
                <div className="h-full bg-red-600 transition-all duration-700 ease-in-out" style={{ width: `${(step / 3) * 100}%` }}></div>
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

          {/* STEP 1: Category + Title + Vehicle Model + Specs */}
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

              {selectedCat && (
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Sub-Category</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCat.items.map(item => (
                      <button
                        key={item}
                        onClick={() => setSelectedSubCat(item)}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${selectedSubCat === item ? 'border-red-600 bg-red-600/10 text-red-500' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
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
                  onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setFieldErrors({ ...fieldErrors, title: '' }); }}
                  placeholder={fieldErrors.title ? fieldErrors.title : "ENTER PART NAME..."}
                  className={`w-full bg-transparent border-b py-4 outline-none focus:border-red-600 text-2xl font-black uppercase placeholder:text-zinc-800 transition-all ${fieldErrors.title ? 'border-red-500 text-red-500 placeholder:text-red-500' : 'border-zinc-800'}`}
                />
              </div>

              <input
                type="text"
                value={formData.vehicleModel}
                onChange={(e) => { setFormData({ ...formData, vehicleModel: e.target.value }); setFieldErrors({ ...fieldErrors, vehicleModel: '' }); }}
                placeholder={fieldErrors.vehicleModel ? fieldErrors.vehicleModel : "VEHICLE MODEL (E.G. TOYOTA COROLLA KSP130)"}
                className={`w-full bg-transparent border-b py-4 outline-none focus:border-red-600 text-xl font-bold uppercase transition-all ${fieldErrors.vehicleModel ? 'border-red-500 text-red-500 placeholder:text-red-500' : 'border-zinc-800 text-white placeholder:text-zinc-800'}`}
              />

              <input
                type="text"
                value={formData.chassisNumber}
                onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value.toUpperCase() })}
                placeholder="CHASSIS NUMBER (OPTIONAL)"
                className="w-full bg-transparent border-b border-zinc-800 py-4 outline-none focus:border-red-600 text-xl font-bold uppercase text-white placeholder:text-zinc-800 transition-all"
              />

              <input
                type="text"
                value={formData.vehicleYear}
                onChange={(e) => { setFormData({ ...formData, vehicleYear: e.target.value.replace(/\D/g, '').slice(0, 4) }); setFieldErrors({ ...fieldErrors, vehicleYear: '' }); }}
                placeholder={fieldErrors.vehicleYear ? fieldErrors.vehicleYear : "YEAR (E.G. 2019)"}
                className={`w-full bg-transparent border-b py-4 outline-none focus:border-red-600 text-xl font-bold uppercase transition-all ${fieldErrors.vehicleYear ? 'border-red-500 text-red-500 placeholder:text-red-500' : 'border-zinc-800 text-white placeholder:text-zinc-800'}`}
              />

              {/* ADDITIONAL SPECS SECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Additional Specifications</label>
                  {specs.length < 5 && (
                    <button onClick={addSpec} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-600 hover:text-red-500 transition-colors">
                      <Plus size={12} /> Add Field
                    </button>
                  )}
                </div>
                <p className="text-[8px] text-zinc-600 uppercase tracking-widest">E.g., Tire Size: 195/65R15, Bolt Pattern: 5x114.3, Part Number: ABC123</p>
                
                {specs.map((spec, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => updateSpec(index, 'key', e.target.value)}
                      placeholder="SPEC NAME (E.G. TIRE SIZE)"
                      className="flex-1 bg-transparent border-b border-zinc-800 py-3 outline-none focus:border-red-600 text-sm font-bold uppercase text-white placeholder:text-zinc-800 transition-all"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => updateSpec(index, 'value', e.target.value)}
                      placeholder="VALUE (E.G. 195/65R15)"
                      className="flex-1 bg-transparent border-b border-zinc-800 py-3 outline-none focus:border-red-600 text-sm font-bold uppercase text-white placeholder:text-zinc-800 transition-all"
                    />
                    {specs.length > 1 && (
                      <button onClick={() => removeSpec(index)} className="p-2 text-zinc-600 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Images + Price */}
          {step === 2 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-zinc-900 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 hover:bg-red-600/5 transition-all group">
                    <Upload className="text-zinc-700 group-hover:text-red-600" size={32} />
                    <span className="text-[9px] font-black uppercase mt-4 text-zinc-600 tracking-widest">Upload Visuals</span>
                    <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                )}
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square bg-zinc-900 overflow-hidden border border-zinc-800 group">
                    <img src={URL.createObjectURL(img)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="part" />
                    <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-3 right-3 bg-red-600 text-white p-1.5 hover:bg-white hover:text-red-600 transition-all">
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[8px] px-2 py-1">
                      {i + 1}/{images.length}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                {images.length}/5 images uploaded
              </p>
              <div className="space-y-6">
                <div className="space-y-3">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => { setFormData({ ...formData, price: e.target.value }); setFieldErrors({ ...fieldErrors, price: '' }); }}
                    placeholder={fieldErrors.price ? fieldErrors.price : "000,000"}
                    className={`w-full bg-transparent border-b py-4 outline-none focus:border-red-600 text-5xl font-black transition-all ${fieldErrors.price ? 'border-red-500 text-red-500 placeholder:text-red-500' : 'border-zinc-800 text-white placeholder:text-zinc-900'}`}
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

          {/* STEP 3: Location Map + Condition */}
          {step === 3 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Google Maps Location Picker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <MapPin size={12} className="text-red-600" /> Select Location on Map
                  </label>
                  <button 
                    onClick={getCurrentLocation}
                    className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-600 hover:text-red-500 transition-colors border border-red-600/30 px-3 py-1.5 hover:bg-red-600/10"
                  >
                    <MapPin size={10} /> Use Current Location
                  </button>
                </div>
                <div 
                  ref={mapRef} 
                  className="w-full h-[300px] border border-zinc-800 bg-zinc-900"
                ></div>
                <p className="text-[8px] text-zinc-600 uppercase tracking-widest">
                  Click on map or drag marker to set your location
                </p>
                
                {/* Location Display */}
                {locationAddress && (
                  <div className="bg-zinc-900/50 border border-zinc-800 p-4">
                    <p className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1">Selected Location</p>
                    <p className="text-sm font-bold text-white">{locationAddress}</p>
                    {selectedLocation && (
                      <p className="text-[9px] text-zinc-600 font-mono mt-2">
                        Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                )}

                {/* Manual Location Input Fallback */}
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setFieldErrors({ ...fieldErrors, location: '' }); }}
                  placeholder={fieldErrors.location ? fieldErrors.location : "OR TYPE LOCATION MANUALLY (E.G. COLOMBO 07)"}
                  className={`w-full bg-transparent border-b py-4 outline-none focus:border-red-600 text-xl font-bold uppercase transition-all ${fieldErrors.location ? 'border-red-500 text-red-500 placeholder:text-red-500' : 'border-zinc-800 text-white placeholder:text-zinc-800'}`}
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Part Condition</label>
                <div className="flex gap-4">
                  {["New", "Used"].map(cond => (
                    <button
                      key={cond}
                      onClick={() => setFormData({ ...formData, condition: cond })}
                      className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest border transition-all ${formData.condition === cond ? "bg-white text-black border-white" : "border-zinc-800 text-zinc-600 hover:border-zinc-500"}`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-red-600/5 border border-red-600/20 p-8 flex items-start gap-4">
                <ShieldCheck className="text-red-600 shrink-0" size={24} />
                <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                  By posting, you confirm that the item meets <span className="text-white">safety standards</span>. Inaccurate information may result in listing removal.
                </p>
              </div>
            </div>
          )}

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
              onClick={() => step < 3 ? handleNextStep() : handleSubmit()}
              disabled={submitting}
              className="flex-1 bg-red-600 py-5 text-white font-black uppercase text-[10px] tracking-[0.4em] hover:bg-white hover:text-red-600 transition-all shadow-[0_10px_40px_rgba(220,38,38,0.2)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : step === 3 ? 'Post Listing' : 'Proceed'} <ArrowRight size={14} />
            </button>
          </div>
        </div>

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
                    {formData.title || "Enter Title"}
                  </h3>
                  {analysis && (
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 border ${analysis.border} ${analysis.color} shrink-0`}>
                      {analysis.label}
                    </span>
                  )}
                </div>

                {formData.vehicleModel && (
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                    {formData.vehicleModel}
                  </p>
                )}

                {selectedCat && (
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                    {selectedCat.name}{selectedSubCat ? ` › ${selectedSubCat}` : ''}
                  </p>
                )}

                {/* Show specs in preview */}
                {specs.some(s => s.key && s.value) && (
                  <div className="pt-2 border-t border-zinc-800">
                    {specs.filter(s => s.key && s.value).map((s, i) => (
                      <p key={i} className="text-[8px] text-zinc-500 uppercase tracking-widest">
                        <span className="text-zinc-400">{s.key}:</span> {s.value}
                      </p>
                    ))}
                  </div>
                )}

                <p className="text-red-600 font-black text-2xl tracking-tighter mt-1 italic">
                  LKR {formData.price ? Number(formData.price).toLocaleString() : "0.00"}
                </p>

                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={10} className="text-red-600" /> {formData.location || "Location Required"}
                  </span>
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
