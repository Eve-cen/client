import { useEffect, useState } from "react";
import Accordion from "./Accordion";

export default function PropertyOffers({ data }) {
  const [offers] = useState(data);

  return (
    <Accordion title="What this place offers">
      <ul className="list-disc pl-6 space-y-1">
        {offers.map((offer, i) => (
          <li key={i}>{offer}</li>
        ))}
      </ul>
    </Accordion>
  );
}
