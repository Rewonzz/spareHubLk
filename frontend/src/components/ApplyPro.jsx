import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle, Shield, Truck, FileText, Phone, Mail, User, MapPin, Building, Globe, X, Check } from 'lucide-react';
import { applyPro } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ApplyPro() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already premium/approved
  useEffect(() => {
    if (user?.isPremium && user?.premiumStatus === 'approved') {
      navigate('/pro-dashboard');
    }
  }, [user, navigate]);

  if (!user || (user?.isPremium && user?.premiumStatus === 'approved')) {
    return null;
  }
  const [formData, setFormData] = useState({
    businessName: '',
    fullName: '',
    nicNumber: '',
    nicFront: '',
    nicBack: '',
    mobile: '',
    email: '',
    businessAddress: '',
    city: '',
    businessType: '',
    agreeTerms: false,
  });
  const [files, setFiles] = useState({ nicFront: null, nicBack: null });

  const features = [
    { icon: <Shield size={24} />, title: "Verified Authenticity", desc: "Every part verified by our QA team" },
    { icon: <Truck size={24} />, title: "Bulk Shipping", desc: "Priority logistics for large orders" },
    { icon: <Award size={24} />, title: "Direct OEM Access", desc: "Factory direct pricing" },
    { icon: <FileText size={24} />, title: "Invoice & Tax Docs", desc: "Full legal documentation" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [side]: reader.result }));
        setFiles(prev => ({ ...prev, [side]: file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.nicNumber || !formData.businessAddress || !formData.city || !formData.businessType) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await applyPro({
        businessName: formData.businessName,
        fullName: formData.fullName,
        nicNumber: formData.nicNumber,
        nicFront: formData.nicFront,
        nicBack: formData.nicBack,
        mobileNumber: formData.mobile,
        email: formData.email,
        businessAddress: formData.businessAddress,
        city: formData.city,
        businessType: formData.businessType,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-blue-500/20 border-2 border-blue-500 rounded-full">
            <Check size={40} className="text-blue-500" />
          </div>
          <h2 className="text-3xl font-black uppercase mb-4">Application Submitted</h2>
          <p className="text-zinc-400 mb-8">
            Your PRO application has been submitted successfully. 
            We will review your documents and get back to you within 2-3 business days.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-5 bg-blue-500 hover:bg-blue-400 transition-all duration-300 font-black uppercase text-sm tracking-widest text-black"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="relative max-w-4xl mx-auto px-6 py-12">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-bold uppercase tracking-widest">Back</span>
          </button>

          <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-blue-500/30 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Award size={40} className="text-blue-500" />
                <div>
                  <span className="text-blue-500 text-xs font-black uppercase tracking-widest">SPAREHUBLK PRO</span>
                  <h1 className="text-3xl md:text-4xl font-black uppercase">Application</h1>
                </div>
              </div>

              <p className="text-zinc-400 text-lg mb-8 max-w-2xl">
                Join our exclusive network of verified manufacturers and wholesale sellers. 
                Get access to OEM parts at factory rates with priority support.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-zinc-950/50 border border-zinc-800">
                    <div className="text-blue-500">{feature.icon}</div>
                    <div>
                      <h3 className="font-black uppercase text-sm text-white">{feature.title}</h3>
                      <p className="text-xs text-zinc-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-8 p-4 bg-zinc-950/30 border border-zinc-800">
                <input 
                  type="checkbox" 
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-5 h-5 accent-blue-500"
                />
                <label className="text-sm text-zinc-400">
                  Do not show this page again
                </label>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-5 bg-blue-500 hover:bg-blue-400 transition-all duration-300 font-black uppercase text-sm tracking-widest text-black"
              >
                Continue to Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button 
          onClick={() => setStep(1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-bold uppercase tracking-widest">Back</span>
        </button>

        <div className="bg-zinc-900 border border-zinc-800 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-500/20 border border-blue-500">
              <FileText size={24} className="text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase">Seller Information</h1>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">PRO Application</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Business Name / Company *</label>
              <div className="relative">
                <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Enter business name"
                  className="w-full bg-zinc-950 border border-zinc-800 pl-12 pr-4 py-4 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="w-full bg-zinc-950 border border-zinc-800 pl-12 pr-4 py-4 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">NIC / Passport Number *</label>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  name="nicNumber"
                  value={formData.nicNumber}
                  onChange={handleInputChange}
                  placeholder="NIC or Passport number"
                  className="w-full bg-zinc-950 border border-zinc-800 pl-12 pr-4 py-4 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Upload NIC / Passport *</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="border-2 border-dashed border-zinc-700 hover:border-blue-500 transition-colors p-6 flex flex-col items-center justify-center text-center bg-zinc-950/50 cursor-pointer">
                    {formData.nicFront ? (
                      <>
                        <Check size={24} className="text-green-500 mb-2" />
                        <span className="text-xs text-green-500 uppercase tracking-widest">Uploaded</span>
                      </>
                    ) : (
                      <>
                        <FileText size={24} className="text-zinc-500 mb-2" />
                        <span className="text-xs text-zinc-500 uppercase tracking-widest">Front Side</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'nicFront')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="relative">
                  <div className="border-2 border-dashed border-zinc-700 hover:border-blue-500 transition-colors p-6 flex flex-col items-center justify-center text-center bg-zinc-950/50 cursor-pointer">
                    {formData.nicBack ? (
                      <>
                        <Check size={24} className="text-green-500 mb-2" />
                        <span className="text-xs text-green-500 uppercase tracking-widest">Uploaded</span>
                      </>
                    ) : (
                      <>
                        <FileText size={24} className="text-zinc-500 mb-2" />
                        <span className="text-xs text-zinc-500 uppercase tracking-widest">Back Side</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'nicBack')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Mobile Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="tel" 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="+94 7X XXX XXXX"
                  className="w-full bg-zinc-950 border border-zinc-800 pl-12 pr-4 py-4 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 pl-12 pr-4 py-4 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Business Address *</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-4 text-zinc-500" />
                <textarea 
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  placeholder="Enter complete business address"
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 pl-12 pr-4 py-4 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">City *</label>
              <div className="relative">
                <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full bg-zinc-950 border border-zinc-800 pl-12 pr-4 py-4 text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Business Type *</label>
              <select 
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="">Select business type</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="distributor">Distributor</option>
                <option value="authorized_seller">Authorized Seller</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-3 p-4 bg-zinc-950/30 border border-zinc-800">
                <input 
                  type="checkbox" 
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                  className="w-5 h-5 accent-blue-500" 
                />
                <label className="text-sm text-zinc-400">
                  I agree to the terms and conditions and verification process
                </label>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading || !formData.agreeTerms}
            className="w-full mt-6 py-5 bg-blue-500 hover:bg-blue-400 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-all duration-300 font-black uppercase text-sm tracking-widest text-black"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
}