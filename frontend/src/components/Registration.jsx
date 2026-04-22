import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, Mail, Lock, MapPin, User, Phone, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { registerUser, loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CITIES = [
    'Colombo', 'Kandy', 'Gampaha', 'Kalutara', 'Matara', 'Galle', 'Jaffna', 
    'Anuradhapura', 'Polonnaruwa', 'Trincomalee', 'Batticaloa', 
    'Ratnapura', 'Kegalle', 'Puttalam', 'Badulla', 'Moneragala', 'Hambantota'
];

export default function Registration() {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        emailOrUsername: '',
        password: '',
        location: 'Colombo',
    });

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        if (location.state?.message) {
            setSessionExpired(true);
            setIsLoginMode(true);
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const cleaned = value.replace(/\D/g, '');
            setForm({ ...form, [name]: cleaned });
        } else {
            setForm({ ...form, [name]: value });
        }
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await loginUser({ emailOrUsername: form.emailOrUsername, password: form.password });
            login(data.token, data.user);
            navigate('/post-ad');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (form.password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (form.phone.length !== 10) {
            setError('Phone number must be 10 digits');
            setLoading(false);
            return;
        }

        try {
            const data = await registerUser(form);
            login(data.token, data.user);
            setShowSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-black text-white flex items-center justify-center p-6 pt-20">
            {/* SUCCESS MODAL */}
            {showSuccess && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-zinc-950 border border-red-600 p-8 text-center relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-zinc-950 border border-red-600 flex items-center justify-center text-red-600">
                            <CheckCircle size={40} />
                        </div>

                        <h2 className="text-2xl font-black uppercase tracking-tighter mt-8 mb-2">Welcome!</h2>
                        <p className="text-sm text-zinc-400 mb-6">Your account has been created successfully</p>

                        <button
                            onClick={() => navigate('/post-ad')}
                            className="w-full bg-red-600 py-4 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all"
                        >
                            Start Advertising
                        </button>
                    </div>
                </div>
            )}

            {/* MAIN FORM */}
            <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 p-10 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/10 border border-red-600 text-red-600 mb-4">
                        <Car size={32} />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                        {isLoginMode ? 'Welcome Back' : 'Create Free Account'}
                    </h2>
                    <p className="text-sm text-zinc-500">
                        {isLoginMode ? 'Log in to manage your listings' : 'Advertise your vehicle free on Sri Lanka\'s largest marketplace'}
                    </p>
                </div>

                {sessionExpired && (
                    <div className="mb-6 bg-yellow-900/20 border border-yellow-600/50 text-yellow-400 text-sm p-4">
                        Session expired. Please log in again.
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-900/20 border border-red-600/50 text-red-400 text-sm p-4">
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={isLoginMode ? handleLogin : handleRegister}>
                    {!isLoginMode && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                    <User size={16} className="text-red-600" /> Name *
                                </label>
                                <input
                                    required
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    className="w-full bg-zinc-900 border border-zinc-800 p-4 text-sm focus:border-red-600 focus:bg-black outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                    <Phone size={16} className="text-red-600" /> Phone Number *
                                </label>
                                <input
                                    required
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="07xxxxxxxx (10 digits)"
                                    maxLength={10}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-4 text-sm focus:border-red-600 focus:bg-black outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                    <Mail size={16} className="text-red-600" /> Email *
                                </label>
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    className="w-full bg-zinc-900 border border-zinc-800 p-4 text-sm focus:border-red-600 focus:bg-black outline-none transition-all"
                                />
                            </div>
                        </>
                    )}

                    {isLoginMode && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                <User size={16} className="text-red-600" /> Username or Email *
                            </label>
                            <input
                                required
                                name="emailOrUsername"
                                type="text"
                                value={form.emailOrUsername}
                                onChange={handleChange}
                                placeholder="Enter username or email"
                                className="w-full bg-zinc-900 border border-zinc-800 p-4 text-sm focus:border-red-600 focus:bg-black outline-none transition-all"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                            <Lock size={16} className="text-red-600" /> Password *
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
                                className="w-full bg-zinc-900 border border-zinc-800 p-4 text-sm focus:border-red-600 focus:bg-black outline-none transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {!isLoginMode && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                <Lock size={16} className="text-red-600" /> Re-enter Password *
                            </label>
                            <input
                                required
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                minLength={6}
                                className="w-full bg-zinc-900 border border-zinc-800 p-4 text-sm focus:border-red-600 focus:bg-black outline-none transition-all"
                            />
                        </div>
                    )}

                    {!isLoginMode && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                <MapPin size={16} className="text-red-600" /> City *
                            </label>
                            <select
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-800 p-4 text-sm focus:border-red-600 outline-none transition-all cursor-pointer"
                            >
                                <option value="">Select City</option>
                                {CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 py-5 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : isLoginMode ? 'Log In' : 'Create Free Account'}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                            className="text-sm text-zinc-500 hover:text-red-600 transition-colors"
                        >
                            {isLoginMode ? "Don't have an account? Register here" : "Already a member? Log in here"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}