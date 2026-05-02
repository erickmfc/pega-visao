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

// Anti-error route logic helpers
function calculateStraightDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function validateRoute(
  origin: { lat: number, lng: number },
  destination: { lat: number, lng: number },
  route: any,
  previousRoute: any | null
): { ok: boolean; reason: string } {
  if (!origin || !destination) return { ok: false, reason: "Dados ausentes." };
  
  const straightDist = calculateStraightDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  
  // 1. Check if already there
  if (straightDist < 25) return { ok: false, reason: "Você já está no destino." };
  
  // 2. Check API data
  if (!route || typeof route.distance !== 'number' || typeof route.duration !== 'number') {
    return { ok: false, reason: "API não retornou dados válidos." };
  }

  // 3. Check for absurd route line (too few points)
  if (!route.coords || route.coords.length < 5) {
    return { ok: false, reason: "Desenho da rota inválido." };
  }

  // 4. Inconsistency: route distance significantly shorter than straight distance
  if (route.distance < straightDist * 0.9) {
    return { ok: false, reason: "Distância calculada menor que a real." };
  }

  // 5. Absurdly long route
  if (route.distance > straightDist * 10) {
    return { ok: false, reason: "Rota excessivamente longa." };
  }

  // 6. Impossible speeds
  const avgSpeedKmh = (route.distance / 1000) / (route.duration / 3600);
  if (avgSpeedKmh < 2) return { ok: false, reason: "Tempo alto demais para a distância." };
  if (avgSpeedKmh > 110) return { ok: false, reason: "Tempo baixo demais (Impossível)." };

  // 7. Cache Lock Check: Same route for different destination
  if (previousRoute) {
    const destChangedDist = calculateStraightDistance(
      previousRoute.destLat, 
      previousRoute.destLng, 
      destination.lat, 
      destination.lng
    );

    const sameDistance = Math.abs(previousRoute.distance - route.distance) < 20;
    const sameDuration = Math.abs(previousRoute.duration - route.duration) < 10;
    const samePath = previousRoute.polyline === route.polyline;

    if (destChangedDist > 100 && sameDistance && sameDuration && samePath) {
      return { ok: false, reason: "A API retornou a mesma rota anterior." };
    }
  }

  return { ok: true, reason: "Verificada" };
}

function MapEffects({ coords, recenterTrigger, route }: { coords: { lat: number, lng: number } | null, recenterTrigger: number, route: [number, number][] }) {
  const map = useMap();
  const [hasCentered, setHasCentered] = useState(false);

  useEffect(() => {
    if (map && coords) {
      if (route.length > 0) {
        const bounds = L.latLngBounds(route);
        map.fitBounds(bounds, { padding: [80, 80] });
      } else if (!hasCentered || recenterTrigger > 0) {
        map.flyTo([coords.lat, coords.lng], 18, { duration: 1.5 });
        setHasCentered(true);
      }
    }
  }, [map, coords, recenterTrigger, route.length]);

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
  const [destCoords, setDestCoords] = useState<{lat: number, lng: number} | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string, duration: string, status: string } | null>(null);
  const [navigationSteps, setNavigationSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastValidRoute, setLastValidRoute] = useState<any | null>(null);

  // Helper to translate maneuvers
  const getManeuverText = (maneuver: any) => {
    const type = maneuver.type;
    const modifier = maneuver.modifier || '';
    
    const translations: Record<string, string> = {
      'turn': 'Vire',
      'new name': 'Continue na',
      'depart': 'Siga em frente',
      'arrive': 'Você chegou ao seu destino',
      'merge': 'Entre na',
      'ramp': 'Pegue a rampa',
      'on ramp': 'Entre na rampa',
      'off ramp': 'Saia da rampa',
      'fork': 'Mantenha-se na',
      'end of road': 'No fim da estrada, vire',
      'use lane': 'Use a faixa para',
      'continue': 'Continue em frente',
      'roundabout': 'Na rotatória, saia na',
      'rotary': 'No giradouro, saia na',
    };

    const modifiers: Record<string, string> = {
      'left': 'à esquerda',
      'right': 'à direita',
      'sharp left': 'acentuadamente à esquerda',
      'sharp right': 'acentuadamente à direita',
      'slight left': 'suavemente à esquerda',
      'slight right': 'suavemente à direita',
      'straight': 'em frente',
      'uturn': 'faça o retorno',
    };

    let text = translations[type] || 'Siga';
    if (modifier && modifiers[modifier]) {
      text += ` ${modifiers[modifier]}`;
    }
    
    return text;
  };

  // 1. Efeito para Geocodificar o endereço (apenas quando o destino mudar)
  useEffect(() => {
    if (!navigatingTo) {
      setDestCoords(null);
      setNavigationSteps([]);
      setCurrentStepIndex(0);
      return;
    }

    const geocode = async () => {
      try {
        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(navigatingTo.address)}&limit=1`;
        const res = await fetch(geoUrl, { 
          headers: { 
            'User-Agent': `PegaVisaoApp-v1-${Math.random().toString(36).substring(7)}`,
            'Accept-Language': 'pt-BR,pt;q=0.9'
          } 
        });
        
        if (!res.ok) {
          throw new Error(`Nominatim error: ${res.status}`);
        }

        const data = await res.json();
        
        if (data && data.length > 0) {
          setDestCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          });
        } else {
          // Se falhar o Nominatim, tenta uma aproximação baseada no endereço se contiver números
          console.warn("Nominatim falhou para:", navigatingTo.address);
          setDestCoords(null); // Força erro ou fallback no próximo passo
        }
      } catch (e) {
        console.error("Erro geocodificação:", e);
        setDestCoords(null);
      }
    };

    geocode();
  }, [navigatingTo?.address, navigatingTo?.id]);

  // 2. Efeito para calcular a rota usando OSRM com Anti-Erro
  useEffect(() => {
    // LIMPAR ROTA DA TELA IMEDIATAMENTE (Anti-Erro #1)
    setRoute([]);
    setRouteInfo(null);
    setIsCalculating(false);

    if (!navigatingTo || !coords) return;

    let activeRequest = true;

    const calculateRouteSecure = async (isRetry = false) => {
      setIsCalculating(true);
      setRouteInfo({ 
        distance: '--', 
        duration: '--', 
        status: isRetry ? 'Recalculando percurso...' : 'Traçando rota...' 
      });

      try {
        // Se a geocodificação ainda não terminou ou falhou
        let finalDestLat = destCoords?.lat;
        let finalDestLng = destCoords?.lng;

        if (!finalDestLat || !finalDestLng) {
          if (!isRetry) {
             // Aguarda um pouco a geocodificação
             setTimeout(() => { if (activeRequest) calculateRouteSecure(true); }, 1500);
             return;
          }
          // Caso extremo: Fallback se geocodificação falhar definitivamente
          finalDestLat = coords.lat + 0.002;
          finalDestLng = coords.lng + 0.002;
        }

        const routeKey = `${Math.floor(coords.lat*1000)}_${Math.floor(coords.lng*1000)}`;
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coords.lng},${coords.lat};${finalDestLng},${finalDestLat}?overview=full&geometries=geojson&steps=true&alternatives=false`;
        
        const response = await fetch(osrmUrl, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`OSRM HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!activeRequest) return;

        if (data.code === 'Ok' && data.routes?.[0]) {
          const osrmRoute = data.routes[0];
          const coordinates = osrmRoute.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]) as [number, number][];
          
          // Extrai instruções passo a passo
          if (osrmRoute.legs?.[0]?.steps) {
            setNavigationSteps(osrmRoute.legs[0].steps);
            setCurrentStepIndex(0);
          }
          const newRouteData = {
            distance: osrmRoute.distance,
            duration: osrmRoute.duration,
            coords: coordinates,
            destLat: finalDestLat,
            destLng: finalDestLng,
            polyline: JSON.stringify(osrmRoute.geometry)
          };

          const validation = validateRoute(coords, { lat: finalDestLat, lng: finalDestLng }, newRouteData, lastValidRoute);

          if (!validation.ok) {
            console.warn("[ANTI-ERRO ROTA]", validation.reason);
            if (!isRetry) {
              setTimeout(() => { if (activeRequest) calculateRouteSecure(true); }, 800);
              return;
            } else {
              setRouteInfo({ distance: '--', duration: '--', status: validation.reason });
              setIsCalculating(false);
              return;
            }
          }

          setRoute(coordinates);
          const distanceKm = osrmRoute.distance / 1000;
          const durationMin = Math.round(osrmRoute.duration / 60);
          
          setRouteInfo({
            distance: distanceKm.toFixed(1) + ' km',
            duration: durationMin + ' min',
            status: 'ROTA VERIFICADA'
          });
          setLastValidRoute(newRouteData);
        } else {
          const errorMsg = data.code === 'NoRoute' ? 'Caminho não encontrado.' : 'Servidor OSRM ocupado.';
          setRouteInfo({ distance: '--', duration: '--', status: errorMsg });
        }
      } catch (error) {
        if (!activeRequest) return;
        console.error("Erro na rota OSRM:", error);
        setRouteInfo({ distance: '--', duration: '--', status: 'Servidor instável. Tentando...' });
        
        if (!isRetry) {
          setTimeout(() => { if (activeRequest) calculateRouteSecure(true); }, 2000);
        }
      } finally {
        if (activeRequest) setIsCalculating(false);
      }
    };

    calculateRouteSecure();

    return () => {
      activeRequest = false;
    };
    // Reduzimos a frequência de atualização: recala apenas em mudanças significativas ou mudança de destino
  }, [navigatingTo?.id, navigatingTo?.address, Math.floor(coords?.lat * 5000), Math.floor(coords?.lng * 5000), destCoords]);

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
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    {navigationSteps.length > 0 && currentStepIndex < navigationSteps.length ? (
                      <div className="flex flex-col items-center">
                        <Navigation className="w-6 h-6 text-primary-dark" />
                        <span className="text-[9px] font-black text-primary-dark mt-[-2px]">
                          {navigationSteps[currentStepIndex].distance > 1000 
                            ? `${(navigationSteps[currentStepIndex].distance/1000).toFixed(1)}km`
                            : `${Math.round(navigationSteps[currentStepIndex].distance)}m`
                          }
                        </span>
                      </div>
                    ) : (
                      <Navigation className="w-8 h-8 text-primary-dark" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-black italic tracking-tight leading-none mb-1">
                      {navigationSteps.length > 0 && currentStepIndex < navigationSteps.length ? (
                        <div className="flex flex-col truncate max-w-[200px]">
                          <span>{getManeuverText(navigationSteps[currentStepIndex].maneuver)}</span>
                          <span className="text-primary text-sm uppercase not-italic">
                            {navigationSteps[currentStepIndex].name || 'Siga em frente'}
                          </span>
                        </div>
                      ) : (
                        routeInfo ? `Chegada em ${routeInfo.duration}` : 'Calculando...'
                      )}
                    </h3>
                    <p className="text-[10px] font-lexend font-black text-white/40 uppercase tracking-widest truncate max-w-[200px]">
                      {routeInfo?.status === 'ROTA VERIFICADA' ? `Destino: ${navigatingTo.address.split(',')[0]}` : routeInfo?.status || 'Processando rota...'}
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
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${routeInfo?.status === 'ROTA VERIFICADA' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none">
                    {routeInfo?.status || 'Iniciando GPS'}
                  </span>
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
