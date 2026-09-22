import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Custom Pin Icon using Leaflet DivIcon for zero missing asset issues
const createCustomPinIcon = () => {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
        <div style="background-color: #2563eb; color: white; padding: 6px; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div style="width: 8px; height: 8px; background: rgba(37,99,235,0.4); border-radius: 50%; margin-top: 2px;"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

// Component to handle map clicks & center updates
const LocationMarker = ({ position, onLocationSelect }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={createCustomPinIcon()} />
  ) : null;
};

const MapPicker = ({ location, onChange }) => {
  const [isLocating, setIsLocating] = useState(false);
  // Default coordinates: Mumbai
  const defaultPos = { lat: 19.0760, lng: 72.8777 };
  const currentPos = location?.lat && location?.lng ? { lat: location.lat, lng: location.lng } : defaultPos;

  // Reverse geocode via OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const handleSelectLocation = async (lat, lng) => {
    const address = await reverseGeocode(lat, lng);
    onChange({
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      address,
    });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await handleSelectLocation(latitude, longitude);
        setIsLocating(false);
        toast.success('Location pinpointed from your GPS!');
      },
      (err) => {
        setIsLocating(false);
        toast.error('Could not access your location. Please click directly on the map.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">
          Complaint Location Pin <span className="text-rose-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Crosshair className="w-3.5 h-3.5" />
          )}
          <span>{isLocating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
        </button>
      </div>

      {/* Map Container */}
      <div className="h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-300 relative shadow-inner">
        <MapContainer
          center={[currentPos.lat, currentPos.lng]}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={currentPos} onLocationSelect={handleSelectLocation} />
        </MapContainer>
        <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[11px] text-slate-600 font-mono shadow-sm">
          Click map to adjust pin
        </div>
      </div>

      {/* Address & Coordinates Display */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-start gap-2">
        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-slate-800">
            {location?.address || 'Click anywhere on the map above to drop a pin.'}
          </p>
          {location?.lat && (
            <p className="text-slate-400 font-mono mt-0.5">
              Lat: {location.lat}, Lng: {location.lng}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
