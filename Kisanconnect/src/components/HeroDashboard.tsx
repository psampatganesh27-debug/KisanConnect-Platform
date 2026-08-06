import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Category, EquipmentListing, LaborRequest } from '../types';
import { VILLAGE_NAMES, getDistanceBadgeInfo } from '../utils/distance';
import { useWishlist } from '../utils/useWishlist';
import { 
  Tractor, 
  Users, 
  Search, 
  MapPin, 
  PhoneCall, 
  Sun, 
  ArrowRight,
  Calculator,
  ShieldAlert,
  Compass,
  Heart
} from 'lucide-react';

interface Props {
  onOpenNeedModal: () => void;
  onOpenHaveModal: () => void;
  onSelectBooking: (listing: EquipmentListing | null, request: LaborRequest | null, villageOverride?: string) => void;
}

export const HeroDashboard: React.FC<Props> = ({
  onOpenNeedModal,
  onOpenHaveModal,
  onSelectBooking,
}) => {
  const { t, user } = useLanguage();
  const { isSaved, toggleWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'saved'>('listings');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // User's active village for distance calculations (defaults to user village or Rampur)
  const [userVillage, setUserVillage] = useState<string>(user?.village || 'Rampur');

  // Duration sliders state per item card: Record<itemId, duration>
  const [listingDurations, setListingDurations] = useState<Record<number, number>>({});
  const [requestDurations, setRequestDurations] = useState<Record<number, number>>({});

  const [listings, setListings] = useState<EquipmentListing[]>([]);
  const [requests, setRequests] = useState<LaborRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.village) {
      setUserVillage(user.village);
    }
  }, [user]);

  const categoriesList: { key: Category; labelKey: any; icon: string }[] = [
    { key: 'all', labelKey: 'categoryAll', icon: '🌾' },
    { key: 'tractor', labelKey: 'categoryTractor', icon: '🚜' },
    { key: 'harvester', labelKey: 'categoryHarvester', icon: '🌾' },
    { key: 'seeder', labelKey: 'categorySeeder', icon: '🌱' },
    { key: 'labor', labelKey: 'categoryLabor', icon: '👨‍🌾' },
    { key: 'sprayer', labelKey: 'categorySprayer', icon: '💦' },
    { key: 'drone', labelKey: 'categoryDrone', icon: '🚁' },
    { key: 'irrigation', labelKey: 'categoryIrrigation', icon: '🚰' },
  ];

  const fetchListings = async () => {
    try {
      const url = `/api/equipment?category=${selectedCategory}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (e) {
      console.error('Failed to load listings:', e);
    }
  };

  const fetchRequests = async () => {
    try {
      const url = `/api/requests?category=${selectedCategory}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error('Failed to load requests:', e);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchListings(), fetchRequests()]).finally(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  const getUnitText = (unit: string) => {
    if (unit === 'hour') return t('perHour');
    if (unit === 'acre') return t('perAcre');
    return t('perDay');
  };

  const getUnitShort = (unit: string) => {
    if (unit === 'hour') return 'hrs';
    if (unit === 'acre') return 'acres';
    return 'days';
  };

  const handleListingDurationChange = (id: number, val: number) => {
    setListingDurations(prev => ({ ...prev, [id]: val }));
  };

  const handleRequestDurationChange = (id: number, val: number) => {
    setRequestDurations(prev => ({ ...prev, [id]: val }));
  };

  // Filtered views for Wishlist tab
  const savedEquipmentListings = listings.filter(item => isSaved(`equipment-${item.id}`));
  const savedLaborRequests = requests.filter(item => isSaved(`request-${item.id}`));

  return (
    <div className="space-y-4 sm:space-y-5 pb-12 w-full max-w-full overflow-x-hidden">
      
      {/* Sunlight High Contrast Mode & Location Switcher Header Bar */}
      <div className="bg-emerald-950 text-white px-3 py-2 border-b border-emerald-800 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs font-semibold w-full">
        <div className="flex items-center gap-1.5 max-w-2xl min-w-0">
          <Sun className="w-4 h-4 text-emerald-300 shrink-0" />
          <span className="truncate text-emerald-100">{t('sunlightMode')} • {t('offlineNotice')}</span>
        </div>

        {/* User Village Selector for Distance Calculations */}
        <div className="flex items-center gap-1.5 bg-emerald-900/90 border border-emerald-700/80 px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-100">
          <Compass className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="text-[11px] text-emerald-300">My Location:</span>
          <select
            value={userVillage}
            onChange={(e) => setUserVillage(e.target.value)}
            className="bg-emerald-950 text-white font-bold text-xs rounded-md px-1.5 py-0.5 outline-none border border-emerald-700 cursor-pointer"
          >
            {VILLAGE_NAMES.map((v) => (
              <option key={v} value={v}>
                {v} {v === user?.village ? '(Saved)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-2.5 sm:px-4 space-y-4 sm:space-y-5 min-w-0 w-full">

        {/* HERO ACTION CARDS - Dynamic Forms trigger for 'Need' vs 'Have' */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 w-full">
          
          {/* Button 1: "I Need Equipment / Labor" */}
          <button
            onClick={onOpenNeedModal}
            className="group text-left p-4 sm:p-5 bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl border border-emerald-800 shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex flex-col justify-between min-h-[140px] sm:min-h-[160px] w-full"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-800 text-emerald-100 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl border border-emerald-700/50 shrink-0">
                <Tractor className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <span className="px-2 sm:px-2.5 py-1 bg-emerald-800/80 text-emerald-200 text-[10px] sm:text-[11px] font-bold rounded-full border border-emerald-700/50 shrink-0">
                REQUEST NOW
              </span>
            </div>

            <div className="mt-2 sm:mt-3 space-y-1 min-w-0">
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-white leading-tight truncate">
                {t('needAction')}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-emerald-200/80 leading-snug line-clamp-2">
                {t('needActionSub')}
              </p>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-300 group-hover:translate-x-1 transition-transform">
              <span>{t('postRequirement')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Button 2: "I Have Equipment / Labor" */}
          <button
            onClick={onOpenHaveModal}
            className="group text-left p-4 sm:p-5 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex flex-col justify-between min-h-[140px] sm:min-h-[160px] w-full"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-900 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl border border-amber-200/80 shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              <span className="px-2 sm:px-2.5 py-1 bg-amber-50 text-amber-900 text-[10px] sm:text-[11px] font-bold rounded-full border border-amber-200/80 shrink-0">
                EARN RENT
              </span>
            </div>

            <div className="mt-2 sm:mt-3 space-y-1 min-w-0">
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 leading-tight truncate">
                {t('haveAction')}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-600 leading-snug line-clamp-2">
                {t('haveActionSub')}
              </p>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-800 group-hover:translate-x-1 transition-transform">
              <span>{t('postEquipment')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

        </div>

        {/* Search Bar & Category Filters */}
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 w-full min-w-0">
          
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-14 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl font-medium text-slate-900 min-h-[44px] outline-none text-xs sm:text-sm placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[11px] font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Horizontal Pill Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full max-w-full">
            {categoriesList.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap min-h-[38px] sm:min-h-[40px] flex items-center gap-1.5 border transition-all active:scale-95 shrink-0 ${
                  selectedCategory === c.key
                    ? 'bg-emerald-900 text-white border-emerald-950 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs">{c.icon}</span>
                <span>{t(c.labelKey)}</span>
              </button>
            ))}
          </div>

        </div>

        {/* View Mode Toggle: Listings vs Requests vs Saved Wishlist */}
        <div className="flex items-center bg-slate-200/70 p-1 rounded-xl border border-slate-300/60 w-full min-w-0 gap-1">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg font-bold text-xs sm:text-sm text-center transition-all min-h-[42px] sm:min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 ${
              activeTab === 'listings'
                ? 'bg-emerald-900 text-white shadow-xs border border-emerald-950'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span className="truncate">🚜 {t('browseListings')}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold shrink-0 ${
              activeTab === 'listings' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-300 text-slate-800'
            }`}>
              {listings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg font-bold text-xs sm:text-sm text-center transition-all min-h-[42px] sm:min-h-[44px] flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 ${
              activeTab === 'requests'
                ? 'bg-emerald-900 text-white shadow-xs border border-emerald-950'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span className="truncate">🙋‍♂️ {t('browseRequests')}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold shrink-0 ${
              activeTab === 'requests' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-300 text-slate-800'
            }`}>
              {requests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-bold text-xs sm:text-sm text-center transition-all min-h-[42px] sm:min-h-[44px] flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'saved'
                ? 'bg-rose-700 text-white shadow-xs border border-rose-900'
                : 'text-slate-700 hover:text-slate-900 bg-white/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Saved</span>
          </button>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <div className="w-7 h-7 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-semibold text-xs">Searching equipment & labor near you...</p>
          </div>
        ) : activeTab === 'listings' ? (
          
          /* LISTINGS VIEW WITH PREDICTIVE CALCULATOR & DISTANCE BADGES */
          listings.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-6 space-y-2 w-full">
              <div className="text-3xl">🚜</div>
              <h3 className="text-sm font-bold text-slate-800">No equipment listed in this category yet</h3>
              <p className="text-xs text-slate-500">Be the first farmer to list your equipment or labor team!</p>
              <button
                onClick={onOpenHaveModal}
                className="mt-2 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs border border-emerald-900 min-h-[40px]"
              >
                + {t('postEquipment')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
              {listings.map((item) => {
                const distInfo = getDistanceBadgeInfo(userVillage, item.village);
                const itemDuration = listingDurations[item.id] || 4;
                const totalCost = item.rate_per_unit * itemDuration;
                const itemKey = `equipment-${item.id}`;
                const saved = isSaved(itemKey);

                return (
                  <div
                    key={item.id}
                    className={`relative bg-white border rounded-2xl p-3.5 sm:p-4 shadow-2xs transition-all flex flex-col justify-between space-y-3 w-full min-w-0 ${
                      !distInfo.isDeliverable 
                        ? 'border-rose-300 bg-rose-50/20' 
                        : 'border-slate-200 hover:border-emerald-500/80'
                    }`}
                  >
                    {/* Wishlist Bookmark Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(itemKey);
                      }}
                      className={`absolute top-3.5 right-3.5 p-2 rounded-xl border transition-all z-10 ${
                        saved 
                          ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs' 
                          : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700'
                      }`}
                      title={saved ? "Remove from Saved" : "Save for Later"}
                    >
                      <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    <div className="space-y-2 min-w-0 pr-10">
                      
                      {/* Top Badges Row */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold text-[10px] sm:text-[11px] rounded-md border border-slate-200/80 uppercase tracking-wider truncate max-w-[120px]">
                          {item.category}
                        </span>

                        {/* Distance UI Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border flex items-center gap-1 ${distInfo.badgeBg} ${distInfo.badgeTextColor} ${distInfo.badgeBorder}`}>
                          <span>{distInfo.icon}</span>
                          <span>{distInfo.badgeText}</span>
                        </span>
                      </div>

                      {/* Title & Price */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                        <span className="px-2.5 py-1 bg-emerald-900 text-white font-bold text-xs rounded-lg shrink-0">
                          ₹{item.rate_per_unit} {getUnitText(item.unit_type)}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-600 font-normal line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Red Undeliverable Banner if > 100 km */}
                      {!distInfo.isDeliverable && (
                        <div className="p-2 bg-rose-100 border border-rose-300 rounded-xl text-[11px] font-bold text-rose-900 flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Undeliverable Location (&gt; 100 km). Transport disabled.</span>
                        </div>
                      )}

                      {/* Predictive Cost Calculator UI Slider on Card */}
                      <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-emerald-950">
                          <span className="flex items-center gap-1">
                            <Calculator className="w-3.5 h-3.5 text-emerald-800" />
                            Rental Duration ({getUnitShort(item.unit_type)}):
                          </span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-xs text-emerald-900 font-black">
                            {itemDuration} {getUnitShort(item.unit_type)}
                          </span>
                        </div>

                        <input
                          type="range"
                          min="1"
                          max="24"
                          step="1"
                          value={itemDuration}
                          onChange={(e) => handleListingDurationChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-full accent-emerald-800 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />

                        <div className="flex justify-between items-center text-[11px] pt-0.5">
                          <span className="text-slate-600 font-medium">Estimated Total Cost:</span>
                          <span className="font-mono font-black text-sm text-emerald-900">
                            ₹{totalCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Owner Info & Action Call Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          👤 {item.owner_name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">{item.village}, {item.district}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => onSelectBooking(item, null, userVillage)}
                        disabled={!distInfo.isDeliverable}
                        className={`px-3 sm:px-3.5 py-2 font-bold text-xs rounded-xl shadow-xs border flex items-center gap-1.5 transition-all min-h-[38px] sm:min-h-[40px] shrink-0 ${
                          !distInfo.isDeliverable
                            ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-75'
                            : 'bg-emerald-800 hover:bg-emerald-900 text-white border-emerald-950 active:scale-95'
                        }`}
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-200" />
                        <span>{!distInfo.isDeliverable ? 'Undeliverable' : t('callNow')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )

        ) : activeTab === 'requests' ? (

          /* REQUESTS VIEW WITH PREDICTIVE CALCULATOR & DISTANCE BADGES */
          requests.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-6 space-y-2 w-full">
              <div className="text-3xl">🙋‍♂️</div>
              <h3 className="text-sm font-bold text-slate-800">No open requirements posted yet</h3>
              <p className="text-xs text-slate-500">Need machines or workers? Post your requirement now!</p>
              <button
                onClick={onOpenNeedModal}
                className="mt-2 px-3.5 py-2 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs border border-emerald-900 min-h-[40px]"
              >
                + {t('postRequirement')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
              {requests.map((item) => {
                const distInfo = getDistanceBadgeInfo(userVillage, item.village);
                const reqDuration = requestDurations[item.id] || 4;
                const totalCost = item.offered_rate * reqDuration;
                const itemKey = `request-${item.id}`;
                const saved = isSaved(itemKey);

                return (
                  <div
                    key={item.id}
                    className={`relative bg-white border rounded-2xl p-3.5 sm:p-4 shadow-2xs transition-all flex flex-col justify-between space-y-3 w-full min-w-0 ${
                      !distInfo.isDeliverable 
                        ? 'border-rose-300 bg-rose-50/20' 
                        : 'border-slate-200 hover:border-amber-500/80'
                    }`}
                  >
                    {/* Wishlist Bookmark Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(itemKey);
                      }}
                      className={`absolute top-3.5 right-3.5 p-2 rounded-xl border transition-all z-10 ${
                        saved 
                          ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs' 
                          : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-700'
                      }`}
                      title={saved ? "Remove from Saved" : "Save for Later"}
                    >
                      <Heart className={`w-4 h-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    <div className="space-y-2 min-w-0 pr-10">
                      
                      {/* Top Badges Row */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-900 font-semibold text-[10px] sm:text-[11px] rounded-md border border-amber-200 uppercase tracking-wider truncate max-w-[130px]">
                          Req • {item.category}
                        </span>

                        {/* Distance UI Badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border flex items-center gap-1 ${distInfo.badgeBg} ${distInfo.badgeTextColor} ${distInfo.badgeBorder}`}>
                          <span>{distInfo.icon}</span>
                          <span>{distInfo.badgeText}</span>
                        </span>
                      </div>

                      {/* Title & Price */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                        <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-lg shrink-0">
                          ₹{item.offered_rate} {getUnitText(item.unit_type)}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-600 font-normal line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Red Undeliverable Banner if > 100 km */}
                      {!distInfo.isDeliverable && (
                        <div className="p-2 bg-rose-100 border border-rose-300 rounded-xl text-[11px] font-bold text-rose-900 flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Undeliverable Location (&gt; 100 km). Delivery disabled.</span>
                        </div>
                      )}

                      {/* Predictive Cost Calculator UI Slider on Card */}
                      <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-950">
                          <span className="flex items-center gap-1">
                            <Calculator className="w-3.5 h-3.5 text-amber-800" />
                            Work Duration ({getUnitShort(item.unit_type)}):
                          </span>
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 text-xs text-amber-950 font-black">
                            {reqDuration} {getUnitShort(item.unit_type)}
                          </span>
                        </div>

                        <input
                          type="range"
                          min="1"
                          max="24"
                          step="1"
                          value={reqDuration}
                          onChange={(e) => handleRequestDurationChange(item.id, parseInt(e.target.value) || 1)}
                          className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />

                        <div className="flex justify-between items-center text-[11px] pt-0.5">
                          <span className="text-slate-600 font-medium">Estimated Total Payment:</span>
                          <span className="font-mono font-black text-sm text-slate-900">
                            ₹{totalCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Requester Info & Action Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          👤 {item.requester_name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">{item.village} • {item.work_date}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => onSelectBooking(null, item, userVillage)}
                        disabled={!distInfo.isDeliverable}
                        className={`px-3 sm:px-3.5 py-2 font-bold text-xs rounded-xl shadow-xs border flex items-center gap-1.5 transition-all min-h-[38px] sm:min-h-[40px] shrink-0 ${
                          !distInfo.isDeliverable
                            ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-75'
                            : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 active:scale-95'
                        }`}
                      >
                        <PhoneCall className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>{!distInfo.isDeliverable ? 'Undeliverable' : t('callNow')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )

        ) : (

          /* SAVED WISHLIST VIEW TAB */
          savedEquipmentListings.length === 0 && savedLaborRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6 space-y-3 w-full">
              <div className="text-3xl text-rose-500">❤️</div>
              <h3 className="text-sm font-bold text-slate-800">Your Saved Wishlist is Empty</h3>
              <p className="text-xs text-slate-500">Click the heart icon on any equipment or request card to save it for later review.</p>
            </div>
          ) : (
            <div className="space-y-6 w-full">
              {savedEquipmentListings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Saved Equipment Listings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
                    {savedEquipmentListings.map((item) => {
                      const distInfo = getDistanceBadgeInfo(userVillage, item.village);
                      const itemDuration = listingDurations[item.id] || 4;
                      const totalCost = item.rate_per_unit * itemDuration;
                      const itemKey = `equipment-${item.id}`;

                      return (
                        <div key={item.id} className="relative bg-white border border-rose-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between space-y-3 w-full">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(itemKey);
                            }}
                            className="absolute top-3.5 right-3.5 p-2 rounded-xl border bg-rose-50 text-rose-600 border-rose-200 shadow-xs z-10"
                            title="Remove from Saved"
                          >
                            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                          </button>
                          <div className="space-y-2 pr-10">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold text-[10px] rounded-md uppercase">{item.category}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border flex items-center gap-1 ${distInfo.badgeBg} ${distInfo.badgeTextColor} ${distInfo.badgeBorder}`}>
                                <span>{distInfo.icon}</span>
                                <span>{distInfo.badgeText}</span>
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                              <span className="px-2.5 py-1 bg-emerald-900 text-white font-bold text-xs rounded-lg shrink-0">₹{item.rate_per_unit} {getUnitText(item.unit_type)}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-slate-800">👤 {item.owner_name}</p>
                              <p className="text-[11px] font-medium text-slate-500"><MapPin className="w-3.5 h-3.5 inline text-emerald-700 mr-1" />{item.village}, {item.district}</p>
                            </div>
                            <button
                              onClick={() => onSelectBooking(item, null, userVillage)}
                              className="px-3 py-2 font-bold text-xs rounded-xl bg-emerald-800 text-white shadow-xs border border-emerald-950 flex items-center gap-1.5"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>{t('callNow')}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {savedLaborRequests.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Saved Labor & Equipment Requests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
                    {savedLaborRequests.map((item) => {
                      const distInfo = getDistanceBadgeInfo(userVillage, item.village);
                      const itemKey = `request-${item.id}`;

                      return (
                        <div key={item.id} className="relative bg-white border border-rose-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between space-y-3 w-full">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(itemKey);
                            }}
                            className="absolute top-3.5 right-3.5 p-2 rounded-xl border bg-rose-50 text-rose-600 border-rose-200 shadow-xs z-10"
                            title="Remove from Saved"
                          >
                            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                          </button>
                          <div className="space-y-2 pr-10">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-900 font-semibold text-[10px] rounded-md uppercase">Req • {item.category}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border flex items-center gap-1 ${distInfo.badgeBg} ${distInfo.badgeTextColor} ${distInfo.badgeBorder}`}>
                                <span>{distInfo.icon}</span>
                                <span>{distInfo.badgeText}</span>
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-lg shrink-0">₹{item.offered_rate} {getUnitText(item.unit_type)}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold text-slate-800">👤 {item.requester_name}</p>
                              <p className="text-[11px] font-medium text-slate-500"><MapPin className="w-3.5 h-3.5 inline text-emerald-700 mr-1" />{item.village} • {item.work_date}</p>
                            </div>
                            <button
                              onClick={() => onSelectBooking(null, item, userVillage)}
                              className="px-3 py-2 font-bold text-xs rounded-xl bg-amber-500 text-slate-950 shadow-xs border border-amber-600 flex items-center gap-1.5"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>{t('callNow')}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )

        )}

      </div>

    </div>
  );
};