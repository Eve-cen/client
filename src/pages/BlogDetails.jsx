// src/pages/BlogDetails.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { blogs } from "../data/blogs";
import BlogCard from "../components/BlogCard";
import Footer from "../components/Footer";

export default function BlogDetails() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const found = blogs.find(
      (b) => b.slug === slug && b.status === "published"
    );
    setBlog(found || null);
  }, [slug]);

  // related posts: share category or tags, exclude current, sort by matches then date
  const related = useMemo(() => {
    if (!blog) return [];
    function score(b) {
      const categoryMatches = b.categories.filter((c) =>
        blog.categories.includes(c)
      ).length;
      const tagMatches = b.tags.filter((t) => blog.tags.includes(t)).length;
      return categoryMatches * 3 + tagMatches;
    }
    return blogs
      .filter((b) => b.id !== blog.id && b.status === "published")
      .map((b) => ({ ...b, score: score(b) }))
      .filter((b) => b.score > 0)
      .sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [blog]);

  if (blog === null)
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Blog Not Found</h1>
        <Link to="/blog" className="text-blue-600 underline">
          Go Back
        </Link>
      </div>
    );

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <img
          src={blog.featuredImage}
          alt={blog.title}
          className="w-full h-72 object-cover rounded-lg mb-6"
        />

        <Link to="/blog" className="text-blue-600 underline text-sm">
          ← Back to Blog
        </Link>

        <h1 className="text-4xl font-bold mt-4 mb-2">{blog.title}</h1>

        <div className="text-gray-500 text-sm mb-4">
          {blog.author} • {blog.date} • {blog.readingTime}
        </div>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Related Posts</h3>
          {related.length === 0 ? (
            <div className="text-sm text-gray-500">No related posts found.</div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <BlogCard key={r.id} blog={r} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
