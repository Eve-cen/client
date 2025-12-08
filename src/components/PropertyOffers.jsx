import Accordion from "./Accordion";

export default function PropertyOffers({ data }) {
  const features = data || {}; // fallback to empty object

  // Convert booleans to "Yes"/"No"
  const formatValue = (val) => {
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return val;
  };

  // Filter out falsy values (false, null, undefined, 0, "")
  const visibleFeatures = Object.entries(features).filter(
    ([, value]) => value // only keep truthy
  );

  return (
    <Accordion title="What this place offers">
      {visibleFeatures.length === 0 ? (
        <p>No features available</p>
      ) : (
        <ul className="list-disc pl-6 space-y-1">
          {visibleFeatures.map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {formatValue(value)}
            </li>
          ))}
        </ul>
      )}
    </Accordion>
  );
}
