import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Lock, User, MapPin, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { loginModalOpen, setLoginModalOpen, setUser, t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  if (!loginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!pin || pin.trim().length !== 4) {
      setError('PIN must be exactly 4 numeric digits');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!village.trim()) {
        setError('Please enter your village name');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const bodyData = mode === 'login' 
        ? { phone, pin }
        : { phone, pin, name, village, district: district || 'Local District' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccess(mode === 'login' ? 'Logged in successfully!' : 'Account registered successfully!');
      setUser(data.user);
      
      setTimeout(() => {
        setLoginModalOpen(false);
        setPhone('');
        setPin('');
        setName('');
        setVillage('');
        setError(null);
        setSuccess(null);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-900">
        
        {/* Modal Header */}
        <div className="bg-emerald-950 text-white p-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-emerald-100 font-bold flex items-center justify-center text-lg border border-emerald-700/60">
              🆔
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                {mode === 'login' ? t('loginTitle') : t('registerTitle')}
              </h2>
              <p className="text-xs text-emerald-300/80 font-medium">
                KisanConnect • Quick PIN Access
              </p>
            </div>
          </div>
          <button
            onClick={() => setLoginModalOpen(false)}
            className="w-9 h-9 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 rounded-xl flex items-center justify-center border border-emerald-700/60 active:scale-95 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Registration Extra Fields */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                  {t('fullName')} *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 min-h-[44px] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                    {t('villageName')} *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder={t('villagePlaceholder')}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 min-h-[44px] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                    {t('districtName')}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={t('districtPlaceholder')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl text-sm font-semibold text-slate-900 min-h-[44px] outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              {t('mobileNumber')} *
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder={t('mobilePlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl text-base font-mono font-bold text-slate-900 tracking-wider min-h-[44px] outline-none"
              />
            </div>
          </div>

          {/* 4-Digit PIN */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              {t('pinCode')} *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder={t('pinPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl text-lg font-mono font-bold text-slate-900 tracking-widest min-h-[44px] outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              🔒 Safe 4-digit PIN access. No password needed.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-base rounded-xl shadow-xs border border-emerald-950 flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{mode === 'login' ? t('submitLogin') : t('submitRegister')}</span>
            )}
          </button>

          {/* Mode Switcher */}
          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
                setSuccess(null);
              }}
              className="text-emerald-800 font-bold text-xs hover:underline p-2 min-h-[40px]"
            >
              {mode === 'login' ? t('noAccount') : t('haveAccount')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
