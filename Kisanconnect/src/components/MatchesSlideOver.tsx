import React, { useState } from 'react';
import { MatchedListing } from '../utils/matchingService';
import { getDistanceBadgeInfo } from '../utils/distance';
import { 
  X, 
  PhoneCall, 
  Sparkles, 
  Calculator, 
  MapPin, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Bot
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  matches: MatchedListing[];
  submittedListingTitle: string;
  submittedVillage: string;
  matchSource?: 'python_ml' | 'js_fallback';
  userVillage?: string;
}

export const MatchesSlideOver: React.FC<Props> = ({
  isOpen,
  onClose,
  matches,
  submittedListingTitle,
  submittedVillage,
  matchSource = 'python_ml',
  userVillage = 'Rampur',
}) => {
  const { user } = useLanguage();

  const [cardDurations, setCardDurations] = useState<Record<string | number, number>>({});
  const [calledIds, setCalledIds] = useState<Record<string | number, boolean>>({});
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  if (!isOpen) return null;

  const handleDurationChange = (id: string | number, value: number) => {
    setCardDurations(prev => ({ ...prev, [id]: value }));
  };

  const getUnitName = (u: string) => {
    if (u === 'hour') return 'Hours';
    if (u === 'acre') return 'Acres';
    return 'Days';
  };

  const getUnitShort = (u: string) => {
    if (u === 'hour') return 'hr';
    if (u === 'acre') return 'acre';
    return 'day';
  };

  const handleConnectAndBook = async (item: MatchedListing, idx: number) => {
    const itemKey = `${item.id || 'match'}-${idx}`;
    const myPhone = String(user?.phone || '9999999999');
    const phone = String(item.contactPhone || '9999999999');
    const title = String(item.title || 'Equipment Service');
    const duration = cardDurations[itemKey] || 4;
    const unitPrice = Number(item.ratePerUnit || 800);
    const totalCost = unitPrice * duration;

    setLoadingId(itemKey);

    try {
      // Force valid IDs or pass fallback indicators so the backend resolver updates metrics cleanly
      const payloadId = typeof item.id === 'number' ? item.id : 101;

      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: item.type === 'Have' ? payloadId : null,
          requestId: item.type === 'Need' ? payloadId : null,
          requesterPhone: myPhone,
          providerPhone: phone,
          serviceTitle: title,
          amount: totalCost,
          bookingDate: new Date().toISOString().split('T')[0],
        }),
      });

      setCalledIds(prev => ({ ...prev, [itemKey]: true }));
    } catch (e) {
      console.error('Failed to log booking from ML match:', e);
      setCalledIds(prev => ({ ...prev, [itemKey]: true }));
    } finally {
      setLoadingId(null);
      window.location.href = `tel:${phone}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-fade-in flex justify-end">
      
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between z-10 text-slate-900 animate-slide-left overflow-hidden">
        
        <div className="bg-emerald-950 text-white p-4 sm:p-5 border-b border-emerald-800 shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shadow-xs shrink-0">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                    Top 3 Local Matches
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 border ${
                    matchSource === 'python_ml'
                      ? 'bg-emerald-800 text-emerald-200 border-emerald-700'
                      : 'bg-amber-900/90 text-amber-200 border-amber-700'
                  }`}>
                    {matchSource === 'python_ml' ? <Bot className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                    {matchSource === 'python_ml' ? 'Python ML' : 'JS Fallback'}
                  </span>
                </div>
                <p className="text-xs text-emerald-200/80 font-medium">
                  Instant machine & labor connections near you
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 rounded-xl flex items-center justify-center border border-emerald-700/60 active:scale-95 transition-all"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          <div className="p-2.5 bg-emerald-900/80 border border-emerald-800 rounded-xl text-xs font-semibold text-emerald-100 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider block">
                Matches For Your Submission
              </span>
              <p className="font-bold text-white truncate text-xs">
                "{submittedListingTitle || 'Your Request'}" • {submittedVillage}
              </p>
            </div>
            <span className="px-2 py-1 bg-amber-400 text-slate-950 font-black rounded-lg text-[11px] shrink-0">
              {matches.length} Matches
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4">
          {matches.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="text-4xl">🌾</div>
              <h3 className="text-base font-bold text-slate-800">No exact matches found right now</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your request has been published to the village feed. Nearby owners will call you directly.
              </p>
            </div>
          ) : (
            matches.map((item, idx) => {
              const itemKey = `${item.id || 'match'}-${idx}`;
              const itemVillage = item.village || 'Rampur';
              const distanceInfo = getDistanceBadgeInfo(userVillage || submittedVillage, itemVillage);

              const duration = cardDurations[itemKey] || 4;
              const unitPrice = item.ratePerUnit || 800;
              const predictiveTotalCost = unitPrice * duration;
              const isDone = calledIds[itemKey];
              const isLoading = loadingId === itemKey;

              return (
                <div
                  key={itemKey}
                  className={`bg-white border rounded-2xl p-4 shadow-sm space-y-3 transition-all relative overflow-hidden ${
                    idx === 0 ? 'ring-2 ring-emerald-600/80 border-emerald-500' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold ${
                        idx === 0 
                          ? 'bg-amber-400 text-slate-950 font-black' 
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}>
                        #{idx + 1} Best Match
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md uppercase border border-slate-200">
                        {item.category}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 text-xs font-black rounded-lg font-mono">
                      {item.matchPercentage || `${(item.score * 100).toFixed(0)}%`} Match
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-800" />
                        {item.contactName || 'Farmer Partner'}
                      </span>
                      <span className="font-mono text-slate-900 font-extrabold">
                        📱 {item.contactPhone}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                      <span className="flex items-center gap-1 text-slate-600 font-semibold text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        {itemVillage}, {item.district || 'Local'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${distanceInfo.badgeBg} ${distanceInfo.badgeTextColor} ${distanceInfo.badgeBorder}`}>
                        {distanceInfo.icon} {distanceInfo.badgeText}
                      </span>
                    </div>
                  </div>

                  {!distanceInfo.isDeliverable && (
                    <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Undeliverable Location (&gt; 100 km distance)</span>
                    </div>
                  )}

                  <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-extrabold text-emerald-950">
                      <span className="flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-emerald-800" />
                        Predictive Cost Estimate
                      </span>
                      <span className="font-mono text-xs bg-emerald-900 text-white px-2 py-0.5 rounded-md font-bold">
                        ₹{unitPrice} / {getUnitShort(item.unitType)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700">
                        <span>Duration ({getUnitName(item.unitType)}):</span>
                        <span className="text-emerald-950 font-extrabold font-mono">{duration} {getUnitName(item.unitType)}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        step="1"
                        value={duration}
                        onChange={(e) => handleDurationChange(itemKey, parseInt(e.target.value) || 1)}
                        className="w-full accent-emerald-800 cursor-pointer h-2 bg-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-emerald-200/80">
                      <span className="text-xs text-slate-600 font-semibold">Estimated Total Cost:</span>
                      <span className="text-base font-black font-mono text-emerald-950">
                        ₹{predictiveTotalCost.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleConnectAndBook(item, idx)}
                    disabled={isLoading || !distanceInfo.isDeliverable}
                    className={`w-full min-h-[48px] font-bold text-sm sm:text-base rounded-xl shadow-xs border flex items-center justify-center gap-2 transition-all active:scale-98 ${
                      !distanceInfo.isDeliverable
                        ? 'bg-slate-200 text-slate-500 border-slate-300 cursor-not-allowed opacity-75'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-emerald-800 hover:bg-emerald-900 text-white border-emerald-950'
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isDone ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                        <span>Connected & Resolved ({item.contactPhone})</span>
                      </>
                    ) : (
                      <>
                        <PhoneCall className="w-4 h-4 stroke-[2.2]" />
                        <span>Connect ({item.contactPhone})</span>
                      </>
                    )}
                  </button>

                </div>
              );
            })
          )}

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2">
          <button
            onClick={onClose}
            className="w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Done Viewing Matches</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};