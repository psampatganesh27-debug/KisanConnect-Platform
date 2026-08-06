import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Category } from '../types';
import { X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PostRequestModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { t, user, setLoginModalOpen } = useLanguage();

  const [category, setCategory] = useState<Category>('harvester');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [offeredRate, setOfferedRate] = useState('');
  const [unitType, setUnitType] = useState<'hour' | 'acre' | 'day'>('acre');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [requesterName, setRequesterName] = useState(user?.name || '');
  const [requesterPhone, setRequesterPhone] = useState(user?.phone || '');
  const [village, setVillage] = useState(user?.village || '');
  const [district, setDistrict] = useState(user?.district || 'Central District');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const categoriesList: { key: Category; labelKey: any; icon: string }[] = [
    { key: 'tractor', labelKey: 'categoryTractor', icon: '🚜' },
    { key: 'harvester', labelKey: 'categoryHarvester', icon: '🌾' },
    { key: 'seeder', labelKey: 'categorySeeder', icon: '🌱' },
    { key: 'labor', labelKey: 'categoryLabor', icon: '👨‍🌾' },
    { key: 'sprayer', labelKey: 'categorySprayer', icon: '💦' },
    { key: 'drone', labelKey: 'categoryDrone', icon: '🚁' },
    { key: 'irrigation', labelKey: 'categoryIrrigation', icon: '🚰' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

    if (!title.trim() || !offeredRate || !village.trim() || !requesterPhone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          requesterName: requesterName || user.name,
          requesterPhone: requesterPhone || user.phone,
          category,
          title,
          description,
          offeredRate: Number(offeredRate),
          unitType,
          workDate,
          village: village || user.village,
          district: district || user.district || 'Local District'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post requirement');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error publishing requirement');
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
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-emerald-100 font-bold flex items-center justify-center text-lg border border-emerald-700/60">
              🙋‍♂️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight text-white">
                {t('postNeedTitle')}
              </h2>
              <p className="text-xs text-emerald-300/80 font-medium">
                Post requirement to get machine operators & labor near you
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              {t('filterCategory')} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {categoriesList.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`px-2.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 min-h-[40px] transition-all ${
                    category === c.key
                      ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">{c.icon}</span>
                  <span className="truncate">{t(c.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              {t('titleLabel')} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholderNeed')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl font-bold text-sm text-slate-900 min-h-[44px] outline-none"
            />
          </div>

          {/* Offered Rate & Unit */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Offered Rate (₹) *
              </label>
              <input
                type="number"
                min="0"
                value={offeredRate}
                onChange={(e) => setOfferedRate(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl font-mono font-bold text-base text-slate-900 min-h-[44px] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                {t('unitTypeLabel')} *
              </label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl font-bold text-sm text-slate-900 min-h-[44px] outline-none"
              >
                <option value="acre">{t('perAcre')}</option>
                <option value="hour">{t('perHour')}</option>
                <option value="day">{t('perDay')}</option>
              </select>
            </div>
          </div>

          {/* Work Date & Requester Info */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                {t('dateLabel')} *
              </label>
              <input
                type="date"
                required
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl font-semibold text-xs text-slate-900 min-h-[40px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                My Phone *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={requesterPhone}
                onChange={(e) => setRequesterPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Mobile Number"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl font-mono font-semibold text-xs text-slate-900 min-h-[40px]"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                {t('village')} *
              </label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Village"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl font-semibold text-xs text-slate-900 min-h-[40px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                {t('district')}
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="District"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl font-semibold text-xs text-slate-900 min-h-[40px]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              {t('descriptionLabel')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl font-medium text-xs text-slate-900 outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-base rounded-xl shadow-xs border border-emerald-950 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{t('postRequirement')}</span>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
