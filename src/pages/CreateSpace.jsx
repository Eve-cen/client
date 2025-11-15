import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import ProgressBar from "../components/ProgressBar";
import Input from "../components/Input";
import Button from "../components/Button";
import ExtraInput from "../components/ExtraInput";
import ImageUploadPopup from "../components/ImageUploadPopup";
import ImageReorder from "../components/ImageReorder";
import YesNoToggle from "../components/YesNoToggle";
import Counter from "../components/Counter";

const CreateSpace = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 10;
  const [errors, setErrors] = useState({});
  const [apiKey, setApiKey] = useState("");
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [spaceData, setSpaceData] = useState({
    title: "Elegant Space",
    description:
      "A stylish and modern event space perfect for meetings, parties, or corporate events.",
    location: {
      address: "15 Palm Avenue",
      city: "Lagos",
      country: "NG",
    },
    coordinates: { latitude: 6.5244, longitude: 3.3792 },
    features: {
      wifi: true,
      restrooms: 4,
      sizeSQM: 120,
      seatCapacity: 50,
    },
    extras: [
      { name: "Projector", price: 50 },
      { name: "Sound System", price: 50 },
      { name: "Catering Available", price: 50 },
    ],
    imageFiles: [], // ✅ Actual File objects
    imagePreviews: [], // ✅ Blob URLs for preview
    coverImage: null, // ✅ Preview URL of cover image
    category: "6915bd724f4f95223e555e57",
    price: 750,
    pricing: {
      weekdayPrice: 560,
      preTaxPrice: 500,
      discounts: {
        newListing: true,
        lastMinute: false,
      },
    },
    bookingSettings: {
      approveFirstFive: false,
      instantBook: true,
    },
  });

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (step > totalSteps) {
      handleSubmit();
    }
  }, [step]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiFetch({
          endpoint: "/categories",
          method: "GET",
        });
        setCategories(response);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Load Google Maps Script
  useEffect(() => {
    if (step === 3 && apiKey && !mapLoaded) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
        initializeMap();
      };
      document.head.appendChild(script);

      return () => {
        // Cleanup script if component unmounts
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    } else if (step === 3 && mapLoaded) {
      initializeMap();
    }
  }, [step, apiKey, mapLoaded]);

  const initializeMap = () => {
    if (!window.google || !window.google.maps) return;

    const defaultCenter = {
      lat: spaceData.coordinates.latitude || 7.3775, // Ibadan coordinates as default
      lng: spaceData.coordinates.longitude || 3.947,
    };

    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: defaultCenter,
      zoom: 13,
    });

    mapRef.current = map;

    // Add existing marker if coordinates exist
    if (spaceData.coordinates.latitude && spaceData.coordinates.longitude) {
      markerRef.current = new window.google.maps.Marker({
        position: defaultCenter,
        map: map,
        draggable: true,
      });

      // Update coordinates when marker is dragged
      markerRef.current.addListener("dragend", (event) => {
        setSpaceData((prev) => ({
          ...prev,
          coordinates: {
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
          },
        }));
        setErrors((prev) => ({ ...prev, latitude: "", longitude: "" }));
      });
    }

    // Add marker on map click
    map.addListener("click", (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      // Remove old marker if exists
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Create new marker
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        draggable: true,
      });

      // Update coordinates
      setSpaceData((prev) => ({
        ...prev,
        coordinates: { latitude: lat, longitude: lng },
      }));
      setErrors((prev) => ({ ...prev, latitude: "", longitude: "" }));

      // Update coordinates when marker is dragged
      markerRef.current.addListener("dragend", (event) => {
        setSpaceData((prev) => ({
          ...prev,
          coordinates: {
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
          },
        }));
      });
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));

    const val =
      type === "checkbox" ? checked : type === "number" ? Number(value) : value;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setSpaceData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: val },
      }));
    } else {
      setSpaceData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleFeatureChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");
    setSpaceData((prev) => {
      const updated = { ...prev };
      let ref = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleExtraChange = (index, updatedExtra) => {
    setSpaceData((prev) => ({
      ...prev,
      extras: prev.extras.map((extra, i) =>
        i === index ? updatedExtra : extra
      ),
    }));
  };

  const handleAddExtra = () => {
    setSpaceData((prev) => ({
      ...prev,
      extras: [...prev.extras, { name: "", price: 0 }],
    }));
  };

  const handleRemoveExtra = (index) => {
    setSpaceData((prev) => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (newImages) => {
    setErrors((prev) => ({ ...prev, images: "" }));
    console.log(newImages);

    // Create preview URLs for the new images
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));

    setSpaceData((prev) => ({
      ...prev,
      imageFiles: [...(prev.imageFiles || []), ...newImages], // Store File objects
      imagePreviews: [...(prev.imagePreviews || []), ...newPreviews], // Store preview URLs
      coverImage: prev.coverImage || newPreviews[0] || null, // Keep existing cover or use first new image
    }));
  };

  const handleImageReorder = (reorderedPreviews) => {
    // Find the new order of indices
    const newOrder = reorderedPreviews.map((preview) =>
      spaceData.imagePreviews.indexOf(preview)
    );

    // Reorder both imageFiles and imagePreviews based on new order
    const reorderedFiles = newOrder.map((index) => spaceData.imageFiles[index]);

    setSpaceData((prev) => ({
      ...prev,
      imageFiles: reorderedFiles,
      imagePreviews: reorderedPreviews,
      coverImage: reorderedPreviews[0] || null, // First image becomes cover
    }));
  };

  const handleDiscountChange = (e) => {
    const { name, checked } = e.target;
    setSpaceData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        discounts: { ...prev.pricing.discounts, [name]: checked },
      },
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!spaceData.title.trim()) {
          newErrors.title = "Event space name is required";
        }
        if (!spaceData.description.trim()) {
          newErrors.description = "Description is required";
        }
        break;

      case 2:
        if (!spaceData.location.address.trim()) {
          newErrors["location.address"] = "Address is required";
        }
        if (!spaceData.location.city.trim()) {
          newErrors["location.city"] = "City is required";
        }
        if (!spaceData.location.country.trim()) {
          newErrors["location.country"] = "Country is required";
        }
        break;
      case 3:
        if (!spaceData.coordinates.latitude) {
          newErrors.latitude = "Latitude is required";
        }
        if (!spaceData.coordinates.longitude) {
          newErrors.longitude = "Longitude is required";
        }
        break;
      case 5:
        if (spaceData.imagePreviews.length === 0) {
          newErrors.images = "Please add at least one photo";
        }
        break;
      case 7:
        if (
          !spaceData.pricing.weekdayPrice ||
          spaceData.pricing.weekdayPrice <= 0
        ) {
          newErrors.weekdayPrice = "Please enter a valid price";
        }
        break;
      // case 8:
      //   if (!spaceData.category) {
      //     newErrors.category = "Please select a category";
      //   }
      // break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", spaceData.title);
      formData.append("description", spaceData.description);
      formData.append("category", spaceData.category);
      formData.append("pricing", JSON.stringify(spaceData.pricing));
      formData.append("features", JSON.stringify(spaceData.features));
      formData.append(
        "bookingSettings",
        JSON.stringify(spaceData.bookingSettings)
      );
      formData.append("location", JSON.stringify(spaceData.location));
      formData.append("coordinates", JSON.stringify(spaceData.coordinates));
      formData.append("extras", JSON.stringify(spaceData.extras));

      // ✅ FIXED: Added missing closing parenthesis
      (spaceData.imageFiles || []).forEach((file) =>
        formData.append("images", file)
      );

      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/properties", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create space");
      }

      setShowModal(true);

      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowModal(false);
            navigate("/", { replace: true });
          }
          return prev - 1;
        });
      }, 1000);

      return await res.json();
    } catch (err) {
      console.error("Error creating space:", err);
      throw err;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between bg-gray-50 p-4 sm:p-8">
      <div className="container mx-auto">
        {step === 1 && (
          <div>
            <h2 className="text-4xl my-4">Basic Info</h2>
            <Input
              label="Event space name"
              name="title"
              value={spaceData.title}
              onChange={handleChange}
              required
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Bio
            </label>
            <textarea
              label="Description"
              name="description"
              value={spaceData.description || ""}
              onChange={handleChange}
              className={`mt-1 p-2 w-full h-48 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="text-4xl my-4">Step 2: Location</h2>

            <Input
              placeholder="Address"
              name="location.address"
              value={spaceData.location.address}
              onChange={handleChange}
              required
            />
            {errors["location.address"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["location.address"]}
              </p>
            )}

            <Input
              placeholder="City"
              name="location.city"
              value={spaceData.location.city}
              onChange={handleChange}
              required
            />
            {errors["location.city"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["location.city"]}
              </p>
            )}

            <Input
              placeholder="Country"
              name="location.country"
              value={spaceData.location.country}
              onChange={handleChange}
              required
            />
            {errors["location.country"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["location.country"]}
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-4xl my-4">Step 3: Confirm Location</h2>
            <p className="mb-4">
              Map placeholder (use Google Maps API to pin coordinates)
            </p>
            <div className="mb-4">
              <input
                type="number"
                step="0.000001"
                name="coordinates.latitude"
                value={spaceData.coordinates.latitude || ""}
                onChange={handleChange}
                placeholder="Latitude"
                className={`mt-1 p-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.latitude ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.latitude && (
                <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>
              )}
            </div>
            <div>
              <input
                type="number"
                step="0.000001"
                name="coordinates.longitude"
                value={spaceData.coordinates.longitude || ""}
                onChange={handleChange}
                placeholder="Longitude"
                className={`mt-1 p-2 w-full border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  errors.longitude ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.longitude && (
                <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>
              )}
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <h2 className="text-4xl my-4">Features & Extras</h2>
            <div className="mb-4">
              <YesNoToggle
                label="WiFi access"
                subtitle="Guests get access to free internet connection"
                name="features.wifi"
                value={spaceData.features.wifi}
                onChange={handleFeatureChange}
              />
              <Counter
                label="Restrooms"
                subtitle="Numbers of restrooms guests can use"
                name="features.restrooms"
                value={spaceData.features.restrooms}
                onChange={handleFeatureChange}
              />
              <div className="mt-5 flex gap-6 items-center">
                <Input
                  label="Size (SQM)"
                  name="features.sizeSQM"
                  type="number"
                  value={spaceData.features.sizeSQM}
                  onChange={handleFeatureChange}
                  classes="w-full"
                />
                <Input
                  label="Seat Capacity"
                  name="features.seatCapacity"
                  type="number"
                  value={spaceData.features.seatCapacity}
                  onChange={handleFeatureChange}
                  classes="w-full"
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Extras</h3>
              {spaceData.extras.map((extra, index) => (
                <ExtraInput
                  key={index}
                  extra={extra}
                  onChange={(updated) => handleExtraChange(index, updated)}
                  onRemove={() => handleRemoveExtra(index)}
                />
              ))}
              <Button
                onClick={handleAddExtra}
                className="mt-2 bg-pink-600 text-white px-4 py-2 rounded-lg"
              >
                Add More
              </Button>
            </div>
          </div>
        )}
        {step === 5 && (
          <div>
            <h2 className="text-4xl my-4">Step 5: Add Photos</h2>

            <Button
              onClick={() => setShowPopup(true)}
              className="mb-4 bg-pink-600 text-white px-4 py-2 rounded-lg"
            >
              Add Photos
            </Button>

            {errors.images && (
              <p className="text-red-500 text-sm mt-2">{errors.images}</p>
            )}

            {spaceData.imagePreviews.length > 0 && (
              <div className="mt-4">
                {/* Image preview grid */}
                <div className="grid grid-cols-2 gap-3 pb-10 h-[510px] overflow-scroll">
                  {spaceData.imagePreviews.map((img, index) => (
                    <div
                      key={index}
                      className={`relative w-full overflow-hidden rounded-lg border border-gray-200 ${
                        index === 0 ? "col-span-2 h-80" : "h-64"
                      }`}
                    >
                      <img
                        src={
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img)
                        }
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showPopup && (
              <ImageUploadPopup
                onClose={() => setShowPopup(false)}
                onUpload={handleImageUpload}
              />
            )}
          </div>
        )}
        {step === 6 && (
          <div>
            <h2 className="text-4xl my-4">Step 6: Rearrange Images</h2>
            <ImageReorder
              images={spaceData.imagePreviews} // ✅ Use imagePreviews for display
              onReorder={handleImageReorder}
              onAddMore={() => setShowPopup(true)}
            />
          </div>
        )}
        {step === 7 && (
          <div className="text-center flex flex-col items-center p-6">
            <h3 className="text-3xl font-semibold mb-2">
              Set a Weekday Price per Hour
            </h3>
            <p className="text-gray-600 mb-6">You can change it anytime.</p>

            <div className="flex items-center justify-center px-6 pt-4 mb-3">
              <span className="text-4xl font-bold text-blue-600 mr-1 mb-4">
                £
              </span>
              <Input
                name="pricing.weekdayPrice"
                type="number"
                min="0"
                value={spaceData.pricing.weekdayPrice}
                onChange={handleChange}
                required
                className="border-none bg-transparent text-center text-4xl font-semibold text-blue-600 focus:ring-0 focus:outline-none no-spinner dynamic-width"
              />
            </div>

            {errors.weekdayPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.weekdayPrice}</p>
            )}

            <p className="text-gray-500 mt-2">
              Price before tax:{" "}
              <span className="font-medium text-gray-700">
                £{spaceData.pricing.weekdayPrice || 0}
              </span>
            </p>
          </div>
        )}

        {step === 8 && (
          <div className="p-6">
            <h2 className="text-4xl font-semibold mb-2">
              Price your booking settings
            </h2>
            <p className="text-gray-600 mb-6">You can change it anytime.</p>

            <div className="space-y-4">
              {/* Option 1 - Approve first 5 bookings */}
              <label
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                  spaceData.bookingSettings.approveFirstFive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  setSpaceData((prev) => ({
                    ...prev,
                    bookingSettings: {
                      approveFirstFive: true,
                      instantBook: false,
                    },
                  }))
                }
              >
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">
                      Approve first 5 bookings
                    </span>
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 text-left">
                    You’ll manually approve your first 5 bookings. After that,
                    bookings can be automatic.
                  </p>
                </div>

                {/* Custom radio */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    spaceData.bookingSettings.approveFirstFive
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {spaceData.bookingSettings.approveFirstFive && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  )}
                </div>
              </label>

              {/* Option 2 - Instant Book */}
              <label
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                  spaceData.bookingSettings.instantBook
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  setSpaceData((prev) => ({
                    ...prev,
                    bookingSettings: {
                      approveFirstFive: false,
                      instantBook: true,
                    },
                  }))
                }
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-800">
                    Instant Book
                  </span>
                  <p className="text-sm text-gray-500 mt-1 text-left">
                    Guests can book instantly without needing your approval.
                  </p>
                </div>

                {/* Custom radio */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    spaceData.bookingSettings.instantBook
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {spaceData.bookingSettings.instantBook && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="p-6">
            <h2 className="text-4xl font-semibold mb-2">
              Set up your discounts
            </h2>
            <p className="text-gray-600 mb-6">
              Encourage more bookings with discounts.
            </p>

            <div className="space-y-4">
              {/* New Listing Promotion */}
              <label
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                  spaceData.pricing.discounts.newListing
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  handleDiscountChange({
                    target: {
                      name: "newListing",
                      checked: !spaceData.pricing.discounts.newListing,
                    },
                  })
                }
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-800">
                    New Listing Promotion (20%)
                  </span>
                  <p className="text-sm text-gray-500 mt-1 text-left">
                    Get noticed faster with an automatic 20% discount on your
                    first few bookings.
                  </p>
                </div>

                {/* Custom checkbox */}
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                    spaceData.pricing.discounts.newListing
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {spaceData.pricing.discounts.newListing && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </label>

              {/* Last Minute Discount */}
              <label
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                  spaceData.pricing.discounts.lastMinute
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  handleDiscountChange({
                    target: {
                      name: "lastMinute",
                      checked: !spaceData.pricing.discounts.lastMinute,
                    },
                  })
                }
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-800">
                    Last Minute Discount (1%)
                  </span>
                  <p className="text-sm text-gray-500 mt-1 text-left">
                    Offer small savings for guests booking within a few days of
                    arrival.
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                    spaceData.pricing.discounts.lastMinute
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {spaceData.pricing.discounts.lastMinute && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </label>

              {/* Weekly Discount */}
              <label
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                  spaceData.pricing.discounts.weekly
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  handleDiscountChange({
                    target: {
                      name: "weekly",
                      checked: !spaceData.pricing.discounts.weekly,
                    },
                  })
                }
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-800">
                    Weekly Discount (10%)
                  </span>
                  <p className="text-sm text-gray-500 mt-1 text-left">
                    Reward guests who stay for 7 nights or more.
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                    spaceData.pricing.discounts.weekly
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {spaceData.pricing.discounts.weekly && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </label>

              {/* Monthly Discount */}
              <label
                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                  spaceData.pricing.discounts.monthly
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() =>
                  handleDiscountChange({
                    target: {
                      name: "monthly",
                      checked: !spaceData.pricing.discounts.monthly,
                    },
                  })
                }
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-800">
                    Monthly Discount (20%)
                  </span>
                  <p className="text-sm text-gray-500 mt-1 text-left">
                    Attract long-term stays with generous monthly savings.
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                    spaceData.pricing.discounts.monthly
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {spaceData.pricing.discounts.monthly && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {step === 10 && (
          <div>
            <h2 className="text-4xl my-4">Category</h2>
            <p className="text-gray-600 mb-4">What type of space is this?</p>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <label
                  key={cat._id}
                  className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                    spaceData.category === cat._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setSpaceData((prev) => ({ ...prev, category: cat._id }));
                    setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                >
                  <span className="font-medium text-gray-800">{cat.name}</span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      spaceData.category === cat._id
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {spaceData.category === cat._id && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </label>
              ))}
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-2">{errors.category}</p>
            )}
          </div>
        )}

        {/* {step === 10 && (
          <div className="p-6">
            <h2 className="text-4xl font-semibold mb-2">Overview</h2>
            <p className="text-gray-600 mb-6">
              Review your property details before publishing.
            </p>

            <div className="space-y-4">
              <div className="p-4 border rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  Basic Information
                </h3>
                <p className="text-gray-700">
                  <strong>Title:</strong> {spaceData.title}
                </p>
                <p className="text-gray-700">
                  <strong>Description:</strong> {spaceData.description}
                </p>
                <p className="text-gray-700">
                  <strong>Location:</strong> {spaceData.location}
                </p>
                <p className="text-gray-700">
                  <strong>Coordinates:</strong>{" "}
                  {JSON.stringify(spaceData.coordinates)}
                </p>
              </div>

              <div className="p-4 border rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  Amenities & Extras
                </h3>
                <p className="text-gray-700">
                  <strong>Features:</strong>{" "}
                  {JSON.stringify(spaceData.features)}
                </p>
                <p className="text-gray-700">
                  <strong>Extras:</strong> {JSON.stringify(spaceData.extras)}
                </p>
                <p className="text-gray-700">
                  <strong>Images:</strong> {spaceData.images.length} uploaded
                </p>
              </div>

              <div className="p-4 border rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  Pricing
                </h3>
                <p className="text-gray-700">
                  <strong>Weekday Price:</strong> $
                  {spaceData.pricing.weekdayPrice}
                </p>
                <p className="text-gray-700">
                  <strong>Pre-tax Price:</strong> $
                  {spaceData.pricing.preTaxPrice}
                </p>
              </div>

              <div className="p-4 border rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  Booking Settings
                </h3>
                <pre className="bg-gray-50 text-gray-700 text-sm rounded-lg p-2 overflow-x-auto">
                  {JSON.stringify(spaceData.bookingSettings, null, 2)}
                </pre>
              </div>

              <div className="p-4 border rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  Discounts
                </h3>
                <pre className="bg-gray-50 text-gray-700 text-sm rounded-lg p-2 overflow-x-auto">
                  {JSON.stringify(spaceData.pricing.discounts, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2 rounded-lg border border-gray-300 transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => alert("Submitting property...")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition-all"
              >
                Submit Property
              </button>
            </div>
          </div>
        )} */}
      </div>
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              textAlign: "center",
              minWidth: "300px",
            }}
          >
            <h2>Your property is successfully created!</h2>
            <p>
              Redirecting in {countdown} second{countdown > 1 ? "s" : ""}...
            </p>
          </div>
        </div>
      )}
      <div>
        <ProgressBar step={step} totalSteps={totalSteps} />
        <div className="mt-6 flex justify-between items-center">
          <Link onClick={handleBack} disabled={step === 1}>
            Back
          </Link>
          <Button
            onClick={step === totalSteps ? handleSubmit : handleNext}
            className="px-4 py-2 bg-[#305CDE] text-white rounded-lg hover:bg-pink-700"
          >
            {step === totalSteps ? "Publish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateSpace;
