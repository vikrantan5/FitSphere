import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Phone, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Button } from './ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function GymLocationModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadGymSettings();
    }
  }, [isOpen]);

  const loadGymSettings = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/gym-settings`);
      setSettings(res.data);
    } catch (error) {
      console.error('Failed to load gym settings', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const hasLocation = settings?.gym_location?.address;
  const { gym_location, gym_name, contact_phone, operating_hours } = settings || {};
  const { address, latitude, longitude } = gym_location || {};

  const hasCoords =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    (latitude !== 0 || longitude !== 0);

  // Google Maps embed URL
  const embedUrl = hasCoords
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${latitude},${longitude}&zoom=15`
    : address
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(address)}`
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        data-testid="gym-location-modal-overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          data-testid="gym-location-modal"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 bg-zinc-800/80 hover:bg-zinc-700 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg border border-white/20"
            data-testid="close-modal-btn"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-zinc-400">Loading gym location...</p>
              </div>
            ) : !hasLocation ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 text-lg">
                  Gym location not set yet. Please contact admin.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white" data-testid="modal-gym-name">
                        {gym_name || 'Our Gym Location'}
                      </h2>
                      <p className="text-sm text-zinc-400">Visit us at our facility</p>
                    </div>
                  </div>
                </div>

                {/* Map */}
                {embedUrl && (
                  <div className="mb-6 rounded-2xl overflow-hidden shadow-xl border border-white/10">
                    <iframe
                      src={embedUrl}
                      width="100%"
                      height="350"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full"
                      data-testid="google-maps-iframe"
                    />
                  </div>
                )}

                {/* Address Info */}
                <div className="space-y-4 bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-1">
                        Address
                      </p>
                      <p className="text-base text-zinc-200" data-testid="modal-address">
                        {address}
                      </p>
                      {hasCoords && (
                        <p className="text-xs text-zinc-500 mt-1">
                          {latitude.toFixed(5)}, {longitude.toFixed(5)}
                        </p>
                      )}
                    </div>
                  </div>

                  {contact_phone && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-purple-400 uppercase tracking-wide mb-1">
                          Phone
                        </p>
                        <p className="text-base text-zinc-200">{contact_phone}</p>
                      </div>
                    </div>
                  )}

                  {operating_hours && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-1">
                          Operating Hours
                        </p>
                        <p className="text-base text-zinc-200 whitespace-pre-line">{operating_hours}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => {
                      const mapsUrl = hasCoords
                        ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg"
                    data-testid="open-in-maps-btn"
                  >
                    <Navigation className="w-5 h-5 mr-2" />
                    Open in Google Maps
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="px-8 py-6 text-base rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Decorative Gradient Circles */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}