import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation as NavigationIcon } from 'lucide-react';
import { Button } from './ui/button';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LocationDisplay({ location, title = "Location" }) {
  if (!location || !location.latitude || !location.longitude) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-500">No location data available</p>
      </div>
    );
  }

  const position = [location.latitude, location.longitude];

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-sm flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-purple-600" />
            {title}
          </h4>
          <p className="text-sm text-gray-700">{location.address}</p>
          <p className="text-xs text-gray-500 mt-1">
            Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={openInGoogleMaps}
          className="flex items-center gap-1"
        >
          <NavigationIcon className="h-3 w-3" />
          Navigate
        </Button>
      </div>

      <div className="h-48 border border-gray-200 rounded-lg overflow-hidden">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>{location.address}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
