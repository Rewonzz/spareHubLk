import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Mail, User, Lock, MapPin, CheckCircle2, LayoutDashboard, Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Registration() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    sector: 'Colombo',
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleEnrollment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await registerUser(form);
      login(data.token, data.user);
      setRegisteredUser(data.user);
      setShowSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black text-white flex items-center justify-center p-6 pt-20 relative overflow-hidden">

      {/* SUCCESS MODAL OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-red-600 p-8 text-center relative shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-zinc-950 border border-red-600 flex items-center justify-center text-red-600 shadow-xl">
              <CheckCircle2 size={40} className="animate-bounce" />
            </div>

            <h2 className="text-2xl font-black uppercase tracking-tighter mt-8 mb-2">Identity Verified</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mb-8 text-center">Pilot Uplink Established Successfully</p>

            <div className="bg-zinc-900 border border-zinc-800 p-4 mb-8 text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 border border-red-600 p-0.5 bg-black">
                  <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${registeredUser?.username}`} alt="Pilot" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-white tracking-widest">Pilot_Callsign</p>
                  <p className="text-[11px] font-black uppercase text-red-600 tracking-tighter italic">{registeredUser?.username}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/shop')}
              className="w-full bg-red-600 py-4 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
            >
              Browse The Shop <Eye size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ENROLLMENT FORM */}
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 p-10 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/10 border border-red-600 text-red-600 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Pilot Enrollment</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em]">Establish your SpareHub identity</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-600/50 text-red-400 text-[10px] font-bold uppercase tracking-widest p-4 flex items-center gap-2">
            <span className="text-red-600">⚠</span> {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleEnrollment}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                <User size={12} className="text-red-600" /> Callsign
              </label>
              <input
                required
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="STIG_01"
                className="w-full bg-zinc-900 border border-zinc-800 p-4 text-xs uppercase font-bold focus:border-red-600 focus:bg-black outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                <Mail size={12} className="text-red-600" /> Communications
              </label>
              <input
                required
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="PILOT@SPAREHUB.LK"
                className="w-full bg-zinc-900 border border-zinc-800 p-4 text-xs uppercase font-bold focus:border-red-600 focus:bg-black outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
              <Lock size={12} className="text-red-600" /> Access Key
            </label>
            <div className="relative">
              <input
                required
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-zinc-900 border border-zinc-800 p-4 text-xs font-bold focus:border-red-600 focus:bg-black outline-none transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
              <MapPin size={12} className="text-red-600" /> Sector
            </label>
            <select
              name="sector"
              value={form.sector}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 p-4 text-xs uppercase font-bold focus:border-red-600 outline-none transition-all cursor-pointer appearance-none"
            >
              <option>Colombo</option>
              <option>Kandy</option>
              <option>Gampaha</option>
              <option>Kalutara</option>
              <option>Matara</option>
              <option>Galle</option>
              <option>Jaffna</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 py-5 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : <>Complete Enrollment <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}