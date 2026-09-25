
import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Crosshair,
  MapPin,
  Loader2,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================
// Custom Pin Icon
// ============================================================
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

// ============================================================
// Map Controller
// ============================================================
const MapController = ({ position, shouldZoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!position || !shouldZoom) return;

    map.flyTo(
      [position.lat, position.lng],
      18,
      {
        duration: 1.2,
      }
    );
  }, [position, shouldZoom, map]);

  return null;
};

// ============================================================
// Location Marker + Map Click
// ============================================================
const LocationMarker = ({ position, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? (
    <Marker
      position={[position.lat, position.lng]}
      icon={createCustomPinIcon()}
    />
  ) : null;
};

// ============================================================
// Main MapPicker
// ============================================================
const MapPicker = ({ location, onChange }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [shouldZoom, setShouldZoom] = useState(false);
  const [manualAddress, setManualAddress] = useState(
    location?.address || ''
  );

  // Default coordinates
  const defaultPos = {
    lat: 19.0760,
    lng: 72.8777,
  };

  const currentPos =
    location?.lat != null && location?.lng != null
      ? {
          lat: Number(location.lat),
          lng: Number(location.lng),
        }
      : defaultPos;

  // ============================================================
  // Reverse Geocoding
  // ============================================================
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

        return (
          data.display_name ||
          `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        );
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }

    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // ============================================================
  // Select Location From Map / GPS
  // ============================================================
  const handleSelectLocation = async (lat, lng) => {
    const address = await reverseGeocode(lat, lng);

    const newLocation = {
      lat: Number(Number(lat).toFixed(6)),
      lng: Number(Number(lng).toFixed(6)),
      address,
    };

    setManualAddress(address);
    onChange(newLocation);

    // Tell map to zoom closely
    setShouldZoom(true);
  };

  // ============================================================
  // Manual Address
  // ============================================================
  const handleManualAddressChange = (e) => {
    const value = e.target.value;

    setManualAddress(value);

    onChange({
      ...(location || {}),
      address: value,
    });
  };

  // ============================================================
  // Current GPS Location
  // ============================================================
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        'Geolocation is not supported by your browser.'
      );
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = pos.coords;

        console.log('GPS Location:', {
          latitude,
          longitude,
          accuracy,
        });

        await handleSelectLocation(
          latitude,
          longitude
        );

        setIsLocating(false);

        toast.success(
          `Location detected (${Math.round(
            accuracy
          )}m accuracy)`
        );
      },

      (err) => {
        console.warn('Geolocation error:', err);

        setIsLocating(false);

        let message =
          'Could not access your location.';

        if (err.code === 1) {
          message =
            'Location permission was denied. Please allow location access.';
        } else if (err.code === 2) {
          message =
            'Your location could not be determined. Please try again.';
        } else if (err.code === 3) {
          message =
            'Location request timed out. Please try again.';
        }

        toast.error(message);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-3">

      {/* ======================================================
          Header
      ======================================================= */}
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-slate-700">
          Complaint Location{' '}
          <span className="text-rose-500">*</span>
        </label>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Crosshair className="w-3.5 h-3.5" />
          )}

          <span>
            {isLocating
              ? 'Detecting GPS...'
              : 'Use My Current Location'}
          </span>
        </button>
      </div>

      {/* ======================================================
          Manual Address Field
      ======================================================= */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Location / Address
        </label>

        <textarea
          value={manualAddress}
          onChange={handleManualAddressChange}
          placeholder="Enter the location or address of the issue..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 outline-none resize-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
        />

        <p className="mt-1.5 text-[11px] text-slate-400">
          You can enter a complete address, landmark, street,
          area, or any useful location description.
        </p>
      </div>

      {/* ======================================================
          Map
      ======================================================= */}
      <div className="h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-300 relative shadow-inner">

        <MapContainer
          center={[
            currentPos.lat,
            currentPos.lng,
          ]}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController
            position={currentPos}
            shouldZoom={shouldZoom}
          />

          <LocationMarker
            position={currentPos}
            onLocationSelect={
              handleSelectLocation
            }
          />
        </MapContainer>

        {/* Map Hint */}
        <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[11px] text-slate-600 font-medium shadow-sm border border-slate-200">
          Click on the map to adjust the pin
        </div>

        {/* Zoom Hint */}
        <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[11px] text-slate-600 font-medium shadow-sm border border-slate-200 flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-blue-600" />
          Zoom in for a more precise location
        </div>
      </div>

      {/* ======================================================
          Selected Location Details
      ======================================================= */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-start gap-2">

        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />

        <div className="flex-1 min-w-0">

          <p className="font-semibold text-slate-800 leading-5">
            {manualAddress ||
              'Enter an address or click on the map to select a location.'}
          </p>

          {location?.lat != null &&
            location?.lng != null && (
              <p className="text-slate-400 font-mono mt-1">
                Lat: {location.lat}, Lng:{' '}
                {location.lng}
              </p>
            )}
        </div>
      </div>

      {/* Helper */}
      <p className="text-[11px] text-slate-400">
        Tip: If GPS is not accurate enough, enter the
        location manually and use the map to place the
        pin as close as possible.
      </p>

    </div>
  );
};

export default MapPicker;

