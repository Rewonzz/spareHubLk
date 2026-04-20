import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Scan, MessageSquare, Image, BarChart3, ChevronRight, Cpu, PackageCheck, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';

// Note: mockInventory is now only a fallback. The app will primarily use your MongoDB.
const mockInventory = [
  { model: "VITZ", part: "ABS Pump", stock: 2, price: "95,000 LKR", status: "In Stock" },
];

export default function AiTools() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Asset Validation");
  
  const [vin, setVin] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [foundStock, setFoundStock] = useState([]);
  const [hasCheckedStock, setHasCheckedStock] = useState(false);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // NEW: Connected to your Local Node.js Backend
  const handleVinScan = async () => {
    // Sri Lankan Chassis codes are often shorter (e.g., KSP130-XXXXXX)
    if (vin.length < 6) return alert("CRITICAL: Prefix too short. Enter at least 6 characters (e.g., KSP130)");
    
    setIsLoading(true);
    setVehicleData(null);
    setFoundStock([]); 
    setHasCheckedStock(false);
    
    try {
      // Calling your local MongoDB via the Vite Proxy
      const prefix = vin.substring(0, 6).toUpperCase();
      const response = await fetch(`/api/vehicle/${prefix}`);
      
      if (response.ok) {
        const data = await response.json();
        // Mapping your MongoDB fields to your existing UI labels
        setVehicleData({
          make: data.make,
          model: data.model,
          year: data.year || "N/A",
          type: data.category || "JDM Import",
          engine: data.engine,
          dbParts: data.parts // Store parts found in DB for later use
        });
      } else {
        alert("DIAGNOSTIC_ERROR: Prefix not found in Local Registry.");
      }
    } catch (error) {
      console.error("DIAGNOSTIC_FAILURE:", error);
      alert("SERVER_OFFLINE: Ensure your backend terminal is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Cross-references real parts from your MongoDB
  const checkStoreAvailability = () => {
    if (!vehicleData) return;
    
    // If the database has a parts list, use it. Otherwise, fallback to mock.
    if (vehicleData.dbParts && vehicleData.dbParts.length > 0) {
      // Map DB fields (partName/priceLKR) to your UI fields (part/price)
      const formattedParts = vehicleData.dbParts.map(p => ({
        part: p.name || p.partName,
        price: p.price || p.priceLKR,
        stock: p.stock
      }));
      setFoundStock(formattedParts);
    } else {
      const matches = mockInventory.filter(item => 
        item.model.toUpperCase() === vehicleData.model.toUpperCase()
      );
      setFoundStock(matches);
    }
    
    setHasCheckedStock(true);
  };

  const tabs = [
    { name: "Asset Validation", icon: <Scan size={18} /> },
    { name: "Ops Copilot", icon: <MessageSquare size={18} /> },
    { name: "QC Vision", icon: <Image size={18} /> },
    { name: "Market Intelligence", icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="text-red-600" size={20} />
            <span className="text-red-600 font-black text-[10px] tracking-[0.3em] uppercase italic">Supervisor_Auth_Level_01</span>
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">Command <span className="text-red-600">Console</span></h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-1 border-y border-zinc-900 bg-zinc-900/20">
          <div className="lg:w-64 border-r border-zinc-900">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`w-full flex items-center gap-4 px-6 py-6 text-[10px] font-black uppercase tracking-widest transition-all border-b border-zinc-900/50 ${
                  activeTab === tab.name ? "bg-red-600 text-white" : "hover:bg-zinc-800 text-zinc-500"
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>

          <div className="flex-1 p-8 lg:p-12 min-h-[500px] bg-zinc-950/50 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>

            {activeTab === "Asset Validation" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-2xl font-black uppercase mb-2">Inventory Validation</h2>
                <p className="text-zinc-500 text-xs mb-8 font-medium italic">// Verify vehicle authenticity and check local store availability</p>
                <div className="space-y-6">
                  <input 
                    type="text" 
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="ENTER CHASSIS PREFIX (e.g. KSP130)..." 
                    className="w-full bg-black border border-zinc-800 p-6 text-xl font-mono text-red-600 focus:border-red-600 outline-none uppercase transition-all"
                  />
                  <button 
                    onClick={handleVinScan}
                    disabled={isLoading}
                    className="bg-white text-black px-10 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    {isLoading ? "QUERYING LOCAL DATABASE..." : "Run Diagnostic"}
                  </button>

                  {vehicleData && vehicleData.make && (
                    <div className="mt-12 border border-red-600/30 bg-red-600/5 p-8 animate-in zoom-in-95 duration-300">
                       <div className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-4">
                          <span className="text-[10px] font-bold text-red-600 tracking-tighter uppercase italic">Diagnostic Result: Validated</span>
                          <span className="text-[10px] text-zinc-600 font-mono uppercase">{vin}</span>
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-white">
                          <div>
                            <p className="text-[8px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1">Manufacturer</p>
                            <p className="text-xl font-black uppercase">{vehicleData.make}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1">Model Line</p>
                            <p className="text-xl font-black uppercase">{vehicleData.model}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1">Engine Code</p>
                            <p className="text-xl font-black uppercase">{vehicleData.engine}</p>
                          </div>
                       </div>

                       {!hasCheckedStock ? (
                         <button 
                            onClick={checkStoreAvailability}
                            className="mt-10 w-full border border-zinc-800 py-3 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                         >
                            Cross-Reference Stock Availability <ChevronRight size={14} />
                         </button>
                       ) : (
                         <div className="mt-10 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-4 tracking-widest">Inventory Matches:</h3>
                            {foundStock.length > 0 ? (
                               <div className="space-y-2">
                                  {foundStock.map((item, idx) => (
                                    <div key={idx} className="bg-zinc-900/50 p-4 border border-zinc-800 flex justify-between items-center group hover:border-red-600/50 transition-all">
                                      <div>
                                        <p className="text-xs font-bold text-white uppercase">{item.part}</p>
                                        <p className="text-[9px] text-zinc-500 font-mono">{item.price}</p>
                                      </div>
                                      <div className="text-right">
                                        <div className={`flex items-center gap-1 text-[9px] font-black uppercase italic ${item.stock > 0 ? 'text-green-500' : 'text-red-600'}`}>
                                          <PackageCheck size={12} /> {item.stock} UNITS
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                               </div>
                            ) : (
                               <div className="p-6 border border-dashed border-zinc-800 text-center">
                                  <AlertTriangle size={24} className="text-zinc-700 mx-auto mb-2" />
                                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">No compatible parts found in local store</p>
                               </div>
                            )}
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "QC Vision" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-2xl font-black uppercase mb-2">Quality Control Vision</h2>
                <p className="text-zinc-500 text-xs mb-8 font-medium italic">// Visual pattern-matching to detect part counterfeit risks</p>
                <div className="border-2 border-dashed border-zinc-800 h-64 flex flex-col items-center justify-center group hover:border-red-600 cursor-pointer transition-all">
                  <Image size={40} className="text-zinc-700 group-hover:text-red-600 mb-4" />
                  <span className="text-[10px] font-black uppercase text-zinc-500">Initialize Visual Scan</span>
                </div>
              </div>
            )}

            {activeTab === "Ops Copilot" && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-2xl font-black uppercase mb-2">Operations Copilot</h2>
                <div className="flex-1 bg-black border border-zinc-900 p-4 mb-4 text-[11px] font-mono text-zinc-600 overflow-y-auto">
                  [SYSTEM]: Supervisor Authorized...<br/>
                  [USER]: Generate revenue report for Toyota spare parts...<br/>
                  [SYSTEM]: Analyzing fiscal year data...
                </div>
                <div className="relative">
                  <input type="text" placeholder="SEND COMMAND..." className="w-full bg-zinc-900 border-none p-5 text-xs font-bold focus:ring-1 ring-red-600 outline-none uppercase" />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600"><ChevronRight /></button>
                </div>
              </div>
            )}

            {activeTab === "Market Intelligence" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-2xl font-black uppercase mb-2">Market Intelligence</h2>
                <p className="text-zinc-500 text-xs mb-8 font-medium italic">// Global price benchmarking and local market telemetry</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black p-6 border border-zinc-900">
                    <span className="text-[8px] font-black text-zinc-600 block mb-2 uppercase tracking-widest">Target Stock</span>
                    <input type="text" placeholder="Component ID..." className="bg-transparent border-b border-zinc-800 w-full outline-none text-sm font-bold pb-2 uppercase" />
                  </div>
                  <div className="bg-black p-6 border border-zinc-900">
                    <span className="text-[8px] font-black text-zinc-600 block mb-2 uppercase tracking-widest">Base Valuation (LKR)</span>
                    <input type="number" placeholder="0.00" className="bg-transparent border-b border-zinc-800 w-full outline-none text-sm font-bold pb-2" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}