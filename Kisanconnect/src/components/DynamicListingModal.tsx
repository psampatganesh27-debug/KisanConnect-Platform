import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Category } from '../types';
import { VILLAGE_NAMES, getDistanceBadgeInfo } from '../utils/distance';
import { getListingMatches, MatchedListing } from '../utils/matchingService';
import { X, AlertCircle, Calculator, MapPin, Calendar, Tag, FileText, CheckCircle2, Sparkles } from 'lucide-react';

export type FormMode = 'have' | 'need';

interface Props {
  isOpen: boolean;
  initialMode?: FormMode;
  onClose: () => void;
  onSuccess: () => void;
  onMatchesFound?: (
    matches: MatchedListing[],
    matchSource: 'python_ml' | 'js_fallback',
    submittedTitle: string,
    submittedVillage: string
  ) => void;
}

export const DynamicListingModal: React.FC<Props> = ({
  isOpen,
  initialMode = 'have',
  onClose,
  onSuccess,
  onMatchesFound,
}) => {
  const { t, user, setLoginModalOpen } = useLanguage();

  const [mode, setMode] = useState<FormMode>(initialMode);
  const [category, setCategory] = useState<Category>('tractor');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<string>('850');
  const [unitType, setUnitType] = useState<'hour' | 'day' | 'acre'>('hour');
  const [workDate, setWorkDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [village, setVillage] = useState<string>(user?.village || 'Rampur');
  const [district, setDistrict] = useState<string>(user?.district || 'Central District');
  const [contactName, setContactName] = useState<string>(user?.name || '');
  const [contactPhone, setContactPhone] = useState<string>(user?.phone || '');

  // Predictive Cost Calculator preview state inside form
  const [duration, setDuration] = useState<number>(4);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (user) {
        setVillage(user.village || 'Rampur');
        setDistrict(user.district || 'Central District');
        setContactName(user.name || '');
        setContactPhone(user.phone || '');
      }
    }
  }, [isOpen, initialMode, user]);

  if (!isOpen) return null;

  const categories = [
    { value: 'tractor', label: 'Tractor (ट्रैक्टर / ట్రాక్టర్)' },
    { value: 'tiller', label: 'Tiller / Rotavator (टिलर / రోటవేటర్)' },
    { value: 'sprayer', label: 'Sprayer / Drone (स्प्रेयर / స్ప్రేయర్)' },
    { value: 'labor', label: 'Labor Team (खेत मजदूर / కూలీలు)' },
    { value: 'harvester', label: 'Harvester (हार्वेस्टर / హార్వెస్టర్)' },
    { value: 'seeder', label: 'Seeder / Planter (सीडर / సీడర్)' },
    { value: 'irrigation', label: 'Pumps & Irrigation (सिंचाई पंप)' },
  ];

  // Predictive total calculation
  const numericPrice = parseFloat(basePrice) || 0;
  const estimatedTotal = numericPrice * duration;

  // Distance from current user village
  const distanceInfo = user?.village ? getDistanceBadgeInfo(user.village, village) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

    if (!title.trim() || (mode === 'have' && !basePrice) || !village.trim() || !contactPhone.trim()) {
      setError(
        mode === 'have'
          ? 'Please fill in all required fields (Title, Category, Rental Rate, Village, Phone).'
          : 'Please fill in all required fields (Title, Category, Date, Village, Phone).'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'have') {
        // Post equipment listing
        const res = await fetch('/api/equipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            ownerName: contactName || user.name,
            ownerPhone: contactPhone || user.phone,
            category,
            title,
            description,
            ratePerUnit: numericPrice,
            unitType,
            village: village || user.village,
            district: district || user.district || 'Local District',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to post equipment listing');
      } else {
        // Post labor/equipment request
        const res = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            requesterName: contactName || user.name,
            requesterPhone: contactPhone || user.phone,
            category,
            title,
            description,
            offeredRate: numericPrice,
            unitType,
            workDate,
            village: village || user.village,
            district: district || user.district || 'Local District',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to post requirement');
      }

      // Submission Trigger: Fetch Top Matches from Python backend or JS Fallback
      const matchResult = await getListingMatches({
        type: mode === 'have' ? 'Have' : 'Need',
        title,
        description,
        category,
        village: village || user.village || 'Rampur',
        ratePerUnit: numericPrice,
        unitType,
      });

      onSuccess();
      onClose();

      if (onMatchesFound && matchResult.matches.length > 0) {
        onMatchesFound(
          matchResult.matches,
          matchResult.source,
          title,
          village || user.village || 'Rampur'
        );
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-900 my-auto">
        
        {/* Header */}
        <div className="bg-emerald-950 text-white p-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-emerald-100 font-bold flex items-center justify-center text-lg border border-emerald-700/60 shrink-0">
              {mode === 'have' ? '🚜' : '🙋‍♂️'}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight text-white">
                {mode === 'have' ? 'List Farm Equipment / Labor' : 'Post Requirement (Need Equipment)'}
              </h2>
              <p className="text-xs text-emerald-300/80 font-medium">
                {mode === 'have' ? 'Earn rent by offering your machines to local farmers' : 'Connect with nearby machine owners & labor teams'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 rounded-xl flex items-center justify-center border border-emerald-700/60 active:scale-95"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Mode Selector Switcher */}
        <div className="p-3 bg-slate-100 border-b border-slate-200">
          <div className="flex bg-slate-200 p-1 rounded-xl border border-slate-300/80">
            <button
              type="button"
              onClick={() => setMode('have')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'have'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              🚜 I Have Equipment / Labor ('Have')
            </button>
            <button
              type="button"
              onClick={() => setMode('need')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'need'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              🙋‍♂️ I Need Equipment / Labor ('Need')
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-800" />
              Title / Equipment Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mode === 'have' ? 'e.g. Mahindra 575 DI Tractor with Rotavator' : 'e.g. Need Paddy Harvester for 5 Acres'}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl font-bold text-sm text-slate-900 min-h-[44px] outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl font-bold text-sm text-slate-900 min-h-[44px] outline-none"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Base Price & Unit Selector - Only needed when listing equipment for rent ('have' mode) */}
          {mode === 'have' ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Rental Rate (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="e.g. 850"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl font-mono font-bold text-base text-slate-900 min-h-[44px] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Price Unit *
                </label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl font-bold text-sm text-slate-900 min-h-[44px] outline-none"
                >
                  <option value="hour">Per Hour (/ hr)</option>
                  <option value="day">Per Day (/ day)</option>
                  <option value="acre">Per Acre (/ acre)</option>
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Offered Budget / Max Rate (₹) <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="number"
                min="0"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="e.g. 1500 (Leave blank if rate is negotiable)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl font-mono font-bold text-sm text-slate-900 min-h-[44px] outline-none"
              />
            </div>
          )}

          {/* Date & Village */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                Date *
              </label>
              <input
                type="date"
                required
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl font-semibold text-xs text-slate-900 min-h-[40px] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                Village Name *
              </label>
              <input
                type="text"
                required
                list="village-suggestions"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Select or enter village"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl font-semibold text-xs text-slate-900 min-h-[40px] outline-none"
              />
              <datalist id="village-suggestions">
                {VILLAGE_NAMES.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Contact Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl font-semibold text-xs text-slate-900 min-h-[40px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Mobile Number"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl font-mono font-semibold text-xs text-slate-900 min-h-[40px]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-800" />
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide field specs, condition, or work timing details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl font-medium text-xs text-slate-900 outline-none"
            />
          </div>

          {/* PREDICTIVE COST CALCULATOR widget inside form (Only shown when offering equipment for rent) */}
          {mode === 'have' && (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-emerald-950">
                <span className="flex items-center gap-1.5 text-sm">
                  <Calculator className="w-4 h-4 text-emerald-800" />
                  Predictive Revenue Estimator
                </span>
                <span className="text-emerald-900 font-extrabold text-sm">
                  Estimated Revenue: ₹{estimatedTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                  <span>Rental Duration ({unitType === 'hour' ? 'Hours' : unitType === 'day' ? 'Days' : 'Acres'}):</span>
                  <span className="font-bold text-emerald-950">{duration} {unitType}(s)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  className="w-full accent-emerald-800 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>

              <p className="text-[11px] text-emerald-800 font-medium leading-tight">
                Formula: {numericPrice} ₹/{unitType} × {duration} {unitType}s = <strong className="text-emerald-950">₹{estimatedTotal}</strong>
              </p>

              {distanceInfo && (
                <div className="pt-1.5 border-t border-emerald-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-semibold">Distance from your village ({user?.village}):</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold border ${distanceInfo.badgeBg} ${distanceInfo.badgeTextColor} ${distanceInfo.badgeBorder}`}>
                    {distanceInfo.icon} {distanceInfo.badgeText}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-base rounded-xl shadow-xs border border-emerald-950 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{mode === 'have' ? 'Publish Equipment Listing' : 'Publish Requirement'}</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
