// src/components/TagList.jsx
export default function TagList({ tags, onToggle, activeTags = [] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => {
        const active = activeTags.includes(t);
        return (
          <button
            key={t}
            onClick={() => onToggle(t)}
            className={`px-2 py-1 text-xs rounded ${
              active ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            #{t}
          </button>
        );
      })}
    </div>
  );
}
