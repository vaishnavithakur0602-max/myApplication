import { useEffect, useRef, useState, useCallback } from 'react';
import { NABHBadge, GeoTierBadge, Toast } from '../components/Badges';
import { hospitals, getGeoTier } from '../data/hospitals';
import { formatRupee } from '../hooks/useAnimations';

interface HospitalMapProps {
  userLocation: { lat: number; lon: number } | null;
  onLocationDetected: (lat: number, lon: number, city: string, tier: "Metro" | "Tier-2" | "Tier-3") => void;
  onSelectHospital: (name: string, tier: string) => void;
}

type FilterType = 'all' | 'Premium' | 'Mid-Tier' | 'Govt' | 'pmjay' | 'cghs';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HospitalMap({ userLocation, onLocationDetected, onSelectHospital }: HospitalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [toastMsg, setToastMsg] = useState('');
  const [nearbyHospitals, setNearbyHospitals] = useState<(typeof hospitals[number] & { distance: number })[]>([]);

  const tierColors: Record<string, string> = {
    Premium: '#991B1B',
    'Mid-Tier': '#2563EB',
    Govt: '#2D6A4F',
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = L.map('curify-map').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add hospital markers
    hospitals.forEach(h => {
      const color = tierColors[h.tier] || '#6B7280';
      const marker = L.circleMarker([h.lat, h.lon], {
        radius: h.tier === 'Premium' ? 8 : 7,
        fillColor: color,
        fillOpacity: 0.85,
        color: 'white',
        weight: 2,
      }).addTo(map);

      const popupContent = `
        <div style="padding:14px;font-family:'DM Sans',sans-serif;min-width:240px">
          <p style="font-size:15px;font-weight:600;color:#0B1F3A;margin:0 0 6px">${h.name}</p>
          <p style="font-size:12px;color:#6B7280;margin:0 0 8px">${h.city}</p>
          <div style="margin-bottom:8px">
            <span style="display:inline-block;font-size:10px;padding:2px 8px;border-radius:999px;margin-right:4px;
              background:${h.tier === 'Premium' ? '#FEE2E2' : h.tier === 'Mid-Tier' ? '#EFF6FF' : '#DCFCE7'};
              color:${h.tier === 'Premium' ? '#991B1B' : h.tier === 'Mid-Tier' ? '#1E3A5F' : '#2D6A4F'}">
              ${h.tier}
            </span>
            <span style="display:inline-block;font-size:10px;padding:2px 8px;border-radius:999px;margin-right:4px;
              background:${h.pmjay ? '#DCFCE7' : '#F3F4F1'};color:${h.pmjay ? '#2D6A4F' : '#6B7280'}">
              PM-JAY: ${h.pmjay ? 'Yes' : 'No'}
            </span>
            <span style="display:inline-block;font-size:10px;padding:2px 8px;border-radius:999px;
              background:${h.cghs ? '#EFF6FF' : '#F3F4F1'};color:${h.cghs ? '#1E3A5F' : '#6B7280'}">
              CGHS: ${h.cghs ? 'Yes' : 'No'}
            </span>
          </div>
          <p style="font-family:'IBM Plex Mono',monospace;font-size:13px;color:#0B1F3A;margin:0 0 10px">
            Knee: ₹${h.kneeMin.toLocaleString('en-IN')} – ₹${h.kneeMax.toLocaleString('en-IN')}
          </p>
          <button onclick="window.__curifySelectHospital && window.__curifySelectHospital('${h.name}','${h.tier}')"
            style="width:100%;padding:8px 12px;background:#2D6A4F;color:white;border:none;border-radius:6px;
            font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:opacity 0.2s"
            onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            Use for Cost Estimate
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, { className: 'curify-popup', maxWidth: 280 });
      markersRef.current.push({ marker, hospital: h });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Set up global callback for hospital selection
  useEffect(() => {
    (window as any).__curifySelectHospital = (name: string, tier: string) => {
      onSelectHospital(name, tier);
    };
    return () => { delete (window as any).__curifySelectHospital; };
  }, [onSelectHospital]);

  // Handle user location marker and fly-to
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;
    const L = (window as any).L;

    map.flyTo([userLocation.lat, userLocation.lon], 13, { duration: 1.5 });

    const userIcon = L.divIcon({
      className: '',
      html: `<div style="width:20px;height:20px;border-radius:50%;background:#2D6A4F;border:3px solid white;box-shadow:0 0 0 6px rgba(45,106,79,0.25);animation:user-pulse 2s ease-out infinite"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
      .addTo(map)
      .bindPopup('You are here');

    // Calculate nearby hospitals
    const withDist = hospitals.map(h => ({
      ...h,
      distance: getDistance(userLocation.lat, userLocation.lon, h.lat, h.lon),
    })).sort((a, b) => a.distance - b.distance);

    setNearbyHospitals(withDist.slice(0, 5));
  }, [userLocation]);

  // Handle filter
  useEffect(() => {
    markersRef.current.forEach(({ marker, hospital }) => {
      let show = false;
      if (filter === 'all') show = true;
      else if (filter === 'pmjay') show = hospital.pmjay;
      else if (filter === 'cghs') show = hospital.cghs;
      else show = hospital.tier === filter;

      if (show) {
        if (!mapInstanceRef.current?.hasLayer(marker)) marker.addTo(mapInstanceRef.current);
      } else {
        if (mapInstanceRef.current?.hasLayer(marker)) marker.remove();
      }
    });
  }, [filter]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setToastMsg('Location access denied. Please enter city manually.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.state || 'Unknown';
          const tier = getGeoTier(city);
          onLocationDetected(pos.coords.latitude, pos.coords.longitude, city, tier);
          setToastMsg(`Location detected: ${city} · ${tier} pricing applied`);
        } catch {
          setToastMsg('Could not determine location. Please try again.');
        }
      },
      () => setToastMsg('Location access denied. Please enter city manually.')
    );
  }, [onLocationDetected]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Hospitals' },
    { key: 'Premium', label: 'Premium' },
    { key: 'Mid-Tier', label: 'Mid-Tier' },
    { key: 'Govt', label: 'Govt/NABH' },
    { key: 'pmjay', label: 'PM-JAY Empanelled' },
    { key: 'cghs', label: 'CGHS' },
  ];

  return (
    <div className="py-8 px-4 md:px-8" style={{ background: '#F7F9F8' }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="font-playfair text-[28px] mb-2" style={{ color: '#0B1F3A' }}>Find Hospitals Near You</h2>
        <p className="font-dm text-[14px] mb-6" style={{ color: '#6B7280' }}>
          Real NABH-accredited hospitals with PM-JAY & CGHS empanelment status
        </p>

        <button onClick={detectLocation}
          className="btn-hover font-dm text-[14px] px-5 py-2.5 rounded-lg mb-6"
          style={{ background: '#2D6A4F', color: 'white' }}>
          Detect My Location
        </button>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="chip-hover font-dm text-[12px] px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: filter === f.key ? '#2D6A4F' : 'white',
                color: filter === f.key ? 'white' : '#6B7280',
                border: `1px solid ${filter === f.key ? '#2D6A4F' : '#E2E4DF'}`,
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Map Legend */}
        <div className="flex items-center gap-5 mb-4">
          {[
            { color: '#991B1B', label: 'Premium' },
            { color: '#2D6A4F', label: 'Govt/NABH' },
            { color: '#2563EB', label: 'PM-JAY Empanelled' },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: l.color }}/>
              <span className="font-dm text-[11px]" style={{ color: '#6B7280' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <div id="curify-map" ref={mapRef}
          className="w-full rounded-2xl overflow-hidden border"
          style={{
            height: window.innerWidth < 768 ? 280 : 420,
            border: '1px solid #E2E4DF',
            boxShadow: '0 8px 32px rgba(11,31,58,0.12)',
          }}/>

        {/* Nearby Hospitals List */}
        {nearbyHospitals.length > 0 && (
          <div className="mt-6">
            <h3 className="font-dm text-[13px] font-semibold mb-3" style={{ color: '#0B1F3A' }}>Nearest Hospitals</h3>
            <div className="space-y-3">
              {nearbyHospitals.map((h, i) => (
                <div key={i}
                  className="bg-white rounded-xl p-4 border card-hover"
                  style={{ borderColor: '#E2E4DF' }}
                  onClick={() => onSelectHospital(h.name, h.tier)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-dm text-[14px] font-semibold" style={{ color: '#0B1F3A' }}>{h.name}</p>
                      <p className="font-dm text-[12px]" style={{ color: '#6B7280' }}>{h.city}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <GeoTierBadge tier={getGeoTier(h.city)} />
                        {h.nabh && <NABHBadge />}
                        {h.pmjay && (
                          <span className="font-dm text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: '#DCFCE7', color: '#2D6A4F' }}>PM-JAY</span>
                        )}
                        {h.cghs && (
                          <span className="font-dm text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: '#EFF6FF', color: '#1E3A5F' }}>CGHS</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[13px] font-semibold" style={{ color: '#2D6A4F' }}>
                        {h.distance.toFixed(1)} km
                      </p>
                      <p className="font-mono text-[12px]" style={{ color: '#6B7280' }}>
                        {formatRupee(h.kneeMin)} – {formatRupee(h.kneeMax)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Toast message={toastMsg} visible={!!toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}
