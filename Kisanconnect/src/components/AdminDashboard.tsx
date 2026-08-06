import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Users, 
  RefreshCw, 
  ArrowLeft, 
  Search, 
  Filter, 
  Tractor, 
  Phone, 
  MapPin, 
  Check, 
  X,
  AlertCircle,
  Tag
} from 'lucide-react';

export interface AdminListing {
  id: string;
  rawId: number;
  kind: 'equipment' | 'request';
  type: 'Have' | 'Need';
  title: string;
  category: string;
  ownerName: string;
  ownerPhone: string;
  village: string;
  district: string;
  rate: number;
  unitType: string;
  status: 'Open' | 'Resolved';
  createdAt: string;
}

export interface AdminMetrics {
  totalActiveListings: number;
  totalResolvedRequests: number;
  totalUsers: number;
}

interface Props {
  onGoBack: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onGoBack }) => {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalActiveListings: 0,
    totalResolvedRequests: 0,
    totalUsers: 0,
  });

  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Have' | 'Need'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'Resolved'>('All');

  // Updating status state
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, listingsRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/listings'),
      ]);

      if (!metricsRes.ok || !listingsRes.ok) {
        throw new Error('Failed to load admin panel data');
      }

      const metricsData = await metricsRes.json();
      const listingsData = await listingsRes.json();

      setMetrics(metricsData);
      setListings(listingsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle status handler
  const handleToggleStatus = async (item: AdminListing) => {
    const newStatus: 'Open' | 'Resolved' = item.status === 'Open' ? 'Resolved' : 'Open';
    
    setUpdatingId(item.id);

    // Optimistic update
    setListings(prev =>
      prev.map(l => (l.id === item.id ? { ...l, status: newStatus } : l))
    );

    // Update metrics optimistically
    setMetrics(prev => {
      const activeDelta = newStatus === 'Open' ? 1 : -1;
      const resolvedDelta = newStatus === 'Resolved' ? 1 : -1;
      return {
        ...prev,
        totalActiveListings: Math.max(0, prev.totalActiveListings + activeDelta),
        totalResolvedRequests: Math.max(0, prev.totalResolvedRequests + resolvedDelta),
      };
    });

    try {
      const res = await fetch('/api/admin/listings/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: item.kind,
          id: item.rawId,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status on server');
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      // Revert on error
      fetchData();
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter listings
  const filteredListings = listings.filter(item => {
    // Type filter
    if (filterType !== 'All' && item.type !== filterType) return false;

    // Status filter
    if (filterStatus !== 'All' && item.status !== filterStatus) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchOwner = item.ownerName.toLowerCase().includes(q);
      const matchPhone = item.ownerPhone.includes(q);
      const matchVillage = item.village.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchOwner && !matchPhone && !matchVillage && !matchCategory) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 py-3.5 px-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onGoBack}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to App</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center text-sm border border-emerald-600/50">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-white leading-none flex items-center gap-2">
                  KisanConnect Admin Panel
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold rounded-full border border-emerald-800">
                    System Monitor
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">
                  Live platform metrics & listing state manager
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 w-full flex-1 space-y-6">
        
        {/* Requirement 3: Top-Level Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Metric 1: Total Active Listings */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Total Active Listings
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                {loading ? '...' : metrics.totalActiveListings}
              </h2>
              <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Live on village feed
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center shrink-0">
              <Tractor className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>

          {/* Metric 2: Total Resolved Requests */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Total Resolved Requests
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                {loading ? '...' : metrics.totalResolvedRequests}
              </h2>
              <p className="text-[11px] text-amber-400 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Fulfilled or closed
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>

          {/* Metric 3: Total System Users */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Total System Users
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                {loading ? '...' : metrics.totalUsers}
              </h2>
              <p className="text-[11px] text-blue-400 font-medium mt-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Registered phone accounts
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>

        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-950/90 border border-rose-800 rounded-2xl text-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Data Table Section */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          
          {/* Table Header Controls: Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-black text-white">System Listings Database</h2>
              <p className="text-xs text-slate-400 font-medium">
                Showing {filteredListings.length} of {listings.length} total entries
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              
              {/* Search Bar */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search titles, villages, phones..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500 font-medium placeholder:text-slate-500"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 border border-slate-700 rounded-xl text-xs font-bold">
                {(['All', 'Have', 'Need'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      filterType === t 
                        ? 'bg-emerald-800 text-white shadow-xs' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t === 'All' ? 'All Types' : t === 'Have' ? 'Have (Equip)' : 'Need (Req)'}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 border border-slate-700 rounded-xl text-xs font-bold">
                {(['All', 'Open', 'Resolved'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      filterStatus === s 
                        ? 'bg-emerald-800 text-white shadow-xs' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              
              <thead className="bg-slate-900/90 text-slate-300 uppercase font-black tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Type & ID</th>
                  <th className="py-3 px-3.5">Title & Category</th>
                  <th className="py-3 px-3.5">Contact / User</th>
                  <th className="py-3 px-3.5">Location</th>
                  <th className="py-3 px-3.5">Price / Rate</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Action State</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-bold">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                      Loading system listings...
                    </td>
                  </tr>
                ) : filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-bold">
                      No listings found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map(item => {
                    const isOpen = item.status === 'Open';
                    const isUpdating = updatingId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                        
                        {/* Type & ID */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                              item.type === 'Have'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : 'bg-amber-950 text-amber-300 border-amber-800'
                            }`}>
                              {item.type}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400">
                              #{item.id}
                            </span>
                          </div>
                        </td>

                        {/* Title & Category */}
                        <td className="py-3 px-3.5 max-w-xs">
                          <p className="font-bold text-white text-xs line-clamp-1">
                            {item.title}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                            <Tag className="w-3 h-3 text-slate-500" />
                            {item.category}
                          </span>
                        </td>

                        {/* Owner / User */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <p className="font-bold text-slate-200">{item.ownerName}</p>
                          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            {item.ownerPhone}
                          </p>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-slate-300">
                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                            {item.village}, {item.district}
                          </span>
                        </td>

                        {/* Price / Rate */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="font-black font-mono text-emerald-300 text-xs">
                            ₹{item.rate}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">
                            /{item.unitType}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 w-fit border ${
                            isOpen 
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' 
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                            {item.status}
                          </span>
                        </td>

                        {/* Requirement 2: Admin Toggle Switch (Open <-> Resolved) */}
                        <td className="py-3 px-3.5 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            disabled={isUpdating}
                            className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center gap-1.5 ml-auto ${
                              isOpen
                                ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-200 border-amber-700/80'
                                : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border-emerald-700/80'
                            }`}
                          >
                            {isUpdating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isOpen ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-amber-400" />
                                <span>Mark Resolved</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Re-Open</span>
                              </>
                            )}
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>

        </div>

      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500 font-semibold">
        KisanConnect Administrative Monitoring Engine • Internal System Dashboard
      </footer>

    </div>
  );
};
