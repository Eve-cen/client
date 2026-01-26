import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import ImageGallery from "../components/ImageGallery";
import BookingForm from "../components/BookingForm";
import ReviewsSection from "../components/ReviewsSection";
import PropertyDescription from "../components/PropertyDescription";
import PropertyOffers from "../components/PropertyOffers";
import PropertyLocation from "../components/Location";
import Button from "../components/Button";
import ChatBox from "../components/ChatBox";
import HostCard from "../components/HostCard";
import vencomeLoader from "../components/Loader";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
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
        setProperty(data.property);
        const hostData = await apiFetch({
          endpoint: `/hosts/${data.property.host._id}`,
        });
        setHost(hostData);
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
    return <vencomeLoader />;
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

  // const images = [property.images].concat(
  //   Array(4)
  //     .fill()
  //     .map(
  //       () =>
  //         property.image ||
  //         "https://images.squarespace-cdn.com/content/v1/5b850dd4da02bc525570db40/1570534941146-CSQDPR3G9L8RGMG47OZ5/002.jpg?format=2500w"
  //     )
  // );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Gallery */}
          <div className="lg:col-span-2">
            <ImageGallery
              coverImage={property.coverImage}
              images={property.images}
            />
          </div>

          {/* Details and Booking */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8 space-y-6">
              <div>
                <h1 className="text-4xl mb-2">{property.title}</h1>
                <p className="text-gray-600 mb-2">
                  {property.location.address}, {property.location.city},{" "}
                  {property.location.country}
                </p>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500">
                    ★ {property.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {/* ({property.reviews.length} reviews) */}
                  </span>
                </div>
                {property.pricing?.pricingType === "HOURLY" ? (
                  <p className="text-2xl">
                    ${property.pricing?.hourlyPrice} / hour
                  </p>
                ) : (
                  <p className="text-2xl">
                    ${property.pricing?.weekdayPrice} / night
                  </p>
                )}
              </div>

              <BookingForm propertyId={property._id} property={property} />
              {/* {user && user._id !== property.host._id && ( */}
              <Button
                onClick={() => setShowChat(true)}
                className="mt-4 w-full bg-pink-600 text-white"
              >
                Message Host
              </Button>
              {/* )} */}

              {showChat && (
                <ChatBox
                  propertyId={property._id}
                  onClose={() => setShowChat(false)}
                />
              )}
            </div>
          </div>
        </div>
        <PropertyDescription data={property.description} />
        <PropertyOffers data={property.features} />
        <PropertyLocation data={property.coordinates} />
        <ReviewsSection reviews={property.reviews} />
        <div className="mt-10">{host && <HostCard host={host} />}</div>
      </div>
    </div>
  );
};

export default PropertyDetails;
