import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthGuardModal from './AuthGuardModal';

const Features = () => {
  const navigate = useNavigate();
  const { guardAction, AuthGuardModalProps } = useAuthGuard();

  const tools = [
    {
      title: "VIN Decoder",
      target: "VIN/Chassis Part Identifier",
      desc: "Decode your VIN to get a list of parts that match your vehicle.",
      img: "/vin.jpg"
    },
    {
      title: "Smart Assistant",
      target: "Smart Assistant",
      desc: "Ask AI and find the exact spare you need instantly.",
      img: "/chatbot.jpg"
    },
    {
      title: "Visual Match",
      target: "Part Image Search",
      desc: "Upload an image of your part and AI will identify it.",
      img: "/imageid.jpg"
    },
    {
      title: "Smart Pricing",
      target: "Market Intelligence",
      desc: "AI suggests best prices based on market data.",
      img: "/pricing.jpg"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[2px] w-8 bg-red-600"></div>
            <span className="text-red-600 text-[9px] font-black uppercase tracking-[0.4em]">Intelligent Tools</span>
            <div className="h-[2px] w-8 bg-red-600"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter">
            AI Powered <span className="text-red-600">Tools</span>
          </h2>
          <p className="text-zinc-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            Our intelligent system helps buyers and sellers find the exact spare parts faster 
            using vehicle data, images, and smart pricing insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="group relative h-[420px] overflow-hidden bg-black cursor-pointer"
            >
              <img
                src={tool.img}
                alt={tool.title}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-110 transition-transform duration-700"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x600?text=AI+Tool+Image'; }}
              />

              <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black via-black/60 to-transparent">
                <div className="w-10 h-1 bg-red-600 mb-6 transition-all duration-300 group-hover:w-20"></div>
                <h3 className="text-2xl font-black text-white uppercase mb-3 tracking-tight">
                  {tool.title}
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  {tool.desc}
                </p>
                <button
                  onClick={() => guardAction('use AI tools', () => navigate('/ai-tools', { state: { activeTab: tool.target } }))}
                  className="w-fit text-white text-[10px] font-bold uppercase tracking-[0.2em] border border-white/30 px-4 py-2 hover:bg-red-600 hover:border-red-600 transition-all"
                >
                  Try Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AuthGuardModal {...AuthGuardModalProps} />
    </section>
  );
};

export default Features;
