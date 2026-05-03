import { useState, useCallback } from 'react';
import LandingPage from './views/LandingPage';
import PatientView from './views/PatientView';
import LenderView from './views/LenderView';
import HospitalMap from './views/HospitalMap';

type View = 'landing' | 'patient' | 'lender' | 'map';

function NavBar({ current, onNavigate }: { current: View; onNavigate: (v: View) => void }) {
  const links: { key: View; label: string }[] = [
    { key: 'landing', label: 'Home' },
    { key: 'patient', label: 'Patient' },
    { key: 'lender', label: 'Lender' },
    { key: 'map', label: 'Find Hospitals' },
  ];

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
      style={{ background: current === 'landing' ? 'transparent' : '#0B1F3A', borderBottom: current === 'landing' ? 'none' : '1px solid rgba(168,213,186,0.15)' }}>
      <button onClick={() => onNavigate('landing')} className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#A8D5BA" strokeWidth="2" fill="none"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#A8D5BA" strokeWidth="2" fill="none"/>
        </svg>
        <span className="font-playfair text-[18px] text-white">CURIFY</span>
      </button>
      <div className="flex items-center gap-1">
        {links.map(l => (
          <button key={l.key} onClick={() => onNavigate(l.key)}
            className="font-dm text-[13px] px-3 py-1.5 rounded-lg transition-colors btn-hover"
            style={{
              background: current === l.key ? 'rgba(45,106,79,0.2)' : 'transparent',
              color: current === l.key ? '#A8D5BA' : 'rgba(255,255,255,0.6)',
            }}>
            {l.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function App() {
  const [view, setView] = useState<View>('landing');
  const [searchQuery, setSearchQuery] = useState('Knee Replacement');
  const [geoTier, setGeoTier] = useState<"Metro" | "Tier-2" | "Tier-3">("Metro");
  const [location, setLocation] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const handleNavigate = useCallback((v: string) => {
    setView(v as View);
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setView('patient');
  }, []);

  const handleLocationDetected = useCallback((lat: number, lon: number, city: string, tier: "Metro" | "Tier-2" | "Tier-3") => {
    setUserLocation({ lat, lon });
    setLocation(city);
    setGeoTier(tier);
  }, []);

  const handleSelectHospital = useCallback((name: string) => {
    setSearchQuery(name);
    setView('patient');
  }, []);

  return (
    <div className="min-h-screen">
      {view !== 'landing' && <NavBar current={view} onNavigate={handleNavigate} />}

      {view === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {view === 'patient' && (
        <PatientView onNavigate={handleNavigate} onSearch={handleSearch} searchQuery={searchQuery} />
      )}
      {view === 'lender' && (
        <LenderView onNavigate={handleNavigate} searchQuery={searchQuery} geoTier={geoTier} location={location} />
      )}
      {view === 'map' && (
        <HospitalMap
          userLocation={userLocation}
          onLocationDetected={handleLocationDetected}
          onSelectHospital={handleSelectHospital}
        />
      )}
    </div>
  );
}

export default App;
