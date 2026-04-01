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
  const [draft, setDraft] = useState(null); // ← single draft
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
        if (!user) navigate("/login");
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchProperties();
    fetchDraft(); // ← added
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

  // ── fetch the single user draft ──────────────────────────────────────────
  const fetchDraft = async () => {
    try {
      const res = await apiFetch({ endpoint: "/drafts", method: "GET" });
      if (res.success && res.draft) setDraft(res.draft);
    } catch {
      // 404 just means no draft — silence it
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
    if (!showDeleteModal || countdown === 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [showDeleteModal, countdown]);

  const handleDelete = async () => {
    try {
      await apiFetch({
        endpoint: `/properties/${deleteId}`,
        method: "DELETE",
        credentials: "include",
      });
      setProperties((prev) => prev.filter((p) => p._id !== deleteId)); // ← was `id` (bug fix)
      setShowDeleteModal(false);
    } catch (err) {
      console.log(err);
      alert("Failed to delete");
    }
  };

  const handleDeleteDraft = async () => {
    try {
      await apiFetch({ endpoint: "/drafts", method: "DELETE" });
      setDraft(null);
    } catch (err) {
      console.error("Failed to delete draft:", err);
      toast?.error("Failed to discard draft");
    }
  };

  if (loading) return <VencomeLoader />;

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

        {/* ── Draft card (always first) ─────────────────────────────────── */}
        {draft && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-500 mb-3">
              Continue where you left off
            </h2>
            <div
              onClick={() => navigate("/create-space")}
              className="relative w-full sm:w-80 rounded-xl border-2 border-dashed border-yellow-300 bg-white p-4 cursor-pointer hover:border-yellow-400 hover:shadow-md transition group"
            >
              {/* Badge */}
              <span className="absolute top-3 left-3 z-10 bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                Draft
              </span>

              {/* Thumbnail */}
              <div className="w-full h-36 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden mb-3">
                {draft.images?.[0]?.url ? (
                  <img
                    src={draft.images[0].url}
                    alt="Draft thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-10 h-10 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </div>

              <p className="text-sm font-semibold text-gray-800 truncate">
                {draft.title || "Untitled draft"}
              </p>

              {draft.location?.city && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {draft.location.city}
                  {draft.location.country ? `, ${draft.location.country}` : ""}
                </p>
              )}

              <p className="text-xs text-gray-400 mt-0.5">
                Last saved{" "}
                {draft.lastSaved
                  ? new Date(draft.lastSaved).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </p>

              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-primary font-medium group-hover:underline">
                  Continue editing →
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDraft();
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition"
                  title="Discard draft"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Published listings ────────────────────────────────────────── */}
        {userProperties.length === 0 && !draft ? (
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
        ) : userProperties.length > 0 ? (
          <>
            {draft && (
              <h2 className="text-lg font-semibold text-gray-500 mb-3">
                Published
              </h2>
            )}
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
          </>
        ) : null}
      </div>

      {/* ── Delete modal ─────────────────────────────────────────────────── */}
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
