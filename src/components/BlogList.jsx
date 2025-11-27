// src/pages/BlogList.jsx
import { useEffect, useMemo, useState } from "react";
import { blogs as blogData } from "../data/blogs";
import BlogCard from "../components/BlogCard";
import Pagination from "../components/Pagination";
import CategoryFilter from "../components/CategoryFilter";
import TagList from "../components/TagList";
import Footer from "./Footer";

const PAGE_SIZE = 6;

export default function BlogList() {
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTags, setActiveTags] = useState([]);
  const [query, setQuery] = useState("");

  // gather unique categories and tags
  const categories = useMemo(() => {
    const s = new Set();
    blogData.forEach((b) => b.categories.forEach((c) => s.add(c)));
    return Array.from(s);
  }, []);

  const tags = useMemo(() => {
    const s = new Set();
    blogData.forEach((b) => b.tags.forEach((t) => s.add(t)));
    return Array.from(s);
  }, []);

  // toggle tag
  const toggleTag = (tag) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  // filtered list
  const filtered = useMemo(() => {
    let list = blogData.filter((b) => b.status === "published");

    if (activeCategory) {
      list = list.filter((b) => b.categories.includes(activeCategory));
    }

    if (activeTags.length) {
      list = list.filter((b) => activeTags.every((t) => b.tags.includes(t)));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.content.toLowerCase().includes(q)
      );
    }

    // sort by date desc
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    return list;
  }, [activeCategory, activeTags, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // keep page in range when filters change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, activeTags, query]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-4">Blogs</h1>

        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-3">
            <CategoryFilter
              categories={categories}
              active={activeCategory}
              setActive={setActiveCategory}
            />
            <TagList tags={tags} onToggle={toggleTag} activeTags={activeTags} />
          </div>

          <div className="flex gap-2 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 border rounded w-60"
              placeholder="Search articles..."
            />
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((b) => (
            <BlogCard key={b.id} blog={b} />
          ))}
        </div>

        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
      <Footer />
    </>
  );
}
