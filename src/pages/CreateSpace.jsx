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
  const totalSteps = 8;
  const [errors, setErrors] = useState({});
  const [apiKey, setApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [spaceData, setSpaceData] = useState({
    title: "",
    description: "",
    location: "",
    coordinates: { latitude: null, longitude: null },
    features: { wifi: false, restrooms: 0, sizeSQM: 0, seatCapacity: 0 },
    extras: [],
    images: [],
    pricing: { weekdayPrice: 0, preTaxPrice: 0, discounts: {} },
    bookingSettings: { approveFirstFive: false, instantBook: true },
  });
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (step > totalSteps) {
      handleSubmit();
    }
  }, [step]);

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
    // Clear error for this field when user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (type === "checkbox") {
      setSpaceData((prev) => ({
        ...prev,
        [name.split(".")[0]]: {
          ...prev[name.split(".")[0]],
          [name.split(".")[1]]: checked,
        },
      }));
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setSpaceData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setSpaceData((prev) => ({ ...prev, [name]: value }));
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
    setSpaceData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const handleImageReorder = (newImages) => {
    setSpaceData((prev) => ({
      ...prev,
      images: newImages,
      coverImage: newImages[0],
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
        if (!spaceData.location.trim()) {
          newErrors.location = "Address is required";
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
        if (spaceData.images.length === 0) {
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
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      await apiFetch({
        endpoint: "/properties",
        method: "POST",
        body: spaceData,
        credentials: "include",
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating space:", err);
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
      <div className="min-w-4xl mx-auto">
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
              label="Address"
              name="location"
              value={spaceData.location}
              onChange={handleChange}
              required
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
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
            {spaceData.images.length > 0 && (
              <p className="text-green-600 text-sm mt-2">
                {spaceData.images.length} photo(s) added
              </p>
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
              images={spaceData.images}
              onReorder={handleImageReorder}
              onAddMore={() => setShowPopup(true)}
            />
          </div>
        )}
        {step === 7 && (
          <div>
            <h2 className="text-4xl my-4">Step 7: Pricing</h2>
            <Input
              label="Weekday Price"
              name="pricing.weekdayPrice"
              type="number"
              value={spaceData.pricing.weekdayPrice}
              onChange={handleChange}
              required
            />
            {errors.weekdayPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.weekdayPrice}</p>
            )}
            <p className="text-gray-600 mt-2">
              Price before tax: ${spaceData.pricing.weekdayPrice}
            </p>
          </div>
        )}
        {step === 8 && (
          <div>
            <h2 className="text-4xl my-4">Step 8: Booking Settings</h2>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                name="bookingSettings.approveFirstFive"
                checked={spaceData.bookingSettings.approveFirstFive}
                onChange={handleChange}
              />
              <span className="ml-2">Approve first 5 bookings</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                name="bookingSettings.instantBook"
                checked={spaceData.bookingSettings.instantBook}
                onChange={handleChange}
              />
              <span className="ml-2">Instant Book</span>
            </label>
          </div>
        )}
        {step === 9 && (
          <div>
            <h2 className="text-4xl my-4">Step 9: Discounts</h2>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                name="newListing"
                checked={spaceData.pricing.discounts.newListing}
                onChange={handleDiscountChange}
              />
              <span className="ml-2">New Listing Promotion (20%)</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                name="lastMinute"
                checked={spaceData.pricing.discounts.lastMinute}
                onChange={handleDiscountChange}
              />
              <span className="ml-2">Last Minute Discount (1%)</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                name="weekly"
                checked={spaceData.pricing.discounts.weekly}
                onChange={handleDiscountChange}
              />
              <span className="ml-2">Weekly Discount (10%)</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                name="monthly"
                checked={spaceData.pricing.discounts.monthly}
                onChange={handleDiscountChange}
              />
              <span className="ml-2">Monthly Discount (20%)</span>
            </label>
          </div>
        )}
        {step === 10 && (
          <div>
            <h2 className="text-4xl my-4">Step 10: Overview</h2>
            <p>Title: {spaceData.title}</p>
            <p>Description: {spaceData.description}</p>
            <p>Location: {spaceData.location}</p>
            <p>Coordinates: {JSON.stringify(spaceData.coordinates)}</p>
            <p>Features: {JSON.stringify(spaceData.features)}</p>
            <p>Extras: {JSON.stringify(spaceData.extras)}</p>
            <p>Images: {spaceData.images.length} uploaded</p>
            <p>
              Pricing: ${spaceData.pricing.weekdayPrice} (pre-tax: $
              {spaceData.pricing.preTaxPrice})
            </p>
            <p>Booking Settings: {JSON.stringify(spaceData.bookingSettings)}</p>
            <p>Discounts: {JSON.stringify(spaceData.pricing.discounts)}</p>
            <div className="mt-4 space-x-2">
              <Button
                onClick={() => setStep(1)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </div>
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
