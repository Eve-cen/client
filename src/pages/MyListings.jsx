import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import PropertyCard from "../components/PropertyCard";
import EditPropertyModal from "../components/EditPropertyModal";
import Button from "../components/Button";

const MyListings = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProperty, setEditingProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!currentUser && !loading) {
      navigate("/login");
      return;
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await apiFetch({
          endpoint: "/auth/me",
          method: "GET",
          credentials: "include",
        });
        setCurrentUser(user._id);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await apiFetch({
        endpoint: "/properties",
        method: "GET",
        credentials: "include",
      });

      setProperties(data.properties);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load listings");
      if (err.message.includes("401")) navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const userProperties = properties.filter((p) => p.host._id === currentUser);

  const handleEdit = (property) => {
    setEditingProperty(property);
    setShowModal(true);
  };

  const handleUpdate = (updatedProperty) => {
    setProperties((prev) =>
      prev.map((p) => (p._id === updatedProperty._id ? updatedProperty : p))
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;
    try {
      await apiFetch({
        endpoint: `/properties/${id}`,
        method: "DELETE",
        credentials: "include",
      });
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            My Listings
          </h1>
          <Button
            onClick={() => navigate("/create-space")}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          >
            + Add New Space
          </Button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {userProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              You haven't listed any spaces yet.
            </p>
            <Button
              onClick={() => navigate("/create-space")}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg"
            >
              List Your First Space
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProperties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default MyListings;
