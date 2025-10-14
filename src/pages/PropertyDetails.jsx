import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import ImageGallery from "../components/ImageGallery";
import BookingForm from "../components/BookingForm";
import ReviewsSection from "../components/ReviewsSection";
import PropertyDescription from "../components/PropertyDescription";
import PropertyOffers from "../components/PropertyOffers";
import PropertyLocation from "../components/Location";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await apiFetch({
          endpoint: `/properties/${id}`,
          method: "GET",
          cacheable: true,
        });
        setProperty(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load property details.");
        console.error("Error fetching property:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-center">
          <p>{error || "Property not found."}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const images = [property.image].concat(
    Array(4)
      .fill()
      .map(
        () =>
          property.image || "https://source.unsplash.com/random/200x200/?house"
      )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gallery */}
          <div className="lg:col-span-2">
            <ImageGallery images={images} />
          </div>

          {/* Details and Booking */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8 space-y-6">
              <div>
                <h1 className="text-4xl mb-2">{property.title}</h1>
                <p className="text-gray-600 mb-2">{property.location}</p>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500">
                    ★ {property.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-600 ml-2">
                    ({property.reviews.length} reviews)
                  </span>
                </div>
                <p className="text-2xl">${property.price_per_hour} / night</p>
              </div>

              <BookingForm
                propertyId={property._id}
                pricePerNight={property.price_per_hour}
              />
            </div>
          </div>
        </div>
        <PropertyDescription data={property.description} />
        <PropertyOffers data={property.amenities} />
        <PropertyLocation data={property.location} />
        <ReviewsSection reviews={property.reviews} />
        {/* Host and Reviews */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Hosted by</h3>
          </div>
          <div className="lg:col-span-2"></div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
