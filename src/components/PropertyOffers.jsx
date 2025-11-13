import Accordion from "./Accordion";

export default function PropertyOffers({ data }) {
  // data is already an object
  const features = data || {}; // fallback to empty object

  // Convert booleans to "Yes"/"No"
  const formatValue = (val) => {
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return val;
  };

  return (
    <Accordion title="What this place offers">
      {Object.keys(features).length === 0 ? (
        <p>No features available</p>
      ) : (
        <ul className="list-disc pl-6 space-y-1">
          {Object.entries(features).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {formatValue(value)}
            </li>
          ))}
        </ul>
      )}
    </Accordion>
  );
}
