import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ShieldCheck, TrendingUp, Headphones, ArrowRight, Clock, CheckCircle, Sparkles, Store, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthGuardModal from './AuthGuardModal';

const benefits = [
  { icon: <ShieldCheck size={20} />, text: 'Verified seller badge' },
  { icon: <TrendingUp size={20} />, text: 'Priority in search results' },
  { icon: <Headphones size={20} />, text: 'Dedicated support' },
  { icon: <Award size={20} />, text: 'Featured shop placement' },
];

export default function ProPromoSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { guardAction, AuthGuardModalProps } = useAuthGuard();

  const isApprovedPro = user?.isPremium && user?.premiumStatus === 'approved';
  const isPending = user?.premiumStatus === 'pending';
  const isRejected = user?.premiumStatus === 'rejected';

  // ── APPROVED PRO USERS: Show "Visit Your Shop" ──
  if (isApprovedPro) {
    return (
      <section className="relative w-full overflow-hidden border-y border-green-900/40">
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/30 via-zinc-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-600/5 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                <CheckCircle size={12} /> Verified PRO
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
                Your <span className="text-green-500">Shop.</span>
              </h2>
              <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                You are a verified SpareHub PRO seller. Manage your inventory, customize your shop, and reach more buyers.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/pro-dashboard')}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black uppercase text-sm tracking-widest transition-all duration-300"
                >
                  <Store size={16} />
                  Visit Your Shop
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/post-ad')}
                  className="inline-flex items-center gap-2 px-8 py-4 border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-white font-black uppercase text-sm tracking-widest transition-all"
                >
                  <TrendingUp size={16} /> List New Product
                </button>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="relative bg-black/50 backdrop-blur-sm border border-green-500/20 p-8 md:p-10">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-600 flex items-center justify-center">
                      <Store size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase text-white">PRO Dashboard</h3>
                      <p className="text-[10px] text-green-400 font-black uppercase tracking-widest">Everything you need to sell</p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    {[
                      'Manage your product listings',
                      'Customize shop banner & avatar',
                      'Track views and performance',
                      'Respond to buyer inquiries',
                      'Get featured on Best Sellers',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-zinc-200">
                        <CheckCircle size={14} className="text-green-400 shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-zinc-700">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                      Your shop is live · Buyers can view your products now
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── PENDING USERS: Show "Waiting for Approval" ──
  if (isPending) {
    return (
      <section className="relative w-full overflow-hidden border-y border-yellow-900/40">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-950/20 via-zinc-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-600/5 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                <Clock size={12} /> Application Submitted
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
                Waiting for <span className="text-yellow-500">Approval.</span>
              </h2>
              <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                Your PRO seller application has been submitted and is currently under admin review. We will notify you once it is approved.
              </p>

              <div className="inline-flex items-center gap-2 px-6 py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-black uppercase tracking-widest">
                <Clock size={16} className="animate-pulse" />
                Under Review — Please Check Back Soon
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="relative bg-black/50 backdrop-blur-sm border border-yellow-500/20 p-8 md:p-10">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-yellow-600 flex items-center justify-center">
                      <Clock size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase text-white">Application Status</h3>
                      <p className="text-[10px] text-yellow-400 font-black uppercase tracking-widest">Pending Admin Review</p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    {[
                      'Application submitted successfully',
                      'Admin is reviewing your documents',
                      'Approval typically takes 1-2 business days',
                      'You will be notified via email',
                      'Once approved, your shop goes live instantly',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-zinc-200">
                        <CheckCircle size={14} className="text-yellow-400 shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-zinc-700">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                      Free application · No upfront cost · Cancel anytime before approval
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── REJECTED USERS: Show "Re-Apply" message ──
  if (isRejected) {
    return (
      <section className="relative w-full overflow-hidden border-y border-red-900/40">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-zinc-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600/5 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                <AlertTriangle size={12} /> Application Not Approved
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
                Try <span className="text-red-500">Again.</span>
              </h2>
              <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                Your previous PRO application was not approved. You can re-apply with updated or corrected information.
              </p>

              <button
                onClick={() => navigate('/apply-pro')}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-sm tracking-widest transition-all duration-300"
              >
                Re-Apply for PRO
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="relative bg-black/50 backdrop-blur-sm border border-red-500/20 p-8 md:p-10">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-600 flex items-center justify-center">
                      <AlertTriangle size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase text-white">Re-Apply</h3>
                      <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">Update your information</p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    {[
                      'Review and update your business details',
                      'Ensure all documents are clear and valid',
                      'Provide accurate contact information',
                      'Double-check your business type selection',
                      'Re-submit for admin review',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-zinc-200">
                        <CheckCircle size={14} className="text-red-400 shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AuthGuardModal {...AuthGuardModalProps} />
      </section>
    );
  }

  // ── DEFAULT: Non-PRO users — show the promo ──
  const handleApply = () => {
    guardAction('apply for PRO seller status', () => navigate('/apply-pro'));
  };

  return (
    <section className="relative w-full overflow-hidden border-y border-blue-900/50">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/40 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left: Content */}
          <div className="lg:w-1/2 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              <Sparkles size={12} /> For Sellers
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
              Go <span className="text-blue-500">PRO.</span>
            </h2>
            <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              Join Sri Lanka's most trusted network of verified auto parts sellers.
              Get exclusive visibility, wholesale tools, and direct access to serious buyers.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3 text-zinc-200">
                  <span className="text-blue-400">{b.icon}</span>
                  <span className="text-sm font-medium">{b.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleApply}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-sm tracking-widest transition-all duration-300"
            >
              Apply for PRO
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right: Visual Card */}
          <div className="lg:w-1/2 w-full">
            <div className="relative bg-black/50 backdrop-blur-sm border border-blue-500/20 p-8 md:p-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-600 flex items-center justify-center">
                    <Award size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-white">SpareHub PRO</h3>
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Verified Seller Program</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {[
                    'Custom branded shop page',
                    'Upload banner & profile images',
                    'Featured on homepage Best Sellers',
                    'Bulk listing tools',
                    'Priority customer support',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-zinc-200">
                      <CheckCircle size={14} className="text-blue-400 shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-zinc-700">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                    Free to apply · Admin reviewed · Instant approval for verified businesses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthGuardModal {...AuthGuardModalProps} />
    </section>
  );
}
