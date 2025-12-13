import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { DestinationData, TranslationLabels } from '../types';
import { MapIcon } from './Icons';

interface MapSectionProps {
  data: DestinationData;
  labels: TranslationLabels;
}

const MapSection: React.FC<MapSectionProps> = ({ data, labels }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    // Initialize Map if not already initialized
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([data.coordinates.lat, data.coordinates.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    } else {
      // Clear existing layers if data changes
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          layer.remove();
        }
      });
    }

    const map = mapRef.current;
    const markers: L.Marker[] = [];

    // Custom Icons (Using HTML strings for Lucide icons within Leaflet DivIcons)
    const createIcon = (color: string, type: string) => {
      // Simple SVG marker replacement using standard Leaflet DivIcon
      return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    };

    // 1. Destination Marker (Blue)
    const destMarker = L.marker([data.coordinates.lat, data.coordinates.lng], {
      title: data.destinationName,
      icon: createIcon('#0ea5e9', 'dest')
    }).bindPopup(`<b>${data.destinationName}</b><br>${data.tagline}`).addTo(map);
    markers.push(destMarker);

    // 2. Origin Marker (Gray)
    if (data.originCoordinates && (data.originCoordinates.lat !== 0 || data.originCoordinates.lng !== 0)) {
      const originMarker = L.marker([data.originCoordinates.lat, data.originCoordinates.lng], {
        title: "Start",
        icon: createIcon('#64748b', 'start')
      }).bindPopup(`<b>${labels.from}</b>`).addTo(map);
      markers.push(originMarker);

      // Route Line (Dashed)
      const routeLine = L.polyline([
        [data.originCoordinates.lat, data.originCoordinates.lng],
        [data.coordinates.lat, data.coordinates.lng]
      ], {
        color: '#64748b',
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10'
      }).addTo(map);
    }

    // 3. Attractions (Red)
    data.topAttractions.forEach(attr => {
      if (attr.coordinates) {
        const marker = L.marker([attr.coordinates.lat, attr.coordinates.lng], {
          title: attr.name,
          icon: createIcon('#ef4444', 'attr')
        }).bindPopup(`<b>${attr.name}</b><br>${attr.type}`).addTo(map);
        markers.push(marker);
      }
    });

    // 4. Photo Spots (Orange)
    data.photographySpots.forEach(spot => {
      if (spot.coordinates) {
        const marker = L.marker([spot.coordinates.lat, spot.coordinates.lng], {
          title: spot.name,
          icon: createIcon('#f97316', 'photo')
        }).bindPopup(`<b>${spot.name}</b><br>📷 ${labels.cameraSpots}`).addTo(map);
        markers.push(marker);
      }
    });
    
    // 5. Food Spots (Green)
    data.culinaryDelights.forEach(dish => {
        if (dish.coordinates) {
            const marker = L.marker([dish.coordinates.lat, dish.coordinates.lng], {
                title: dish.bestPlaceToTry,
                icon: createIcon('#22c55e', 'food')
            }).bindPopup(`<b>${dish.name}</b><br>🍴 ${dish.bestPlaceToTry}`).addTo(map);
            markers.push(marker);
        }
    });

    // Fit Bounds
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    // Clean up on unmount
    return () => {
      // We don't necessarily destroy the map to avoid re-init issues with React StrictMode double render,
      // but if we were strictly managing lifecycle we might.
      // For this simple case, letting it persist or handling in the "if (!mapRef.current)" block is okay.
      // However, proper cleanup:
      // map.remove();
      // mapRef.current = null;
    };
  }, [data, labels]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
           <MapIcon size={24} />
        </div>
        <div>
           <h2 className="text-2xl font-serif font-bold text-slate-800">{labels.mapHeader}</h2>
           <p className="text-slate-500">{labels.mapSubtext}</p>
        </div>
      </div>

      <div className="relative w-full h-[500px] bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
        <div ref={containerRef} className="w-full h-full z-0" />
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200 text-xs z-[1000] flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500 border border-white shadow-sm"></span>
                <span>Destination</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm"></span>
                <span>Attraction</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 border border-white shadow-sm"></span>
                <span>Photo Spot</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm"></span>
                <span>Food</span>
            </div>
            {data.originCoordinates && (
               <div className="flex items-center gap-2">
                   <span className="w-3 h-3 rounded-full bg-slate-500 border border-white shadow-sm"></span>
                   <span>Start</span>
               </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MapSection;