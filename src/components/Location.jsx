import { useState } from "react";
import Accordion from "./Accordion";

export default function PropertyLocation({ data }) {
  const [coords] = useState(data);

  return (
    <Accordion title="Where you’ll be">
      {coords ? (
        <iframe
          src={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=13&output=embed`}
          className="w-full h-80 rounded-lg"
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      ) : (
        <p className="text-gray-400 italic">Loading map...</p>
      )}
    </Accordion>
  );
}
