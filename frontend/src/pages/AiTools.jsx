import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Scan, MessageSquare, Image, BarChart3, Cpu, PackageCheck, AlertTriangle, Zap, Car, Wrench, Search, TrendingUp, TrendingDown, Minus, ChevronRight, Tag, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import ChatBot from '../components/ChatBot';
import { decodeVinWithAI } from '../services/vinDecoderService';
import { analyzePrice } from '../services/marketIntelligenceService';
import { getProducts } from '../services/api';
import { identifyPartFromImage } from '../services/geminiService';

export default function AiTools() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("VIN/Chassis Part Identifier");

  const [vin, setVin] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  const [storeProducts, setStoreProducts] = useState([]);
  const [isFetchingParts, setIsFetchingParts] = useState(false);
  const [hasSearchedParts, setHasSearchedParts] = useState(false);

  // Market Intelligence state
  const [partName, setPartName] = useState("");
  const [partPrice, setPartPrice] = useState("");
  const [priceAnalysis, setPriceAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  // Image Identifier state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const [imageStoreProducts, setImageStoreProducts] = useState([]);
  const [isFetchingImageParts, setIsFetchingImageParts] = useState(false);
  const [hasSearchedImageParts, setHasSearchedImageParts] = useState(false);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const handleVinScan = async () => {
    if (!vin.trim() || vin.trim().length < 5) {
      return alert("Please enter at least 5 characters of your VIN or chassis number.");
    }

    setIsLoading(true);
    setVehicleData(null);
    setStoreProducts([]);
    setHasSearchedParts(false);

    try {
      setLoadingStep("Sending to AI engine...");
      await new Promise(r => setTimeout(r, 300));
      setLoadingStep("Decoding chassis data...");
      const data = await decodeVinWithAI(vin.trim());
      setVehicleData(data);

      // Immediately search the store after decode — no extra button needed
      setLoadingStep("Scanning store inventory...");
      await searchStoreParts(data);
    } catch (error) {
      alert(error.message || "AI decoding failed. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const searchStoreParts = async (decodedVehicle) => {
    if (!decodedVehicle) return;
    setIsFetchingParts(true);
    setHasSearchedParts(true);

    try {
      const keywords = [
        decodedVehicle.make,
        decodedVehicle.model,
        ...(decodedVehicle.searchKeywords || []),
      ].filter(Boolean);

      const allProducts = await getProducts();
      const products = Array.isArray(allProducts) ? allProducts : (allProducts.products || []);

      const matched = products.filter(p => {
        const haystack = [p.title, p.vehicleModel, p.category, p.subCategory]
          .join(' ').toLowerCase();
        return keywords.some(kw => kw && haystack.includes(kw.toLowerCase()));
      });

      setStoreProducts(matched);
    } catch (err) {
      console.error("Store fetch error:", err);
      setStoreProducts([]);
    } finally {
      setIsFetchingParts(false);
    }
  };

  const handlePriceAnalysis = async () => {
    if (!partName.trim()) return;
    const price = parseInt(partPrice, 10);
    if (!price || price <= 0) return;

    setIsAnalyzing(true);
    setPriceAnalysis(null);
    setAnalysisError("");
    try {
      const result = await analyzePrice(partName.trim(), price);
      setPriceAnalysis(result);
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageResult(null);
    setImageStoreProducts([]);
    setHasSearchedImageParts(false);
  };

  const handleImageIdentify = async () => {
    if (!imageFile) return;
    setIsIdentifying(true);
    setImageResult(null);
    setImageStoreProducts([]);
    setHasSearchedImageParts(false);

    try {
      const result = await identifyPartFromImage(imageFile);
      setImageResult(result);
      await searchImageStoreParts(result);
    } catch (error) {
      alert(error.message || "Image identification failed. Please try again.");
    } finally {
      setIsIdentifying(false);
    }
  };

  const searchImageStoreParts = async (identification) => {
    if (!identification) return;
    setIsFetchingImageParts(true);
    setHasSearchedImageParts(true);

    try {
      const keywords = [
        identification.partName,
        identification.category,
        identification.vehicleModel,
        ...(identification.keywords || []),
      ].filter(Boolean);

      const allProducts = await getProducts();
      const products = Array.isArray(allProducts) ? allProducts : (allProducts.products || []);

      const matched = products.filter(p => {
        const haystack = [p.title, p.vehicleModel, p.category, p.subCategory]
          .join(' ').toLowerCase();
        return keywords.some(kw => kw && haystack.includes(kw.toLowerCase()));
      });

      setImageStoreProducts(matched);
    } catch (err) {
      console.error("Store fetch error:", err);
      setImageStoreProducts([]);
    } finally {
      setIsFetchingImageParts(false);
    }
  };

  const tabs = [
    { name: "VIN/Chassis Part Identifier", icon: <Scan size={18} /> },
    { name: "Smart Assistant", icon: <MessageSquare size={18} /> },
    { name: "Part Image Search", icon: <Image size={18} /> },
    { name: "Market Intelligence", icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="text-red-600" size={20} />
            <span className="text-red-600 font-black text-[10px] tracking-[0.3em] uppercase italic">AI Tools</span>
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">Smart <span className="text-red-600">Solutions</span></h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-1 border-y border-zinc-900 bg-zinc-900/20">
          {/* Sidebar */}
          <div className="lg:w-64 border-r border-zinc-900">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`w-full flex items-center gap-4 px-6 py-6 text-[10px] font-black uppercase tracking-widest transition-all border-b border-zinc-900/50 ${activeTab === tab.name ? "bg-red-600 text-white" : "hover:bg-zinc-800 text-zinc-500"
                  }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="flex-1 p-8 lg:p-12 min-h-[500px] bg-zinc-950/50 relative overflow-hidden">
            {/* CRT scanline overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>

            {/* ── VIN Decoder ── */}
            {activeTab === "VIN/Chassis Part Identifier" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <Zap size={20} className="text-red-600" />
                  <h2 className="text-2xl font-black uppercase">AI VIN Decoder</h2>
                </div>
                <p className="text-zinc-500 text-xs mb-8 font-medium italic">
                  // Enter any VIN or chassis number — AI decodes your vehicle and shows available parts in real-time
                </p>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      id="vin-input"
                      type="text"
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleVinScan()}
                      placeholder="ENTER VIN OR CHASSIS NUMBER (e.g. KSP130, 1HGBH41JXMN109186)..."
                      className="w-full bg-black border border-zinc-800 p-5 text-base font-mono text-red-500 focus:border-red-600 outline-none uppercase transition-all tracking-wider placeholder:text-zinc-700 placeholder:text-xs placeholder:tracking-normal"
                    />
                    {vin && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-zinc-600 font-mono">
                        {vin.length} chars
                      </div>
                    )}
                  </div>

                  <button
                    id="vin-decode-btn"
                    onClick={handleVinScan}
                    disabled={isLoading}
                    className="bg-red-600 text-white px-10 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                        {loadingStep || "AI Processing..."}
                      </>
                    ) : (
                      <><Zap size={14} /> Decode with AI</>
                    )}
                  </button>
                </div>

                {/* ── Result Card ── */}
                {vehicleData && (
                  <div className="mt-10 border border-red-600/40 bg-red-600/5 p-8 animate-in zoom-in-95 duration-300 space-y-8">

                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                      <div>
                        <span className="text-[9px] font-bold text-red-600 tracking-[0.2em] uppercase block mb-1">AI Decode — Complete</span>
                        <p className="text-2xl font-black uppercase text-white">{vehicleData.make} {vehicleData.model}</p>
                      </div>
                      <span className="text-[9px] text-zinc-600 font-mono uppercase bg-zinc-900 px-3 py-1 border border-zinc-800">{vin}</span>
                    </div>

                    {/* Vehicle details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {[
                        { label: "Manufacturer", value: vehicleData.make, icon: <Car size={13} /> },
                        { label: "Model", value: vehicleData.model, icon: <Car size={13} /> },
                        { label: "Year Range", value: vehicleData.year, icon: <Cpu size={13} /> },
                        { label: "Engine", value: vehicleData.engine, icon: <Wrench size={13} /> },
                        { label: "Body Type", value: vehicleData.bodyType, icon: <Car size={13} /> },
                        { label: "Transmission", value: vehicleData.transmission, icon: <Wrench size={13} /> },
                      ].map(({ label, value, icon }) => (
                        <div key={label}>
                          <p className="text-[8px] text-zinc-600 uppercase font-black tracking-[0.2em] mb-1 flex items-center gap-1">{icon} {label}</p>
                          <p className="text-sm font-bold uppercase text-white">{value || "—"}</p>
                        </div>
                      ))}
                    </div>

                    {/* Description */}
                    {vehicleData.description && (
                      <div className="bg-zinc-900/60 border border-zinc-800 p-4">
                        <p className="text-[9px] text-zinc-500 font-mono leading-relaxed">{vehicleData.description}</p>
                      </div>
                    )}

                    {/* ── Store Parts — auto-loaded ── */}
                    {hasSearchedParts && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                            <Search size={12} /> Compatible Parts in Our Store
                          </h3>
                          {isFetchingParts ? (
                            <span className="text-[9px] text-zinc-600 font-mono animate-pulse">Scanning inventory...</span>
                          ) : (
                            <span className="text-[9px] font-mono text-zinc-600">{storeProducts.length} result(s) found</span>
                          )}
                        </div>

                        {isFetchingParts ? (
                          <div className="flex items-center gap-3 p-4 border border-zinc-800 bg-zinc-900/40">
                            <span className="flex gap-1">
                              <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">Scanning live inventory...</span>
                          </div>
                        ) : storeProducts.length > 0 ? (
                          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {storeProducts.map((item, idx) => (
                              <a
                                key={idx}
                                href={`/product/${item._id}`}
                                className="bg-zinc-900/60 p-4 border border-zinc-800 flex justify-between items-center group hover:border-red-600/60 transition-all"
                              >
                                <div>
                                  <p className="text-xs font-bold text-white uppercase group-hover:text-red-400 transition-colors">{item.title}</p>
                                  <p className="text-[9px] text-zinc-600 font-mono mt-0.5">
                                    {item.category}{item.vehicleModel ? ` · ${item.vehicleModel}` : ''}
                                  </p>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                  <p className="text-sm font-black text-red-500">LKR {item.price?.toLocaleString()}</p>
                                  <div className={`flex items-center gap-1 text-[8px] font-black uppercase italic mt-1 ${item.status === 'active' ? 'text-green-500' : 'text-zinc-500'}`}>
                                    <PackageCheck size={11} /> {item.condition || 'Available'}
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        ) : (
                          // ── Not Available message ──
                          <div className="p-6 border border-red-900/40 bg-red-950/10 text-center">
                            <AlertTriangle size={28} className="text-red-800 mx-auto mb-3" />
                            <p className="text-sm font-black text-red-500 uppercase tracking-wider">
                              No Parts Available
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                              We currently don't have compatible parts for your{' '}
                              <span className="text-white font-bold">{vehicleData.make} {vehicleData.model}</span> in our store.
                            </p>
                            <a
                              href="/shop"
                              className="inline-block mt-4 px-6 py-2 border border-zinc-700 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:border-red-600 hover:text-red-500 transition-all"
                            >
                              Browse All Parts →
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Smart Assistant ── */}
            {activeTab === "Smart Assistant" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full">
                <h2 className="text-2xl font-black uppercase mb-2">Operations Copilot</h2>
                <p className="text-zinc-500 text-xs mb-4 font-medium italic">// AI-powered assistant for spare parts queries and vehicle diagnostics</p>
                <div className="h-[450px]">
                  <ChatBot variant="full" isOpen={true} onClose={() => { }} />
                </div>
              </div>
            )}

            {/* ── Part Image Search ── */}
            {activeTab === "Part Image Search" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <Image size={20} className="text-red-600" />
                  <h2 className="text-2xl font-black uppercase">Part Image Search</h2>
                </div>
                <p className="text-zinc-500 text-xs mb-8 font-medium italic">
                  // Upload a photo of any spare part — AI identifies it and searches our inventory
                </p>

                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload-input"
                  />
                  <label
                    htmlFor="image-upload-input"
                    className={`border-2 border-dashed h-64 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${imagePreview ? 'border-red-600' : 'border-zinc-800 hover:border-red-600'}`}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain bg-black" />
                    ) : (
                      <>
                        <Image size={40} className="text-zinc-700 mb-4" />
                        <span className="text-[10px] font-black uppercase text-zinc-500">Upload Part Photo</span>
                      </>
                    )}
                  </label>

                  <button
                    onClick={handleImageIdentify}
                    disabled={!imageFile || isIdentifying}
                    className="bg-red-600 text-white px-10 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-3"
                  >
                    {isIdentifying ? (
                      <>
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                        AI Analyzing...
                      </>
                    ) : (
                      <><Search size={14} /> Identify Part</>
                    )}
                  </button>
                </div>

                {/* ── Result Card ── */}
                {imageResult && (
                  <div className="mt-10 border border-red-600/40 bg-red-600/5 p-8 animate-in zoom-in-95 duration-300 space-y-8">
                    <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                      <div>
                        <span className="text-[9px] font-bold text-red-600 tracking-[0.2em] uppercase block mb-1">AI Identification — Complete</span>
                        <p className="text-2xl font-black uppercase text-white">{imageResult.partName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {[
                        { label: "Part Name", value: imageResult.partName, icon: <PackageCheck size={13} /> },
                        { label: "Category", value: imageResult.category, icon: <Tag size={13} /> },
                        { label: "Vehicle Model", value: imageResult.vehicleModel || "—", icon: <Car size={13} /> },
                      ].map(({ label, value, icon }) => (
                        <div key={label}>
                          <p className="text-[8px] text-zinc-600 uppercase font-black tracking-[0.2em] mb-1 flex items-center gap-1">{icon} {label}</p>
                          <p className="text-sm font-bold uppercase text-white">{value}</p>
                        </div>
                      ))}
                    </div>

                    {imageResult.description && (
                      <div className="bg-zinc-900/60 border border-zinc-800 p-4">
                        <p className="text-[9px] text-zinc-500 font-mono leading-relaxed">{imageResult.description}</p>
                      </div>
                    )}

                    {/* ── Store Parts — auto-loaded ── */}
                    {hasSearchedImageParts && (
                      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                            <Search size={12} /> Matching Parts in Our Store
                          </h3>
                          {isFetchingImageParts ? (
                            <span className="text-[9px] text-zinc-600 font-mono animate-pulse">Scanning inventory...</span>
                          ) : (
                            <span className="text-[9px] font-mono text-zinc-600">{imageStoreProducts.length} result(s) found</span>
                          )}
                        </div>

                        {isFetchingImageParts ? (
                          <div className="flex items-center gap-3 p-4 border border-zinc-800 bg-zinc-900/40">
                            <span className="flex gap-1">
                              <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">Scanning live inventory...</span>
                          </div>
                        ) : imageStoreProducts.length > 0 ? (
                          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {imageStoreProducts.map((item, idx) => (
                              <a
                                key={idx}
                                href={`/product/${item._id}`}
                                className="bg-zinc-900/60 p-4 border border-zinc-800 flex justify-between items-center group hover:border-red-600/60 transition-all"
                              >
                                <div>
                                  <p className="text-xs font-bold text-white uppercase group-hover:text-red-400 transition-colors">{item.title}</p>
                                  <p className="text-[9px] text-zinc-600 font-mono mt-0.5">
                                    {item.category}{item.vehicleModel ? ` · ${item.vehicleModel}` : ''}
                                  </p>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                  <p className="text-sm font-black text-red-500">LKR {item.price?.toLocaleString()}</p>
                                  <div className={`flex items-center gap-1 text-[8px] font-black uppercase italic mt-1 ${item.status === 'active' ? 'text-green-500' : 'text-zinc-500'}`}>
                                    <PackageCheck size={11} /> {item.condition || 'Available'}
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 border border-red-900/40 bg-red-950/10 text-center">
                            <AlertTriangle size={28} className="text-red-800 mx-auto mb-3" />
                            <p className="text-sm font-black text-red-500 uppercase tracking-wider">
                              No Parts Available
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                              We currently don't have matching parts for{' '}
                              <span className="text-white font-bold">{imageResult.partName}</span> in our store.
                            </p>
                            <a
                              href="/shop"
                              className="inline-block mt-4 px-6 py-2 border border-zinc-700 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:border-red-600 hover:text-red-500 transition-all"
                            >
                              Browse All Parts →
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Market Intelligence ── */}
            {activeTab === "Market Intelligence" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={20} className="text-red-600" />
                  <h2 className="text-2xl font-black uppercase">Smart Pricing</h2>
                </div>
                <p className="text-zinc-500 text-xs mb-8 font-medium italic">
                  // Enter a part name and your price — AI analyzes the Sri Lankan market and tells you if it’s fair
                </p>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={partName}
                    onChange={e => setPartName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !isAnalyzing && handlePriceAnalysis()}
                    placeholder="PART OR ACCESSORY NAME (e.g. Toyota Vitz Brake Pads, LED Headlight Bulb H4)..."
                    className="w-full bg-black border border-zinc-800 p-5 text-sm font-mono text-white focus:border-red-600 outline-none transition-all placeholder:text-zinc-700 placeholder:text-xs"
                  />
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-black">LKR</span>
                      <input
                        type="number"
                        value={partPrice}
                        onChange={e => setPartPrice(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !isAnalyzing && handlePriceAnalysis()}
                        placeholder="Your listed price..."
                        className="w-full bg-black border border-zinc-800 p-5 pl-14 text-base font-mono text-red-500 focus:border-red-600 outline-none transition-all placeholder:text-zinc-700 placeholder:text-xs"
                      />
                    </div>
                    <button
                      onClick={handlePriceAnalysis}
                      disabled={isAnalyzing || !partName.trim() || !partPrice}
                      className="bg-red-600 text-white px-8 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
                    >
                      {isAnalyzing ? (
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                      ) : (
                        <><BarChart3 size={14} /> Analyze</>
                      )}
                    </button>
                  </div>
                </div>

                {analysisError && (
                  <div className="mt-6 p-4 border border-red-900/40 bg-red-950/10 text-red-500 text-xs font-mono">{analysisError}</div>
                )}

                {priceAnalysis && (
                  <div className="mt-10 space-y-6 animate-in zoom-in-95 duration-300">

                    {/* Verdict banner */}
                    {(() => {
                      const v = priceAnalysis.verdict;
                      const config = {
                        FAIR: { bg: 'bg-green-950/30 border-green-700/40', text: 'text-green-400', label: 'Fair Price', icon: <Minus size={20} /> },
                        UNDERPRICED: { bg: 'bg-yellow-950/30 border-yellow-700/40', text: 'text-yellow-400', label: 'Underpriced', icon: <TrendingDown size={20} /> },
                        OVERPRICED: { bg: 'bg-red-950/30 border-red-700/40', text: 'text-red-400', label: 'Overpriced', icon: <TrendingUp size={20} /> },
                      }[v] || { bg: 'bg-zinc-900 border-zinc-700', text: 'text-zinc-400', label: v, icon: <Minus size={20} /> };
                      return (
                        <div className={`p-5 border ${config.bg} flex items-center justify-between`}>
                          <div className="flex items-center gap-3">
                            <span className={config.text}>{config.icon}</span>
                            <div>
                              <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-0.5">Price Verdict</p>
                              <p className={`text-xl font-black uppercase ${config.text}`}>{config.label}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-0.5">Your Price</p>
                            <p className="text-lg font-black text-white">LKR {priceAnalysis.userPrice?.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Price range bar */}
                    <div className="bg-zinc-900/60 border border-zinc-800 p-6 space-y-4">
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Sri Lankan Market Range</p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Market Low</p>
                          <p className="text-lg font-black text-zinc-300">LKR {priceAnalysis.marketLow?.toLocaleString()}</p>
                        </div>
                        <div className="border-x border-zinc-800">
                          <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Average</p>
                          <p className="text-lg font-black text-red-500">LKR {priceAnalysis.marketAverage?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Market High</p>
                          <p className="text-lg font-black text-zinc-300">LKR {priceAnalysis.marketHigh?.toLocaleString()}</p>
                        </div>
                      </div>
                      {/* Visual bar */}
                      <div className="relative h-2 bg-zinc-800 rounded-full mt-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-800 via-yellow-700 to-red-800 rounded-full opacity-60"></div>
                        {(() => {
                          const low = priceAnalysis.marketLow || 0;
                          const high = priceAnalysis.marketHigh || 1;
                          const pct = Math.min(100, Math.max(0, ((priceAnalysis.userPrice - low) / (high - low)) * 100));
                          return <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-red-600 shadow" style={{ left: `calc(${pct}% - 6px)` }}></div>;
                        })()}
                      </div>
                      <p className="text-[8px] text-zinc-600 text-center font-mono">Your price position in market range</p>
                    </div>

                    {/* Recommendation + demand */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-zinc-900/60 border border-zinc-800 p-5">
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-2 flex items-center gap-1"><Tag size={11} /> Recommendation</p>
                        <p className="text-xs text-zinc-300 leading-relaxed font-mono">{priceAnalysis.recommendation}</p>
                      </div>
                      <div className="bg-zinc-900/60 border border-zinc-800 p-5">
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-2">Demand Level</p>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {['LOW', 'MEDIUM', 'HIGH'].map((lvl, i) => (
                              <div key={lvl} className={`h-6 w-5 rounded-sm ${['LOW', 'MEDIUM', 'HIGH'].indexOf(priceAnalysis.demandLevel) >= i
                                ? 'bg-red-600' : 'bg-zinc-800'
                                }`}></div>
                            ))}
                          </div>
                          <span className="text-sm font-black uppercase text-white">{priceAnalysis.demandLevel}</span>
                        </div>
                        {priceAnalysis.category && (
                          <p className="text-[8px] text-zinc-600 mt-2 font-mono">Category: {priceAnalysis.category}</p>
                        )}
                      </div>
                    </div>

                    {/* Market insights */}
                    {priceAnalysis.insights?.length > 0 && (
                      <div className="bg-zinc-900/60 border border-zinc-800 p-5 space-y-3">
                        <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Market Insights</p>
                        {priceAnalysis.insights.map((insight, i) => (
                          <div key={i} className="flex gap-3">
                            <span className="text-red-600 font-black text-xs shrink-0">{String(i + 1).padStart(2, '0')}</span>
                            <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">{insight}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Common brands + seller tip */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {priceAnalysis.commonBrands?.length > 0 && (
                        <div className="bg-zinc-900/60 border border-zinc-800 p-5">
                          <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-3">Common Brands in Market</p>
                          <div className="flex flex-wrap gap-2">
                            {priceAnalysis.commonBrands.map((brand, i) => (
                              <span key={i} className="px-3 py-1 border border-zinc-700 text-[9px] font-black uppercase text-zinc-400">{brand}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {priceAnalysis.tip && (
                        <div className="bg-zinc-900/60 border border-zinc-800 p-5">
                          <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-2 flex items-center gap-1"><Star size={11} /> Seller Tip</p>
                          <p className="text-[11px] text-zinc-300 font-mono leading-relaxed">{priceAnalysis.tip}</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}