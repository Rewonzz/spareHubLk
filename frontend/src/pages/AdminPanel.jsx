import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Users, CheckCircle, XCircle, Clock, Eye, LogOut,
  Building, Phone, Mail, MapPin, FileText, ArrowLeft,
  ChevronDown, ChevronUp, RefreshCw, Award, AlertTriangle,
  Package, BarChart3, DollarSign, TrendingUp, ShoppingCart, UserCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getAllApplications, updateApplicationStatus, getProducts } from '../services/api';

const STATUS_COLORS = {
  pending: 'text-yellow-400 border-yellow-500 bg-yellow-500/10',
  approved: 'text-green-400 border-green-500 bg-green-500/10',
  rejected: 'text-red-400 border-red-500 bg-red-500/10',
};

const STATUS_ICONS = {
  pending: <Clock size={14} />,
  approved: <CheckCircle size={14} />,
  rejected: <XCircle size={14} />,
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [successMsg, setSuccessMsg] = useState('');

  // Only admins can see this
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black uppercase mb-2">Access Denied</h2>
          <p className="text-zinc-400 text-sm mb-6">This page is restricted to administrators only.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-red-600 font-black uppercase text-sm hover:bg-red-500 transition-all">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllApplications();
      setApplications(data);
    } catch (err) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatus = async (id, status) => {
    setProcessingId(id);
    try {
      await updateApplicationStatus(id, status);
      setApplications(prev =>
        prev.map(app => app._id === id ? { ...app, status } : app)
      );
      setSuccessMsg(`Application ${status} successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 pb-16 max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-l-4 border-red-600 pl-6">
          <div>
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-1">Admin Panel</p>
            <h1 className="text-3xl font-black uppercase tracking-tighter">PRO Applications</h1>
            <p className="text-zinc-500 text-xs mt-1">{counts.all} total applications</p>
          </div>
          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-black uppercase transition-all"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Success / Error */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 text-green-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle size={14} /> {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-0 mb-6 border-b border-zinc-900">
          {[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'pending', label: 'Pending', count: counts.pending },
            { key: 'approved', label: 'Approved', count: counts.approved },
            { key: 'rejected', label: 'Rejected', count: counts.rejected },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                filter === tab.key ? 'border-red-600 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label} <span className="ml-1 text-zinc-600">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending Review', value: counts.pending, icon: <Clock size={16} />, color: 'text-yellow-400', border: 'border-yellow-500/30' },
            { label: 'Approved', value: counts.approved, icon: <CheckCircle size={16} />, color: 'text-green-400', border: 'border-green-500/30' },
            { label: 'Rejected', value: counts.rejected, icon: <XCircle size={16} />, color: 'text-red-400', border: 'border-red-500/30' },
          ].map((s, i) => (
            <div key={i} className={`bg-zinc-950 border ${s.border} p-5`}>
              <div className={`${s.color} mb-2`}>{s.icon}</div>
              <p className="text-[9px] uppercase font-black text-zinc-500">{s.label}</p>
              <p className="text-2xl font-black">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Applications List */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw size={24} className="text-zinc-600 mx-auto mb-3 animate-spin" />
            <p className="text-zinc-500 text-xs uppercase font-bold">Loading applications...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 border border-zinc-900 bg-zinc-950">
            <Users size={36} className="text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-xs uppercase font-bold">No {filter === 'all' ? '' : filter} applications found.</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((app) => {
            const isExpanded = expandedId === app._id;
            const isProcessing = processingId === app._id;
            return (
              <div key={app._id} className={`bg-zinc-950 border transition-all ${
                app.status === 'pending' ? 'border-yellow-500/20' :
                app.status === 'approved' ? 'border-green-500/20' : 'border-red-500/20'
              }`}>
                {/* Card Header */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-zinc-900/50 transition-all"
                  onClick={() => setExpandedId(isExpanded ? null : app._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Building size={16} className="text-zinc-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase">{app.businessName}</h4>
                      <p className="text-[10px] text-zinc-500 uppercase">
                        {app.businessType?.replace('_', ' ')} · {app.city}
                      </p>
                      <p className="text-[9px] text-zinc-700 mt-0.5">
                        Submitted: {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 border text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[app.status]}`}>
                      {STATUS_ICONS[app.status]} {app.status}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-zinc-900 p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Application Details */}
                      <div className="space-y-3">
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Application Details</h5>
                        {[
                          { icon: <Users size={12} />, label: 'Full Name', value: app.fullName },
                          { icon: <FileText size={12} />, label: 'NIC / Passport', value: app.nicNumber },
                          { icon: <Phone size={12} />, label: 'Mobile', value: app.mobileNumber },
                          { icon: <Mail size={12} />, label: 'Email', value: app.email },
                          { icon: <MapPin size={12} />, label: 'Business Address', value: app.businessAddress },
                          { icon: <Building size={12} />, label: 'City', value: app.city },
                          { icon: <Award size={12} />, label: 'Business Type', value: app.businessType?.replace('_', ' ') },
                        ].map(({ icon, label, value }) => (
                          <div key={label} className="flex items-start gap-3">
                            <span className="text-zinc-600 mt-0.5">{icon}</span>
                            <div>
                              <p className="text-[8px] font-black uppercase text-zinc-600">{label}</p>
                              <p className="text-xs text-zinc-300 capitalize">{value || '—'}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right: Account + NIC Images */}
                      <div className="space-y-4">
                        {app.userId && (
                          <div className="bg-zinc-900 border border-zinc-800 p-4">
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Registered Account</h5>
                            <p className="text-sm font-bold">{app.userId.name}</p>
                            <p className="text-xs text-zinc-400">{app.userId.email}</p>
                            <p className="text-xs text-zinc-400">{app.userId.phone}</p>
                            <p className="text-[9px] text-zinc-600 mt-1">{app.userId.location}</p>
                          </div>
                        )}

                        {/* NIC Images */}
                        {(app.nicFront || app.nicBack) && (
                          <div>
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Identity Documents</h5>
                            <div className="grid grid-cols-2 gap-3">
                              {app.nicFront && (
                                <div>
                                  <p className="text-[8px] uppercase font-black text-zinc-600 mb-1">Front</p>
                                  <img
                                    src={app.nicFront}
                                    alt="NIC Front"
                                    className="w-full h-28 object-cover border border-zinc-800"
                                  />
                                </div>
                              )}
                              {app.nicBack && (
                                <div>
                                  <p className="text-[8px] uppercase font-black text-zinc-600 mb-1">Back</p>
                                  <img
                                    src={app.nicBack}
                                    alt="NIC Back"
                                    className="w-full h-28 object-cover border border-zinc-800"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {app.status === 'pending' && (
                      <div className="flex gap-3 mt-6 pt-5 border-t border-zinc-900">
                        <button
                          onClick={() => handleStatus(app._id, 'approved')}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          <CheckCircle size={14} />
                          {isProcessing ? 'Processing...' : 'Approve Application'}
                        </button>
                        <button
                          onClick={() => handleStatus(app._id, 'rejected')}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          <XCircle size={14} />
                          {isProcessing ? 'Processing...' : 'Reject Application'}
                        </button>
                      </div>
                    )}

                    {app.status !== 'pending' && (
                      <div className="flex gap-3 mt-6 pt-5 border-t border-zinc-900">
                        {app.status === 'approved' && (
                          <button
                            onClick={() => handleStatus(app._id, 'rejected')}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-5 py-2 bg-red-600/20 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            <XCircle size={12} /> Revoke PRO
                          </button>
                        )}
                        {app.status === 'rejected' && (
                          <button
                            onClick={() => handleStatus(app._id, 'approved')}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-5 py-2 bg-green-600/20 border border-green-600 text-green-400 hover:bg-green-600 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            <CheckCircle size={12} /> Re-approve
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
