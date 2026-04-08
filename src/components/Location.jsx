import { useState } from "react";
import Accordion from "./Accordion";

export default function PropertyLocation({ data }) {
  const [showMap, setShowMap] = useState(false);

  const lat = data?.latitude ?? data?.lat;
  const lng = data?.longitude ?? data?.lng;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=800x500&scale=2&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=13&output=embed`;

  if (!lat || !lng) return null;

  return (
    <Accordion title="Where you'll be" openState={true}>
      {showMap ? (
        <iframe
          src={embedUrl}
          className="w-full h-[500px] rounded-lg border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div
          className="relative w-full h-[500px] rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => setShowMap(true)}
        >
          <img
            src={staticMapUrl}
            alt="Property location map"
            className="w-full h-full object-cover"
          />
          {/* Click overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white text-gray-800 font-medium text-sm px-5 py-2.5 rounded-full shadow-lg">
              Click to interact
            </div>
          </div>
        </div>
      )}
    </Accordion>
  );
}
