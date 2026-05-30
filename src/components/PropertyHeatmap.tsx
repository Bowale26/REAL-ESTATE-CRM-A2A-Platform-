import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { Lead, Listing, Currency } from '../types';
import { formatCurrency } from '../lib/formatters';
import { Map as MapIcon, Sparkles, Filter, Percent, DollarSign, Target, Settings, Layers, RotateCcw } from 'lucide-react';

interface PropertyHeatmapProps {
  leads: Lead[];
  listings: Listing[];
  currency: Currency;
}

interface FarmArea {
  id: string;
  name: string;
  center: google.maps.LatLngLiteral;
  zoom: number;
  description: string;
  marketHealth: string;
  leadCount: number;
}

const FARM_AREAS: FarmArea[] = [
  { 
    id: 'toronto', 
    name: 'Toronto Core (East York)', 
    center: { lat: 43.6841, lng: -79.3132 }, 
    zoom: 12, 
    description: 'High-density urban market with strong demand for single-family estates and dual-income demographics.',
    marketHealth: 'Extremely Bullish',
    leadCount: 42
  },
  { 
    id: 'vancouver', 
    name: 'Vancouver Waterfront', 
    center: { lat: 49.2827, lng: -123.1207 }, 
    zoom: 13, 
    description: 'Ultra-premium waterfront lofts and luxury condominiums bordering Stanley Park.',
    marketHealth: 'Balanced Demand',
    leadCount: 28
  },
  { 
    id: 'new_york', 
    name: 'Manhattan Midtown', 
    center: { lat: 40.7306, lng: -73.9875 }, 
    zoom: 13, 
    description: 'High net-worth buyer pools seeking high-rise penthouse assets and multi-unit investments.',
    marketHealth: 'Strong Seller Favor',
    leadCount: 56
  },
  { 
    id: 'los_angeles', 
    name: 'Los Angeles (Venice Beach)', 
    center: { lat: 33.9850, lng: -118.4695 }, 
    zoom: 13, 
    description: 'Coastal architecture, indoor-outdoor premium estates, high celebrity matching scores.',
    marketHealth: 'Exponential Growth',
    leadCount: 37
  }
];

// Dark theme map style for stunning contrast matching the gold and navy premium look
const MAP_THEME_DARK = [
  { "elementType": "geometry", "stylers": [{ "color": "#0a1120" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0a1120" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8a9ab5" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#c9a84c" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a9ab5" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#0d1b2a" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#606f7b" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#172535" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#1e2d3d" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#52627a" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#233549" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#2c3e50" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#c9a84c" }, { "opacity": 0.8 }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#1e2d3d" }] },
  { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a9ab5" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#060913" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515f72" }] }
];

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function PropertyHeatmap({ leads, listings, currency }: PropertyHeatmapProps) {
  const [selectedFarmArea, setSelectedFarmArea] = useState<FarmArea>(FARM_AREAS[0]);
  const [viewType, setViewType] = useState<'leads' | 'transactions'>('leads');
  const [selectedPin, setSelectedPin] = useState<{
    id: string;
    title: string;
    lat: number;
    lng: number;
    score?: string;
    details: string;
    valueLabel: string;
    type: 'lead' | 'transaction';
  } | null>(null);

  // Sync positions when selection changes
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(selectedFarmArea.center);
  const [mapZoom, setMapZoom] = useState<number>(selectedFarmArea.zoom);

  useEffect(() => {
    setMapCenter(selectedFarmArea.center);
    setMapZoom(selectedFarmArea.zoom);
  }, [selectedFarmArea]);

  const handleResetView = () => {
    setMapCenter(selectedFarmArea.center);
    setMapZoom(selectedFarmArea.zoom);
    setSelectedPin(null);
  };

  // Generate density points coordinates based on selected farm area
  const currentPoints = (() => {
    const isTor = selectedFarmArea.id === 'toronto';
    const isVan = selectedFarmArea.id === 'vancouver';
    const isNY = selectedFarmArea.id === 'new_york';
    const isLA = selectedFarmArea.id === 'los_angeles';

    // Map properties and leads to specific locations in selected farm area + some auxiliary simulated hotspots
    if (viewType === 'leads') {
      return [
        {
          id: 'lpt-1',
          title: isTor ? 'Alex Turner' : isVan ? 'Nicole Park' : isNY ? 'Robert Chen' : 'Gregory Smith',
          lat: selectedFarmArea.center.lat - 0.004,
          lng: selectedFarmArea.center.lng + 0.005,
          score: isTor ? '94%' : isVan ? '87%' : isNY ? '71%' : '91%',
          details: `Active looking for ${isTor ? 'Single Family Home' : isVan ? 'Luxury Condo' : isNY ? 'Townhouse' : 'Beachfront Estate'} with budget limit.`,
          valueLabel: isTor ? '$1.2M' : isVan ? '$850K' : isNY ? '$650K' : '$2.1M',
          type: 'lead' as const
        },
        {
          id: 'lpt-2',
          title: isTor ? 'Sovereign Seller (High Equity)' : 'Premium AI Match',
          lat: selectedFarmArea.center.lat + 0.006,
          lng: selectedFarmArea.center.lng - 0.008,
          score: '98%',
          details: 'Owner interested in listing properties with potential relocation strategy.',
          valueLabel: '$2.4M',
          type: 'lead' as const
        },
        {
          id: 'lpt-3',
          title: 'Immediate Valuation Inquirer',
          lat: selectedFarmArea.center.lat + 0.002,
          lng: selectedFarmArea.center.lng + 0.009,
          score: '84%',
          details: 'Engaged through AI instant CRM evaluation widget.',
          valueLabel: '$1.7M',
          type: 'lead' as const
        }
      ];
    } else {
      // Transactions / actual listing locations
      return [
        {
          id: 'tpt-1',
          title: isTor ? '52 Maple Ave (Sale)' : isVan ? '12-402 Bay St (Closed)' : isNY ? '88 Park Blvd (Closing)' : '1600 Ocean Front Walk',
          lat: selectedFarmArea.center.lat,
          lng: selectedFarmArea.center.lng,
          details: isTor ? 'Completed contract under Agent Alina Vance.' : 'Under high qualification review.',
          valueLabel: isTor ? '$1,240,000' : isVan ? '$890,000' : isNY ? '$2,450,000' : '$4,750,000',
          type: 'transaction' as const
        },
        {
          id: 'tpt-2',
          title: 'Historical Neighborhood Comp A',
          lat: selectedFarmArea.center.lat + 0.01,
          lng: selectedFarmArea.center.lng - 0.004,
          details: 'Comparable MLS verified transaction.',
          valueLabel: isTor ? '$1,080,000' : isVan ? '$920,000' : isNY ? '$1,950,000' : '$3,800,000',
          type: 'transaction' as const
        },
        {
          id: 'tpt-3',
          title: 'Historical Neighborhood Comp B',
          lat: selectedFarmArea.center.lat - 0.008,
          lng: selectedFarmArea.center.lng + 0.007,
          details: 'Recently closed transaction in adjacent grid section.',
          valueLabel: isTor ? '$1,390,000' : isVan ? '$810,000' : isNY ? '$2,200,000' : '$4,150,000',
          type: 'transaction' as const
        }
      ];
    }
  })();

  const [markerRef, marker] = useAdvancedMarkerRef();

  if (!hasValidKey) {
    return (
      <div className="bg-navy-mid border-2 border-gold/20 rounded-2xl p-8 text-center max-w-xl mx-auto flex flex-col items-center justify-center min-h-[360px]" id="property-heatmap-key-required">
        <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30 mb-4 animate-pulse">
           <MapIcon className="w-6 h-6 text-gold" />
        </div>
        <h3 className="text-base font-serif font-bold text-white mb-2">Google Maps Integration Required</h3>
        <p className="text-xs text-slate max-w-md mx-auto leading-relaxed mb-6">
          To visualize search volumes, live lead density and historic transactions in real-time, register your Google Maps Platform credential.
        </p>
        <div className="bg-navy p-4 rounded-xl border border-white/5 text-left w-full space-y-3.5 mb-6">
           <p className="text-[10px] text-slate-light font-bold uppercase tracking-wider">Instructions to proceed:</p>
           <ol className="text-[11px] text-slate space-y-2 list-decimal pl-4 leading-normal">
             <li>Get an API key: <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noreferrer" className="text-gold underline hover:text-gold-light">Create GCP Key</a></li>
             <li>Open AI Studio **Settings** (⚙️ gear icon, top-right of your workspace).</li>
             <li>Select **Secrets**.</li>
             <li>Type <code className="text-gold bg-gold/5 px-1 rounded font-mono">GOOGLE_MAPS_PLATFORM_KEY</code> as secret name and paste your Key value.</li>
           </ol>
        </div>
        <p className="text-[10px] text-slate italic">The interface will instantly mount your neural map upon auto-rebuild.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" id="property-heatmap-panel">
      {/* Top Controller Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center border border-gold/30">
            <MapIcon className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Interactive Property Farm Area Heatmap</h3>
            <p className="text-[9px] text-slate font-bold uppercase tracking-[0.16em] mt-0.5">Sovereign Lead Density & Closed Comp Analytics</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Farm area sector query */}
          <div className="flex items-center bg-navy border border-gold/20 rounded-lg px-2.5 py-1.5 gap-2">
            <Filter className="w-3.5 h-3.5 text-gold" />
            <select 
              value={selectedFarmArea.id}
              onChange={(e) => {
                const found = FARM_AREAS.find(f => f.id === e.target.value);
                if (found) setSelectedFarmArea(found);
              }}
              className="bg-transparent border-none text-xs text-white font-bold uppercase tracking-wider outline-none cursor-pointer"
            >
              {FARM_AREAS.map(f => (
                <option key={f.id} value={f.id} className="bg-navy text-white uppercase font-bold text-[10px]">{f.name}</option>
              ))}
            </select>
          </div>

          {/* Reset View button */}
          <button 
            id="reset-heatmap-view-button"
            onClick={handleResetView}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy border border-white/10 rounded-lg text-[10px] font-bold text-slate uppercase tracking-wider hover:text-gold hover:border-gold/30 transition-all cursor-pointer active:scale-95"
            title="Reset Map to Selected Farm Area Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gold" />
            Reset View
          </button>

          {/* Toggle View mode */}
          <div className="flex items-center bg-navy border border-white/10 rounded-lg p-1">
            <button 
              onClick={() => { setViewType('leads'); setSelectedPin(null); }}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${viewType === 'leads' ? 'bg-gold text-navy shadow-md' : 'text-slate hover:text-white'}`}
            >
              <Target className="w-3 h-3" /> Lead Density
            </button>
            <button 
              onClick={() => { setViewType('transactions'); setSelectedPin(null); }}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${viewType === 'transactions' ? 'bg-gold text-navy shadow-md' : 'text-slate hover:text-white'}`}
            >
              <DollarSign className="w-3 h-3" /> Historic Transactions
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* The Google Map Segment */}
        <div className="w-full h-[400px] border border-gold/18 rounded-xl overflow-hidden relative shadow-2xl bg-navy-mid">
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map 
              center={mapCenter}
              zoom={mapZoom}
              gestureHandling="cooperative"
              disableDefaultUI={true}
              mapId="DASHBOARD_HEATMAP"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              onCenterChanged={(e) => {
                if (e.detail?.center) {
                  setMapCenter(e.detail.center);
                }
              }}
              onZoomChanged={(e) => {
                if (e.detail?.zoom !== undefined) {
                  setMapZoom(e.detail.zoom);
                }
              }}
              styles={MAP_THEME_DARK}
            >
              {/* Heat Density Layers utilizing CSS Glow inside Advanced Markers */}
              {currentPoints.map(point => {
                const isLead = point.type === 'lead';
                return (
                  <AdvancedMarker 
                    key={point.id} 
                    position={{ lat: point.lat, lng: point.lng }}
                    onClick={() => setSelectedPin(point)}
                  >
                    <div className="relative flex items-center justify-center cursor-pointer group">
                      {/* Pulse ring 1 */}
                      <div className={`absolute w-12 h-12 rounded-full animate-ping opacity-25 ${isLead ? 'bg-gold' : 'bg-red-400'}`} />

                      {/* Concentric Glow Gradient for genuine volumetric heat mapping style */}
                      <div className={`absolute w-8 h-8 rounded-full blur-sm opacity-40 ${isLead ? 'bg-gold/60' : 'bg-red-500/60'}`} />

                      {/* Small anchor dot */}
                      <div className={`relative w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 shadow-lg transition-transform hover:scale-125 ${isLead ? 'bg-navy border-gold text-gold text-[8px] font-bold' : 'bg-navy border-red-500 text-red-500 text-[8px] font-bold'}`}>
                         {isLead ? 'L' : '$'}
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Advanced info windows */}
              {selectedPin && (
                <InfoWindow 
                  position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
                  onCloseClick={() => setSelectedPin(null)}
                  maxWidth={280}
                >
                  <div className="text-navy p-1 text-xs">
                     <span className="text-[8px] font-bold uppercase tracking-widest text-slate block mb-1">
                       {selectedPin.type === 'lead' ? '⭐ Qualified Smart Lead' : '🔑 MLS Sold Record'}
                     </span>
                     <div className="font-bold text-navy-mid text-[12px] mb-1">{selectedPin.title}</div>
                     <div className="text-[10px] text-slate-light mb-2">{selectedPin.details}</div>
                     
                     <div className="flex items-center justify-between border-t border-slate/10 pt-1.5 mt-1">
                        <span className="text-[9px] font-serif text-slate uppercase">Median Valuation:</span>
                        <span className="font-bold text-gold text-xs bg-navy p-1 rounded font-mono pl-2 pr-2">{selectedPin.valueLabel}</span>
                     </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>

          {/* Floating Live Legend */}
          <div className="absolute bottom-4 left-4 z-10 bg-navy/90 border border-gold/30 rounded-lg p-3 text-[10px] flex flex-col gap-1.5 backdrop-blur-md shadow-lg font-mono">
            <span className="text-[8px] font-bold text-gold uppercase tracking-wider block mb-0.5">Map Index Analytics</span>
            <span className="flex items-center gap-1.5 text-white/90">
              <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block animate-pulse" /> Lead Heat Center
            </span>
            <span className="flex items-center gap-1.5 text-white/90">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Sold Historical Comp
            </span>
          </div>
        </div>

        {/* Sidebar Demographic Profile Sector */}
        <div className="bg-navy/40 border border-white/5 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Active Farm Index</span>
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{selectedFarmArea.marketHealth}</span>
            </div>
            
            <h4 className="text-base font-bold text-white mb-2">{selectedFarmArea.name}</h4>
            <p className="text-xs text-slate-light leading-relaxed mb-6">{selectedFarmArea.description}</p>

            <div className="space-y-4">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                   <div className="text-[9px] text-slate font-bold uppercase tracking-wider">Estimated Total Leads</div>
                   <div className="text-sm font-semibold text-white mt-1">{selectedFarmArea.leadCount} Primary Targets</div>
                </div>
                <Percent className="w-4 h-4 text-gold opacity-60" />
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                   <div className="text-[9px] text-slate font-bold uppercase tracking-wider">Median Neighborhood Spend</div>
                   <div className="text-sm font-semibold text-white mt-1">
                     {selectedFarmArea.id === 'toronto' ? '$1,190,000' : selectedFarmArea.id === 'vancouver' ? '$850,000' : selectedFarmArea.id === 'new_york' ? '$2,100,000' : '$4,100,000'}
                   </div>
                </div>
                <DollarSign className="w-4 h-4 text-green-400 opacity-60" />
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                   <div className="text-[9px] text-slate font-bold uppercase tracking-wider">A2A Engagement Yield</div>
                   <div className="text-sm font-semibold text-white mt-1">84% Success Rating</div>
                </div>
                <Sparkles className="w-4 h-4 text-gold opacity-60" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate leading-normal italic text-center">
             Select localized quadrants on the map matrix to examine granular comp statistics.
          </div>
        </div>
      </div>
    </div>
  );
}
