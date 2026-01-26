import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { apiFetch, invalidateCache } from "../utils/api";

const PropertyManager = ({ property, onUpdate, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: property.title,
    description: property.description,
    price: property.price,
    location: property.location,
    image: property.image,
    rating: property.rating,
    category: property.category._id,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch({
        endpoint: `/properties/${property._id}`,
        method: "PUT",
        body: formData,
      });
      onUpdate(data);
      invalidateCache("/properties");
      setIsOpen(false);
    } catch (err) {
      setError(err.message || "Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;

    setError("");
    setLoading(true);

    try {
      await apiFetch({
        endpoint: `/properties/${property._id}`,
        method: "DELETE",
      });
      onDelete(property._id);
      invalidateCache("/properties");
      setIsOpen(false);
    } catch (err) {
      setError(err.message || "Failed to delete property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-primary text-white hover:bg-primary/80"
      >
        Edit Property
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Edit Property</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
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
              required
            />
            <Input
              label="Price per Night"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
            <Input
              label="Image URL"
              name="image"
              value={formData.image}
              onChange={handleChange}
            />
            <Input
              label="Rating"
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={handleChange}
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-lg"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-4 mt-6">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update Property"}
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? "Deleting..." : "Delete Property"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default PropertyManager;
