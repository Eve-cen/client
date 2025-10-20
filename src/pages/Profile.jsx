import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import ProfileSidebar from "../components/ProfileSidebar";
import Input from "../components/Input";
import Button from "../components/Button";
import TripCard from "../components/TripCard";
import ReviewCard from "../components/ReviewCard";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [pastTrips, setPastTrips] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { pathname } = useLocation();
  const [filters, setFilters] = useState({ location: "", date: "", price: "" });
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, tripsData] = await Promise.all([
          apiFetch({
            endpoint: "/auth/me",
            method: "GET",
            cacheable: true,
            credentials: "include",
          }),
          apiFetch({
            endpoint: "/bookings/past",
            method: "GET",
            credentials: "include",
          }),
        ]);
        setUser(userData);
        setPastTrips(tripsData);

        const userReviews = await apiFetch({
          endpoint: "/auth/me",
          method: "GET",
          credentials: "include",
        }).then((u) => u.reviews || []);
        setReviews(userReviews);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load profile data.");
        if (err.message.includes("401")) navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch({
        endpoint: "/profile",
        method: "PUT",
        body: {
          profileImage: user.profileImage,
          displayName: user.displayName,
          bio: user.bio,
        },
        credentials: "include",
      });
      setUser(data);
    } catch (err) {
      setError(err.message || "Update failed.");
    }
  };

  const handleWriteReview = async (tripId) => {
    // Placeholder: Implement review submission logic
    console.log("Write review for trip:", tripId);
    await apiFetch({
      endpoint: `/bookings/${tripId}/reviewed`,
      method: "PUT",
      credentials: "include",
    });
    setPastTrips(
      pastTrips.map((t) => (t._id === tripId ? { ...t, reviewed: true } : t))
    );
  };

  const handleBookAgain = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredTrips = pastTrips.filter((trip) => {
    const matchesLocation =
      !filters.location ||
      trip.property.location
        .toLowerCase()
        .includes(filters.location.toLowerCase());
    const matchesDate =
      !filters.date ||
      new Date(trip.checkOut).toLocaleDateString().includes(filters.date);
    const matchesPrice =
      !filters.price || trip.totalPrice <= parseInt(filters.price);
    return matchesLocation && matchesDate && matchesPrice;
  });

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sort === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
    return b.rating - a.rating; // Sort by stars
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || "User not found."}</div>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ProfileSidebar />
      <div className="flex-1 ml-64 p-8">
        {pathname === "/profile/about" && (
          <div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleProfileUpdate} className="w-full flex gap-10">
              <img
                src={user.profileImage}
                className="w-64 h-64 object-cover rounded-full"
              />
              <div className="flex-1">
                <h2 className="text-4xl">About</h2>
                <p className="mb-6">
                  Hosts and guests can see your profile and it may appear across
                  Airbnb to help us build trust in our community.
                </p>
                <Input
                  label="Display Name"
                  name="displayName"
                  value={user.displayName || ""}
                  onChange={handleChange}
                />
                <textarea
                  label="Bio"
                  name="bio"
                  value={user.bio || ""}
                  onChange={handleChange}
                  className={`mt-1 p-2 w-full h-48 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                ></textarea>
                <Button type="submit" children="Save Changes" />
              </div>
            </form>
          </div>
        )}
        {pathname === "/profile/past-trips" && (
          <div>
            <h2 className="text-4xl">Past trips</h2>
            <div className="flex gap-4 mb-4">
              <Input
                label="Location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                classes="flex-1"
              />
              <Input
                label="Date"
                name="date"
                type="date"
                value={filters.date}
                onChange={handleFilterChange}
                classes="flex-1"
              />
              <Input
                label="Max Price"
                name="price"
                type="number"
                value={filters.price}
                onChange={handleFilterChange}
                classes="flex-1"
              />
            </div>
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip) => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  onWriteReview={() => handleWriteReview(trip._id)}
                  onBookAgain={() => handleBookAgain(trip.property._id)}
                />
              ))
            ) : (
              <p className="text-gray-500">No past trips found.</p>
            )}
          </div>
        )}
        {pathname === "/profile/reviews" && (
          <div>
            <h2 className="text-4xl">Reviews</h2>

            <div className="my-4">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="p-2 border rounded-lg"
              >
                <option value="recent">Most Recent</option>
                <option value="stars">Highest Rated</option>
              </select>
            </div>
            {sortedReviews.length > 0 ? (
              sortedReviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))
            ) : (
              <p className="text-gray-500">No reviews yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  }
};

export default Profile;
