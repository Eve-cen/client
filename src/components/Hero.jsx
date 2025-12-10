import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import Input from "./Input";
import Button from "./Button";
import Navbar from "./Navbar";

const Hero = ({ onExplore }) => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    location: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    checkIn: "",
    checkOut: "",
  });
  const [error, setError] = useState("");
  const currentTime = new Date();
  const hour = currentTime.getUTCHours() + 1; // Adjust for WAT (UTC+1)
  let greeting = "Welcome";
  if (hour >= 5 && hour < 12) greeting = "Good Morning";
  else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17 || hour < 5) greeting = "Good Evening";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch({
          endpoint: "/categories",
          method: "GET",
          cacheable: true,
        });
        setCategories(data);
      } catch (err) {
        setError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleExploreClick = () => {
    if (onExplore) onExplore(""); // Reset category filter
    navigate("/");
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const queryParams = new URLSearchParams();

      if (formData.location) queryParams.append("location", formData.location);
      if (formData.category) queryParams.append("category", formData.category);
      if (formData.minPrice) queryParams.append("minPrice", formData.minPrice);
      if (formData.maxPrice) queryParams.append("maxPrice", formData.maxPrice);

      // Backend accepts checkIn & checkOut as optional logs
      if (formData.checkIn) queryParams.append("checkIn", formData.checkIn);
      if (formData.checkOut) queryParams.append("checkOut", formData.checkOut);

      const data = await apiFetch({
        endpoint: `/properties/search?${queryParams.toString()}`,
        method: "GET",
        cacheable: false,
      });

      // Backend returns: { success, count, properties }
      navigate("/search", { state: { properties: data.properties } });
    } catch (err) {
      setError(err.message || "Search failed. Please try again.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="relative w-full h-full md:h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/hero-bg.jpg')",
      }}
    >
      <div className="relative z-10 flex flex-col items-center justify-between pb-8 h-full text-white px-4">
        <Navbar />
        <div className="w-full max-w-6xl bg-white bg-opacity-90 p-6 rounded-[24px] shadow-lg mt-10">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Miami, FL"
            />
            <Input
              label="Date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="16th Oct"
            />
            <Input
              label="Capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="20 - 50"
            />
            <Input
              label="Event Type"
              name="event-type"
              value={formData.eventType}
              onChange={handleChange}
              placeholder="Wedding"
            />
            <div className="flex justify-center">
              <Button children="Search" />
            </div>
          </form>
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        </div>
        <div className="container mx-auto mt-10 flex items-center justify-between">
          <h2 className="text-4xl">
            Book the <span className="block text-blue-500">Perfect Venue</span>{" "}
            with Ease
          </h2>
          <p className="w-1/4">
            From weddings to business conferences, discover event spaces
            tailored to your needs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
