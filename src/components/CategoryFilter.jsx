// src/components/CategoryFilter.jsx
export default function CategoryFilter({ categories, active, setActive }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setActive(null)}
        className={`px-3 py-1 text-sm rounded ${
          active === null
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        All
      </button>

      {categories.map((c) => (
        <button
          key={c}
          onClick={() => setActive(c)}
          className={`px-3 py-1 text-sm rounded ${
            active === c ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
