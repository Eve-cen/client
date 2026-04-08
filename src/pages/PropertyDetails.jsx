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
import VencomeLoader from "../components/Loader";
import { FileText, Download } from "lucide-react";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
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
    setUser(localStorage.getItem("user"));
  }, [id]);

  if (loading) {
    return <VencomeLoader />;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-center">
          <p>{error || "Property not found."}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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
                    ({property.reviewNumber} reviews)
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
              {/* {user && user._id !== property.host._id && <ChatBox />} */}
            </div>
          </div>
        </div>
        <PropertyDescription data={property.description} />
        {property.cqcDocuments?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              CQC Compliance Documents
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Download and review the host's CQC compliance documentation before
              booking.
            </p>
            <div className="space-y-3">
              {property.cqcDocuments.map((url, index) => {
                const fileName =
                  url.split("/").pop() || `CQC-Document-${index + 1}`;
                const ext = fileName.split(".").pop().toLowerCase();
                const iconColor =
                  ext === "pdf" ? "text-red-500" : "text-blue-500";
                const bgColor =
                  ext === "pdf"
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200";

                return (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={fileName}
                    className={`flex items-center justify-between p-4 border rounded-xl transition-all hover:shadow-sm ${bgColor}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-white border flex items-center justify-center flex-shrink-0 ${iconColor}`}
                      >
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm truncate max-w-[200px]">
                          {fileName}
                        </p>
                        <p className="text-xs text-gray-500 uppercase">
                          {ext} Document
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
                      <Download size={16} />
                      Download
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
        <PropertyOffers data={property.features} />
        <PropertyLocation data={property.coordinates} />
        <ReviewsSection reviews={property.reviews} />
        <div className="mt-10">{host && <HostCard host={host} />}</div>
      </div>
    </div>
  );
};

export default PropertyDetails;
