import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { HeroDashboard } from './components/HeroDashboard';
import { AuthModal } from './components/AuthModal';
import { DynamicListingModal, FormMode } from './components/DynamicListingModal';
import { BookingModal } from './components/BookingModal';
import { MatchesSlideOver } from './components/MatchesSlideOver';
import { AdminDashboard } from './components/AdminDashboard';
import { MatchedListing } from './utils/matchingService';
import { EquipmentListing, LaborRequest } from './types';
import { Smartphone, ShieldCheck, Lock } from 'lucide-react';

function MainApp() {
  const { t, user } = useLanguage();

  // Hidden /admin routing state
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#admin';
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminView(window.location.pathname === '/admin' || window.location.hash === '#admin');
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminView(true);
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setIsAdminView(false);
  };

  const [dynamicModalOpen, setDynamicModalOpen] = useState(false);
  const [dynamicModalMode, setDynamicModalMode] = useState<FormMode>('have');

  const [selectedListing, setSelectedListing] = useState<EquipmentListing | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LaborRequest | null>(null);
  const [activeUserVillage, setActiveUserVillage] = useState<string>('Rampur');
  const [bookingOpen, setBookingOpen] = useState(false);

  // Top 3 Matches Slide-Over Panel state
  const [matchesOpen, setMatchesOpen] = useState(false);
  const [currentMatches, setCurrentMatches] = useState<MatchedListing[]>([]);
  const [matchSource, setMatchSource] = useState<'python_ml' | 'js_fallback'>('python_ml');
  const [submittedTitle, setSubmittedTitle] = useState('');
  const [submittedVillage, setSubmittedVillage] = useState('Rampur');

  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenNeedModal = () => {
    setDynamicModalMode('need');
    setDynamicModalOpen(true);
  };

  const handleOpenHaveModal = () => {
    setDynamicModalMode('have');
    setDynamicModalOpen(true);
  };

  const handleSelectBooking = (
    listing: EquipmentListing | null,
    request: LaborRequest | null,
    villageOverride?: string
  ) => {
    setSelectedListing(listing);
    setSelectedRequest(request);
    if (villageOverride) {
      setActiveUserVillage(villageOverride);
    }
    setBookingOpen(true);
  };

  const handleModalSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleMatchesFound = (
    matches: MatchedListing[],
    source: 'python_ml' | 'js_fallback',
    title: string,
    village: string
  ) => {
    setCurrentMatches(matches);
    setMatchSource(source);
    setSubmittedTitle(title);
    setSubmittedVillage(village);
    if (user?.village) {
      setActiveUserVillage(user.village);
    }
    setMatchesOpen(true);
  };

  if (isAdminView) {
    return <AdminDashboard onGoBack={navigateToHome} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-emerald-200 selection:text-emerald-950 w-full max-w-full overflow-x-hidden">
      
      <div className="w-full max-w-full overflow-x-hidden">
        {/* Navigation Bar */}
        <Header />

        {/* Main Content Dashboard */}
        <main className="mt-1 w-full max-w-full">
          <HeroDashboard
            key={refreshKey}
            onOpenNeedModal={handleOpenNeedModal}
            onOpenHaveModal={handleOpenHaveModal}
            onSelectBooking={handleSelectBooking}
          />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-6 px-3 sm:px-4 mt-8 w-full max-w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs font-semibold">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-100 font-bold flex items-center justify-center text-base border border-emerald-700/50 shrink-0">
              🚜
            </div>
            <div>
              <p className="text-white text-sm font-bold">{t('appName')}</p>
              <p className="text-[11px] text-emerald-400/80">{t('tagline')}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              PWA Ready
            </span>
            <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Direct Phone Call
            </span>
            <button
              onClick={navigateToAdmin}
              className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
              title="Admin Monitoring Panel"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Admin</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            KisanConnect • Rural Farmers & Equipment Operators
          </p>
        </div>
      </footer>

      {/* Modals Shell */}
      <AuthModal />

      {/* Dynamic Unified Listing / Need Form Modal */}
      <DynamicListingModal
        isOpen={dynamicModalOpen}
        initialMode={dynamicModalMode}
        onClose={() => setDynamicModalOpen(false)}
        onSuccess={handleModalSuccess}
        onMatchesFound={handleMatchesFound}
      />

      {/* Booking & Call Modal with Predictive Calculator and Distance Badges */}
      <BookingModal
        listing={selectedListing}
        request={selectedRequest}
        currentUserVillage={activeUserVillage}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />

      {/* Top 3 Local Matches Slide-Over Panel */}
      <MatchesSlideOver
        isOpen={matchesOpen}
        onClose={() => setMatchesOpen(false)}
        matches={currentMatches}
        submittedListingTitle={submittedTitle}
        submittedVillage={submittedVillage}
        matchSource={matchSource}
        userVillage={activeUserVillage}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
