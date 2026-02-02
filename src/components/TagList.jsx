// src/components/TagList.jsx
export default function TagList({ tags, type, onToggle, activeTags = [] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => {
        const active = activeTags.includes(t);
        return (
          <button
            key={t}
            onClick={() => onToggle(t)}
            className={`px-2 py-1 ${
              type === "cat" ? "text-normal" : "text-xs"
            } rounded cursor-pointer ${
              active ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {type === "cat" ? null : "#"}
            {t}
          </button>
        );
      })}
    </div>
  );
}
