import React, { useState } from "react";
import { apiFetch } from "../utils/api";

const EditPropertyModal = ({ property, onClose, onUpdate }) => {
  const [data, setData] = useState({
    title: property.title || "",
    description: property.description || "",
    location: {
      address: property.location?.address || "",
      city: property.location?.city || "",
      state: property.location?.state || "",
      country: property.location?.country || "",
      coordinates: {
        lat: property.location?.coordinates?.lat || 0,
        lng: property.location?.coordinates?.lng || 0,
      },
    },
    features: {
      capacity: property.features?.capacity || 0,
      size: property.features?.size || 0,
      amenities: property.features?.amenities || [],
    },
    pricing: {
      weekdayPrice: property.pricing?.weekdayPrice || 0,
      weekendPrice: property.pricing?.weekendPrice || 0,
      minimumBookingHours: property.pricing?.minimumBookingHours || 1,
    },
    bookingSettings: {
      instantBooking: property.bookingSettings?.instantBooking || false,
      advanceBookingDays: property.bookingSettings?.advanceBookingDays || 30,
      cancellationPolicy:
        property.bookingSettings?.cancellationPolicy || "flexible",
    },
    extras: property.extras || [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const [newExtra, setNewExtra] = useState({ name: "", price: 0 });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val =
      type === "checkbox"
        ? checked
        : type === "number"
        ? parseFloat(value) || 0
        : value;

    const keys = name.split(".");
    if (keys.length === 1) {
      setData((prev) => ({ ...prev, [name]: val }));
    } else if (keys.length === 2) {
      setData((prev) => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0]], [keys[1]]: val },
      }));
    } else if (keys.length === 3) {
      setData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: { ...prev[keys[0]][keys[1]], [keys[2]]: val },
        },
      }));
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setData((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          amenities: [...prev.features.amenities, newAmenity.trim()],
        },
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (index) => {
    setData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        amenities: prev.features.amenities.filter((_, i) => i !== index),
      },
    }));
  };

  const addExtra = () => {
    if (newExtra.name.trim() && newExtra.price > 0) {
      setData((prev) => ({
        ...prev,
        extras: [...prev.extras, { ...newExtra }],
      }));
      setNewExtra({ name: "", price: 0 });
    }
  };

  const removeExtra = (index) => {
    setData((prev) => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("pricing", JSON.stringify(data.pricing));
      formData.append("features", JSON.stringify(data.features));
      formData.append("bookingSettings", JSON.stringify(data.bookingSettings));
      formData.append("location", JSON.stringify(data.location));
      formData.append("coordinates", JSON.stringify(data.coordinates));
      formData.append("extras", JSON.stringify(data.extras));

      // ✅ FIXED: Added missing closing parenthesis
      (data.imageFiles || []).forEach((file) =>
        formData.append("images", file)
      );
      const response = await apiFetch({
        endpoint: `/properties/${property._id}`,
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      // if (!response.ok) throw new Error("Failed to update property");
      console.log(response);
      // const updated = await response.json();
      onUpdate(response);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-y-auto flex flex-col px-8 py-10">
        <h2 className="text-2xl font-bold mb-6">Edit Property Listing</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={data.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={data.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={data.location.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  name="location.city"
                  value={data.location.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  name="location.state"
                  value={data.location.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="location.country"
                  value={data.location.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="location.coordinates.lat"
                  value={data.location.coordinates.lat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="location.coordinates.lng"
                  value={data.location.coordinates.lng}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  name="features.capacity"
                  value={data.features.capacity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Size (sq ft)
                </label>
                <input
                  type="number"
                  name="features.size"
                  value={data.features.size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Amenities
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addAmenity())
                  }
                  placeholder="Add amenity"
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addAmenity}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.features.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Weekday Price
                </label>
                <input
                  type="number"
                  name="pricing.weekdayPrice"
                  value={data.pricing.weekdayPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Weekend Price
                </label>
                <input
                  type="number"
                  name="pricing.weekendPrice"
                  value={data.pricing.weekendPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Min. Booking Hours
                </label>
                <input
                  type="number"
                  name="pricing.minimumBookingHours"
                  value={data.pricing.minimumBookingHours}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Booking Settings */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Booking Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="bookingSettings.instantBooking"
                  checked={data.bookingSettings.instantBooking}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label className="ml-2 text-sm font-medium">
                  Instant Booking
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Advance Booking Days
                  </label>
                  <input
                    type="number"
                    name="bookingSettings.advanceBookingDays"
                    value={data.bookingSettings.advanceBookingDays}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cancellation Policy
                  </label>
                  <select
                    name="bookingSettings.cancellationPolicy"
                    value={data.bookingSettings.cancellationPolicy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="flexible">Flexible</option>
                    <option value="moderate">Moderate</option>
                    <option value="strict">Strict</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Extras */}
          <div className="pb-4">
            <h3 className="text-lg font-semibold mb-3">Extras</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newExtra.name}
                onChange={(e) =>
                  setNewExtra({ ...newExtra, name: e.target.value })
                }
                placeholder="Extra name"
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="number"
                value={newExtra.price}
                onChange={(e) =>
                  setNewExtra({
                    ...newExtra,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Price"
                className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={addExtra}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {data.extras.map((extra, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{extra.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">${extra.price}</span>
                    <button
                      type="button"
                      onClick={() => removeExtra(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EditPropertyModal;
