import { useState } from "react";
import Accordion from "./Accordion";

export default function PropertyDescription({ data }) {
  const [description] = useState(data);

  return (
    <Accordion title="Description">
      {description && <p className="leading-relaxed">{description}</p>}
    </Accordion>
  );
}
