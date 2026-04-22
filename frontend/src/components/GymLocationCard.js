import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Navigation, Phone, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function GymLocationCard({ variant = 'default' }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/gym-settings`);
        if (mounted) setSettings(res.data);
      } catch (e) {
        console.error('Failed to load gym settings', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div
        className="w-full rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-500"
        data-testid="gym-location-loading"
      >
        Loading gym location...
      </div>
    );
  }

  if (!settings || !settings.gym_location || !settings.gym_location.address) {
    return null;
  }

  const { gym_location, gym_name, contact_phone, operating_hours } = settings;
  const { address, latitude, longitude } = gym_location;

  const hasCoords =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    (latitude !== 0 || longitude !== 0);

  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`;

  const openMap = () => window.open(mapsUrl, '_blank', 'noopener,noreferrer');

  const isDark = variant === 'dark';

  return (
    <Card
      className={`w-full overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-[#0f5132] to-[#0f5132]/80 text-white border-0'
          : 'bg-white border border-stone-200'
      }`}
      data-testid="gym-location-card"
    >
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin
                className={`h-5 w-5 ${
                  isDark ? 'text-[#ff7f50]' : 'text-[#0f5132]'
                }`}
              />
              <h3
                className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-[#0f5132]'
                }`}
                data-testid="gym-name"
              >
                {gym_name || 'Visit Our Gym'}
              </h3>
            </div>
            <p
              className={`text-sm md:text-base ${
                isDark ? 'text-white/90' : 'text-stone-700'
              }`}
              data-testid="gym-address"
            >
              {address}
            </p>
            {hasCoords && (
              <p
                className={`text-xs mt-1 ${
                  isDark ? 'text-white/60' : 'text-stone-500'
                }`}
              >
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </p>
            )}

            <div className="flex flex-wrap gap-4 mt-3 text-xs">
              {contact_phone && (
                <span
                  className={`flex items-center gap-1 ${
                    isDark ? 'text-white/80' : 'text-stone-600'
                  }`}
                >
                  <Phone className="h-3 w-3" />
                  {contact_phone}
                </span>
              )}
              {operating_hours && (
                <span
                  className={`flex items-center gap-1 ${
                    isDark ? 'text-white/80' : 'text-stone-600'
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  {operating_hours}
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={openMap}
            className={`${
              isDark
                ? 'bg-[#ff7f50] hover:bg-[#ff7f50]/90 text-white'
                : 'bg-[#0f5132] hover:bg-[#0f5132]/90 text-white'
            } rounded-full px-5`}
            data-testid="view-gym-location-btn"
          >
            <Navigation className="h-4 w-4 mr-2" />
            View Gym Location
          </Button>
        </div>
      </div>
    </Card>
  );
}
