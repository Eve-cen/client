import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import PropertyCard from "../components/PropertyCard";
import EditPropertyModal from "../components/EditPropertyModal";
import Button from "../components/Button";
import VencomeLoader from "../components/Loader";

const MyListings = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProperty, setEditingProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await apiFetch({
          endpoint: "/auth/me",
          method: "GET",
          credentials: "include",
        });
        setCurrentUser(user._id);
        if (!user) {
          navigate("/login");
          return;
        }
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

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setCountdown(5);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    if (!showDeleteModal) return;

    if (countdown === 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showDeleteModal, countdown]);

  const handleDelete = async () => {
    try {
      await apiFetch({
        endpoint: `/properties/${deleteId}`,
        method: "DELETE",
        credentials: "include",
      });
      setProperties((prev) => prev.filter((p) => p._id !== id));
      window.location.reload();
    } catch (err) {
      console.log(err);
      alert("Failed to delete");
    }
  };

  if (loading) {
    return <VencomeLoader />;
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
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80"
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
              className="bg-primary text-white px-6 py-2 rounded-lg"
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
                onDelete={() => openDeleteModal(property._id)}
              />
            ))}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Delete listing
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              This action is permanent. The property will be deleted and cannot
              be recovered.
            </p>

            <p className="text-gray-600 mb-4">
              {countdown > 0
                ? `You can delete in (${countdown}s)`
                : "You can now delete this property"}
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded border cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={countdown > 0}
                className={`px-4 py-2 rounded text-white ${
                  countdown > 0
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 cursor-pointer"
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
