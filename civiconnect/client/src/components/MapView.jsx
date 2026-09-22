import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { ExternalLink, MapPin } from 'lucide-react';

const statusPinColors = {
  Submitted: '#64748b',
  Verified: '#2563eb',
  Assigned: '#d97706',
  'In Progress': '#ea580c',
  Resolved: '#10b981',
  Rejected: '#e11d48',
};

// Create a custom SVG marker with dynamic status color
const createStatusIcon = (status) => {
  const color = statusPinColors[status] || '#2563eb';
  return L.divIcon({
    className: 'custom-status-marker',
    html: `
      <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
        <div style="background-color: ${color}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border: 2.5px solid white;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: white;"></div>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid ${color}; margin-top: -1px;"></div>
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -36],
  });
};

const MapView = ({
  complaints = [],
  center = [19.0760, 72.8777],
  zoom = 12,
  height = '450px',
  isAdminView = false,
}) => {
  // If only 1 complaint passed with location, center on it
  const mapCenter =
    complaints.length === 1 && complaints[0]?.location?.lat
      ? [complaints[0].location.lat, complaints[0].location.lng]
      : center;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {complaints.map((c) => {
          if (!c.location || !c.location.lat || !c.location.lng) return null;

          const targetUrl = isAdminView ? `/admin/complaints/${c._id}` : `/complaints/${c._id}`;

          return (
            <Marker
              key={c._id}
              position={[c.location.lat, c.location.lng]}
              icon={createStatusIcon(c.status)}
            >
              <Popup className="civi-custom-popup">
                <div className="p-1 max-w-xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} size="xs" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    {c.location.address || 'Address unlisted'}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {c.upvotes?.length || 0} supporters
                    </span>
                    <Link
                      to={targetUrl}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <span>View Issue</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Floating Banner */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-md text-xs space-y-1 hidden sm:block">
        <div className="font-semibold text-slate-700 mb-1">Status Legend</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Submitted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>Assigned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Resolved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
