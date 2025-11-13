import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import Input from "./Input";
import Button from "./Button";

const EditPropertyModal = ({ property, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: property.title,
    description: property.description,
    location: property.location,
    "pricing.weekdayPrice": property.pricing.weekdayPrice,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const updated = await apiFetch({
        endpoint: `/properties/${property._id}`,
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      onUpdate(updated);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Listing</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            textarea
          />
          <Input
            label="Location"
            name="location"
            value={formData.location.address}
            onChange={handleChange}
            required
          />
          <Input
            label="Weekday Price"
            name="pricing.weekdayPrice"
            type="number"
            value={formData["pricing.weekdayPrice"]}
            onChange={handleChange}
            required
          />
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-pink-600 text-white"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyModal;
