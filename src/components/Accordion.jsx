import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Accordion({ title, children, openState }) {
  const [open, setOpen] = useState(openState ?? false);

  return (
    <div className="border-b border-gray-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-4 text-left"
      >
        <span className="font-semibold text-lg">{title}</span>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>

      {open && <div className="pb-4 text-gray-700">{children}</div>}
    </div>
  );
}
