import { useState } from "react";
import Accordion from "./Accordion";

export default function PropertyDescription({ data }) {
  const [description] = useState(data);

  return (
    <Accordion title="Description" openState={true}>
      {description && <p className="leading-relaxed">{description}</p>}
    </Accordion>
  );
}
