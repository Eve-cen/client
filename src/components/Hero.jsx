import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import Input from "./Input";
import Button from "./Button";
import Navbar from "./Navbar";
import DateSelector from "./DateSelector";
import { MapPin, Building2, Globe, TowerControlIcon } from "lucide-react"; // pick suitable icons

const Hero = ({ onExplore }) => {
  const navigate = useNavigate();
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
  const [showSuggestions, setShowSuggestions] = useState(false);

  const locations = [
    {
      label: "Nearby",
      sublabel: "Find what's around you",
      icon: MapPin,
      bgClass: "bg-blue-200",
      textClass: "text-blue-600",
    },
    {
      label: "Paris, France",
      sublabel: "For sights like Eiffel Tower",
      icon: TowerControlIcon, // Eiffel Tower-like icon
      bgClass: "bg-red-200",
      textClass: "text-red-600",
    },
    {
      label: "Barcelona, Spain",
      sublabel: "Popular beach destination",
      icon: Building2, // Barcelona-style building icon
      bgClass: "bg-yellow-200",
      textClass: "text-yellow-600",
    },
    {
      label: "Lisbon, Portugal",
      sublabel: "For its bustling nightlife",
      icon: Globe, // general globe icon
      bgClass: "bg-green-200",
      textClass: "text-green-600",
    },
  ];

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
      <div className="relative z-10 flex flex-col items-center justify-between pb-8 h-full px-4">
        <Navbar />
        <div className="w-full max-w-6xl bg-white bg-opacity-90 p-6 rounded-[24px] shadow-lg mt-10">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            <div className="relative">
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={(e) => {
                  handleChange(e);
                  setShowSuggestions(true);
                }}
                placeholder="Type location"
                onFocus={() => setShowSuggestions(true)}
              />

              {showSuggestions && (
                <div className="absolute z-50 min-w-lg w-full bg-white border border-gray-200 rounded-lg shadow-md p-3">
                  <p className="text-xs font-semibold mb-2">
                    Suggested destinations
                  </p>
                  {locations.map(
                    ({ label, sublabel, icon: Icon, bgClass, textClass }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, location: label }));
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center gap-3 text-left py-3 px-2 hover:bg-gray-50 rounded-lg transition"
                      >
                        {/* Icon with tinted background */}
                        <div
                          className={`rounded-lg p-2 flex items-center justify-center ${bgClass}`}
                        >
                          <Icon size={20} className={textClass} />
                        </div>

                        {/* Label + Sublabel */}
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium">
                            {label}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {sublabel}
                          </span>
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
            <DateSelector
              label="Date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="16/03/2026"
              minDate={new Date().toISOString().split("T")[0]}
            />
            <Input
              label="Event Type"
              name="event-type"
              value={formData.eventType}
              onChange={handleChange}
              placeholder="Wedding"
            />
            <Input
              label="Capacity"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="20"
            />

            <Button children="Search" className="py-1" />
          </form>
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        </div>
        <div className="container mx-auto mt-10 flex items-center justify-between text-white">
          <h2 className="text-4xl">
            Book the <span className="block text-primary">Perfect Venue</span>{" "}
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
