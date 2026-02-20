import React, { useState, useEffect, useRef, useCallback } from 'react'; // Add useCallback
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function LocationPicker({ 
  onLocationChange, 
  initialLocation = null,
  label = "Location"
}) {
  const [position, setPosition] = useState(
    initialLocation ? { lat: initialLocation.latitude, lng: initialLocation.longitude } : { lat: 28.6139, lng: 77.2090 } // Default to Delhi
  );
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Wrap the location change handler in useCallback
  const handleLocationChange = useCallback(() => {
    if (position && address) {
      onLocationChange({
        address,
        latitude: position.lat,
        longitude: position.lng,
      });
    }
  }, [position, address, onLocationChange]); // Include all dependencies

  // Use the memoized callback in useEffect
  useEffect(() => {
    handleLocationChange();
  }, [handleLocationChange]); // Only depend on the memoized callback

  const handleGetCurrentLocation = () => {
    setUseCurrentLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(newPos);
          // Reverse geocode to get address (simplified - just show coordinates)
          setAddress(`${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`);
          setUseCurrentLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please select manually on the map or enter address.');
          setUseCurrentLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setUseCurrentLocation(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">{label} Address *</Label>
        <Input
          id="address"
          type="text"
          placeholder="Enter full address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-2"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>
            <MapPin className="inline h-4 w-4 mr-1" />
            Select Location on Map
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetCurrentLocation}
            disabled={useCurrentLocation}
            className="text-xs"
          >
            <Navigation className="h-3 w-3 mr-1" />
            {useCurrentLocation ? 'Getting...' : 'Use Current'}
          </Button>
        </div>
        
        <div className="h-64 border border-stone-300 rounded-lg overflow-hidden">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          📍 Click on the map to select exact location. Coordinates: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </p>
      </div>
    </div>
  );
}