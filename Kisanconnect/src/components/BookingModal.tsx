import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { EquipmentListing, LaborRequest } from '../types';
import { getDistanceBadgeInfo } from '../utils/distance';
import { Phone, CheckCircle2, X, MapPin, Calculator, AlertTriangle, ShieldAlert } from 'lucide-react';

interface Props {
  listing?: EquipmentListing | null;
  request?: LaborRequest | null;
  currentUserVillage?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<Props> = ({
  listing,
  request,
  currentUserVillage,
  isOpen,
  onClose,
}) => {
  const { t, user, setLoginModalOpen } = useLanguage();

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Predictive Cost Calculator duration state
  const [duration, setDuration] = useState<number>(4);

  if (!isOpen || (!listing && !request)) return null;

  const title = listing ? listing.title : request?.title || '';
  const basePrice = listing ? listing.rate_per_unit : request?.offered_rate || 0;
  const unit = listing ? listing.unit_type : request?.unit_type || 'hour';
  const ownerName = listing ? listing.owner_name : request?.requester_name || '';
  const ownerPhone = listing ? listing.owner_phone : request?.requester_phone || '';
  const itemVillage = listing ? listing.village : request?.village || '';
  const district = listing ? listing.district : request?.district || '';

  // Distance calculation using Pythagorean theorem
  const activeUserVillage = currentUserVillage || user?.village || 'Rampur';
  const distanceInfo = getDistanceBadgeInfo(activeUserVillage, itemVillage);

  // Predictive Total Cost
  const estimatedTotalCost = basePrice * duration;

  const handleBookAndCall = async () => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

    if (!distanceInfo.isDeliverable) {
      return; // Disabled if > 100 km
    }

    setLoading(true);

    try {
      // 1. Log the booking in the backend database
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing ? listing.id : null,
          requestId: request ? request.id : null,
          requesterPhone: user.phone,
          providerPhone: ownerPhone,
          serviceTitle: title,
          amount: estimatedTotalCost,
          bookingDate: new Date().toISOString().split('T')[0],
        }),
      });

      setConfirmed(true);
    } catch (e) {
      console.error('Booking failed:', e);
      setConfirmed(true);
    } finally {
      setLoading(false);
      // 2. Immediately trigger the phone dialer app
      window.location.href = `tel:${ownerPhone}`;
    }
  };

  const getUnitText = (u: string) => {
    if (u === 'hour') return t('perHour');
    if (u === 'acre') return t('perAcre');
    return t('perDay');
  };

  const getUnitName = (u: string) => {
    if (u === 'hour') return 'Hours';
    if (u === 'acre') return 'Acres';
    return 'Days';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-900 my-auto">
        
        {/* Header */}
        <div className="bg-emerald-950 text-white p-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-emerald-100 font-bold flex items-center justify-center text-lg border border-emerald-700/60">
              📞
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight text-white">
                {t('callPrompt')}
              </h2>
              <p className="text-xs text-emerald-300/80 font-medium">
                Direct Farmer Connection & Cost Estimate
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

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Listing Header Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-950 font-extrabold rounded-md border border-emerald-200">
                Base Rate: ₹{basePrice} {getUnitText(unit)}
              </span>
              <span className="flex items-center gap-1 text-slate-700 font-bold">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                {itemVillage}, {district}
              </span>
            </div>

            {/* Distance Badge & Status */}
            <div className="pt-1 flex items-center gap-1.5 text-xs font-bold">
              <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${distanceInfo.badgeBg} ${distanceInfo.badgeTextColor} ${distanceInfo.badgeBorder}`}>
                <span>{distanceInfo.icon}</span>
                <span>{distanceInfo.badgeText}</span>
              </span>
            </div>
          </div>

          {/* Undeliverable Location Banner */}
          {!distanceInfo.isDeliverable && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-extrabold text-sm text-rose-900">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>🔴 Undeliverable Location Banner</span>
              </div>
              <p className="text-xs font-semibold text-rose-800 leading-relaxed">
                Distance between your village (<strong>{activeUserVillage}</strong>) and target village (<strong>{itemVillage}</strong>) is <strong>{distanceInfo.distanceKm} km</strong>, which exceeds the maximum operational delivery threshold of 100 km. Action buttons have been disabled.
              </p>
            </div>
          )}

          {/* Predictive Cost Calculator UI */}
          <div className="p-4 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
              <span className="flex items-center gap-1.5 font-extrabold text-sm text-emerald-950">
                <Calculator className="w-4 h-4 text-emerald-800" />
                Predictive Cost Calculator
              </span>
              <span className="text-xs bg-emerald-800 text-white px-2 py-0.5 rounded-md font-bold">
                Live Calculation
              </span>
            </div>

            {/* Slider & Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <label htmlFor="duration-slider" className="cursor-pointer">
                  Rental Duration ({getUnitName(unit)}):
                </label>
                <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-emerald-300 text-emerald-950 font-extrabold">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 font-mono font-bold text-center outline-none bg-transparent text-sm"
                  />
                  <span>{getUnitName(unit)}</span>
                </div>
              </div>

              {/* Slider Input */}
              <input
                id="duration-slider"
                type="range"
                min="1"
                max="24"
                step="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                className="w-full accent-emerald-800 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
              />

              <div className="flex justify-between text-[11px] text-slate-500 font-semibold px-0.5">
                <span>1 {getUnitName(unit)}</span>
                <span>12 {getUnitName(unit)}</span>
                <span>24 {getUnitName(unit)}</span>
              </div>
            </div>

            {/* Live Estimated Total Cost */}
            <div className="p-3 bg-emerald-900 text-white rounded-xl flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] uppercase font-extrabold text-emerald-300 tracking-wider">
                  Live Estimated Total Cost
                </p>
                <p className="text-xs text-emerald-100 font-medium">
                  ₹{basePrice} × {duration} {getUnitName(unit).toLowerCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black font-mono text-amber-300">
                  ₹{estimatedTotalCost.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs space-y-1">
            <p className="font-bold text-slate-800 text-xs">
              Contact Person: <span className="text-emerald-900 font-extrabold">{ownerName}</span>
            </p>
            <p className="font-mono font-bold text-sm text-slate-900">
              📱 {ownerPhone}
            </p>
          </div>

          {/* Action Button: Single Unified Flow */}
          {confirmed ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-semibold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>{t('successMessage')} Connecting to your phone dialer...</span>
              </div>

              <a
                href={`tel:${ownerPhone}`}
                className="w-full min-h-[48px] bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-base rounded-xl shadow-xs border border-emerald-950 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Phone className="w-5 h-5" />
                <span>Call Farmer Again ({ownerPhone})</span>
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleBookAndCall}
                disabled={loading || !distanceInfo.isDeliverable}
                className={`w-full min-h-[48px] font-bold text-base rounded-xl shadow-xs border flex items-center justify-center gap-2 transition-all ${
                  !distanceInfo.isDeliverable
                    ? 'bg-slate-300 text-slate-500 border-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white border-emerald-950 active:scale-95'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : !distanceInfo.isDeliverable ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>Booking Disabled (Distance &gt; 100 km)</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5 stroke-[2.2]" />
                    <span>Book & Call Farmer (₹{estimatedTotalCost.toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};