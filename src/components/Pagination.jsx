// src/components/Pagination.jsx
export default function Pagination({ page, totalPages, setPage }) {
  const prev = () => setPage(Math.max(1, page - 1));
  const next = () => setPage(Math.min(totalPages, page + 1));

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        onClick={prev}
        className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
        disabled={page === 1}
      >
        Prev
      </button>

      <div className="text-sm text-gray-700">
        Page <span className="font-medium">{page}</span> of{" "}
        <span className="font-medium">{totalPages}</span>
      </div>

      <button
        onClick={next}
        className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}
