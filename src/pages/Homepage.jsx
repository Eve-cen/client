import React, { useEffect, useState } from "react";
import PropertyList from "../components/PropertyList";
import CategoryList from "../components/CategoryList";
import Hero from "../components/Hero"; // Updated
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../utils/api";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import BlogList from "../components/BlogList";
import BlogSection from "../components/BlogsSection";
import EvencenLoader from "../components/Loader";

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const searchResults = location.state?.properties;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoriesData = await apiFetch({
          endpoint: "/categories",
          method: "GET",
          cacheable: true,
        });
        setCategories(categoriesData);

        // Fetch properties (use search results if available, otherwise fetch all)
        const propertiesData =
          searchResults ||
          (await apiFetch({
            endpoint: "/properties",
            method: "GET",
            cacheable: true,
          }));
        setProperties(propertiesData.properties);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load data. Please try again.");
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, searchResults]);

  const handleUpdate = (updatedProperty) => {
    setProperties(
      properties.map((p) =>
        p._id === updatedProperty._id ? updatedProperty : p
      )
    );
  };

  const handleDelete = (id) => {
    setProperties(properties.filter((p) => p._id !== id));
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId); // Filter properties by category
  };

  // Filter properties by selected category
  const filteredProperties = selectedCategory
    ? properties.filter((p) => p.category._id === selectedCategory)
    : properties;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      {loading ? (
        <EvencenLoader />
      ) : (
        <>
          <div className="bg-[#F2F2F2]">
            <CategoryList
              categories={categories}
              onSelect={handleCategorySelect}
            />
          </div>
          <PropertyList
            properties={filteredProperties}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </>
      )}
      <BlogSection />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Home;
