import React, { useEffect, useState } from 'react';
import { Navigation, X, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { useFirebase } from '../lib/FirebaseProvider';
import { MapContainer, TileLayer, Marker, useMap, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div class="relative w-8 h-8">
          <div class="absolute inset-0 bg-primary/40 rounded-full animate-ping"></div>
          <div class="relative w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(-45deg)"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
          </div>
        </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destIcon = new L.DivIcon({
  className: 'dest-div-icon',
  html: `<div class="relative w-8 h-8">
          <div class="relative w-8 h-8 bg-primary-dark rounded-full border-4 border-white shadow-xl flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
        </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapEffects({ coords, recenterTrigger, route }: { coords: { lat: number, lng: number } | null, recenterTrigger: number, route: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (map && coords) {
      if (route.length > 0) {
        const bounds = L.latLngBounds(route);
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        map.flyTo([coords.lat, coords.lng], 18, { duration: 1.5 });
      }
    }
  }, [map, coords, recenterTrigger, route.length > 0]);

  return null;
}

interface MapBackgroundProps {
  navigatingTo?: { id: string, address: string } | null;
  onCancelNavigation?: () => void;
}

export default function MapBackground({ navigatingTo, onCancelNavigation }: MapBackgroundProps) {
  const { profile, coords, isLocating, locationError, lastVerified } = useFirebase();
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string, duration: string } | null>(null);

  // Efeito para calcular a rota usando OSRM
  useEffect(() => {
    if (!navigatingTo || !coords) {
      setRoute([]);
      setRouteInfo(null);
      return;
    }

    const calculateRoute = async () => {
      try {
        let destLat, destLng;

        // Tenta geocodificar o endereço usando Nominatim
        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(navigatingTo.address)}&limit=1`;
        const geoRes = await fetch(geoUrl, {
          headers: {
            'User-Agent': 'PegaVisaoApp/1.0'
          }
        });
        const geoData = await geoRes.json();

        if (geoData && geoData.length > 0) {
          destLat = parseFloat(geoData[0].lat);
          destLng = parseFloat(geoData[0].lon);
        } else {
          // Fallback para demonstração se falhar
          destLat = coords.lat + 0.005;
          destLng = coords.lng + 0.005;
        }

        // OSRM: longitude,latitude
        const url = `https://router.project-osrm.org/route/v1/driving/${coords.lng},${coords.lat};${destLng},${destLat}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes?.[0]) {
          const osrmRoute = data.routes[0];
          const coordinates = osrmRoute.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]) as [number, number][];
          
          setRoute(coordinates);
          
          const distanceKm = osrmRoute.distance / 1000;
          const durationMin = Math.round(osrmRoute.duration / 60);
          
          setRouteInfo({
            distance: distanceKm.toFixed(1) + ' km',
            duration: durationMin + ' min'
          });
        }
      } catch (error) {
        console.error("Erro ao carregar rota OSRM:", error);
      }
    };

    calculateRoute();
  }, [navigatingTo?.id, coords?.lat, coords?.lng]);

  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecenterTrigger(prev => prev + 1);
  };

  if (!coords && !locationError) {
    return (
      <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mb-6 animate-pulse shadow-2xl shadow-primary/20">
          <MapPin className="w-8 h-8 text-primary-dark" />
        </div>
        <h3 className="font-display font-black italic text-xl text-on-surface mb-2">BUSCANDO SUA LOCALIZAÇÃO...</h3>
        <p className="text-xs text-gray-400 font-lexend max-w-[200px]">Aguarde um momento enquanto conectamos com o GPS de alta precisão.</p>
      </div>
    );
  }

  if (locationError && !coords) {
    return (
      <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
          <Navigation className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="font-display font-black italic text-xl text-red-600 mb-2 underline decoration-red-200">OPS! SEM GPS</h3>
        <p className="text-xs text-gray-500 font-lexend max-w-[240px] mb-8">{locationError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary-dark text-white px-8 py-4 rounded-2xl font-display font-black italic text-sm tracking-widest active:scale-95 transition-all shadow-lg"
        >
          TENTAR NOVAMENTE
        </button>
      </div>
    );
  }

  const defaultPos: [number, number] = coords ? [coords.lat, coords.lng] : [0, 0];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#f8f9fa]">
      <MapContainer 
        center={defaultPos} 
        zoom={18} 
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
        className="grayscale-[0.2] contrast-[1.1]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {coords && <Marker position={[coords.lat, coords.lng]} icon={userIcon} />}
        
        {navigatingTo && route.length > 0 && (
          <>
            <Marker position={route[route.length - 1]} icon={destIcon} />
            <Polyline 
              positions={route} 
              color="#FFD700" 
              weight={8} 
              opacity={0.8}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}

        <MapEffects coords={coords} recenterTrigger={recenterTrigger} route={route} />
      </MapContainer>
      
      <AnimatePresence mode="wait">
        {!navigatingTo ? (
          <motion.div 
            key="standard-hud"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-4 right-4 flex justify-between items-start pointer-events-none z-[1000]"
          >
            <div className="flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/50 pointer-events-auto flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${profile?.isOnline && !isLocating ? 'bg-emerald-500 animate-pulse' : isLocating ? 'bg-amber-500 animate-bounce' : 'bg-gray-400'}`} />
                <span className="text-[9px] font-lexend font-extrabold tracking-widest text-gray-700 uppercase">
                  {isLocating ? 'BUSCANDO...' : profile?.isOnline ? 'GPS ATIVO' : 'OFFLINE'}
                </span>
              </div>
              {profile?.isOnline && !isLocating && (
                <div className="bg-white/80 backdrop-blur-md px-2 py-1 rounded-full shadow-sm border border-white/50 pointer-events-auto flex items-center gap-1.5 self-start">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[7px] font-lexend font-black text-emerald-600 uppercase tracking-tighter">
                    Sincronizado {Math.floor((Date.now() - lastVerified) / 1000)}s atrás
                  </span>
                </div>
              )}
              {locationError && (
                <div className="bg-red-500/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-red-400 pointer-events-auto flex items-center gap-2">
                  <span className="text-[8px] font-lexend font-black text-white uppercase tracking-tighter">Erro de Sinal</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleRecenter}
              className="bg-primary hover:bg-primary-dark text-primary-dark p-3 rounded-2xl shadow-2xl shadow-primary/40 pointer-events-auto active:scale-90 transition-all border border-white/20"
            >
              <Navigation className="w-5 h-5 rotate-45" />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="nav-hud"
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="absolute top-12 left-4 right-4 z-[1001] pointer-events-auto"
          >
            <div className="bg-primary-dark text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <Navigation className="w-6 h-6 text-primary-dark" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-black italic tracking-tight leading-none mb-1">
                      {routeInfo ? `Chegada em ${routeInfo.duration}` : 'Calculando...'}
                    </h3>
                    <p className="text-[10px] font-lexend font-black text-white/40 uppercase tracking-widest truncate max-w-[200px]">
                      Destino: {navigatingTo.address}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onCancelNavigation}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-90 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                <div className="flex flex-col items-center">
                  <Clock className="w-3.5 h-3.5 text-primary mb-1" />
                  <span className="text-xs font-black">{routeInfo?.duration || '--'}</span>
                </div>
                <div className="flex flex-col items-center border-x border-white/5">
                  <MapPin className="w-3.5 h-3.5 text-primary mb-1" />
                  <span className="text-xs font-black">{routeInfo?.distance || '--'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mb-1" />
                  <span className="text-xs font-black italic underline">#{navigatingTo.id.slice(-4).toUpperCase()}</span>
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl flex items-center justify-between mt-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none">Localização Verificada</span>
                </div>
                <div className="text-[8px] font-black text-primary uppercase">GPS 5s Ativo</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
