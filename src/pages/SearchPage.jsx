import { useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import Card from "../components/EvenCard";

export default function SearchPage() {
  const { state } = useLocation();
  const initialProperties = state?.properties || [];

  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const pageSize = 9; // 9 items per page

  // --- 🔍 Filter & Search Logic ---
  const filtered = useMemo(() => {
    let list = [...initialProperties];

    // Search text filter
    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      list = list.filter(
        (item) =>
          item.name?.toLowerCase().includes(s) ||
          item.location?.city?.toLowerCase().includes(s) ||
          item.location?.country?.toLowerCase().includes(s)
      );
    }

    // Sorting
    if (sort === "low-high") {
      list.sort((a, b) => a.pricing?.weekdayPrice - b.pricing?.weekdayPrice);
    } else if (sort === "high-low") {
      list.sort((a, b) => b.pricing?.weekdayPrice - a.pricing?.weekdayPrice);
    } else {
      // newest
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [initialProperties, searchText, sort]);

  // --- 📄 Pagination Logic ---
  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (page - 1) * pageSize;
  const displayed = filtered.slice(start, start + pageSize);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* PAGE HEADING */}
      <h1 className="text-4xl font-bold mb-6">Search Results</h1>

      {/* SEARCH + SORT BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* <input
          type="text"
          placeholder="Search keyword, city, country..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full md:w-1/2 border px-4 py-2 rounded-lg"
        /> */}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border px-4 py-2 rounded-lg"
        >
          <option value="newest">Newest</option>
          <option value="low-high">Price: Low → High</option>
          <option value="high-low">Price: High → Low</option>
        </select>
      </div>

      {/* RESULTS GRID */}
      {displayed.length === 0 ? (
        <p className="text-gray-600 text-lg">No matching properties found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((property) => (
            <Card key={property._id} id={property._id} data={property} />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {filtered.length > pageSize && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Prev
          </button>

          <span>
            Page <strong>{page}</strong> of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
