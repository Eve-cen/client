import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import ProgressBar from "../components/ProgressBar";
import Input from "../components/Input";
import Button from "../components/Button";
import ExtraInput from "../components/ExtraInput";
import ImageUploadPopup from "../components/ImageUploadPopup";
import ImageReorder from "../components/ImageReorder";

const CreateSpace = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 8;
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
    const { name, value, type, checked } = e.target;
    setSpaceData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [name]: type === "checkbox" ? checked : parseInt(value) || 0,
      },
    }));
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

  const handleSubmit = async () => {
    try {
      await apiFetch({
        endpoint: "/properties",
        method: "POST",
        body: spaceData,
        credentials: "include",
      });
      navigate("/dashboard"); // Redirect to dashboard or success page
    } catch (err) {
      console.error("Error creating space:", err);
    }
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
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
            <label className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              label="Description"
              name="description"
              value={spaceData.description || ""}
              onChange={handleChange}
              className={`mt-1 p-2 w-full h-48 border rounded-lg focus:ring-blue-500 focus:border-blue-500 border-gray-300`}
            ></textarea>
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
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 className="text-4xl my-4">Step 3: Confirm Location</h2>
            <p>Map placeholder (use Google Maps API to pin coordinates)</p>
            <input
              type="number"
              step="0.000001"
              name="coordinates.latitude"
              value={spaceData.coordinates.latitude || ""}
              onChange={handleChange}
              placeholder="Latitude"
            />
            <input
              type="number"
              step="0.000001"
              name="coordinates.longitude"
              value={spaceData.coordinates.longitude || ""}
              onChange={handleChange}
              placeholder="Longitude"
            />
          </div>
        )}
        {step === 4 && (
          <div>
            <h2 className="text-4xl my-4">Step 4: Features & Extras</h2>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="features.wifi"
                  checked={spaceData.features.wifi}
                  onChange={handleFeatureChange}
                />
                <span className="ml-2">WiFi</span>
              </label>
              <Input
                label="Restrooms"
                name="features.restrooms"
                type="number"
                value={spaceData.features.restrooms}
                onChange={handleFeatureChange}
              />
              <Input
                label="Size (SQM)"
                name="features.sizeSQM"
                type="number"
                value={spaceData.features.sizeSQM}
                onChange={handleFeatureChange}
              />
              <Input
                label="Seat Capacity"
                name="features.seatCapacity"
                type="number"
                value={spaceData.features.seatCapacity}
                onChange={handleFeatureChange}
              />
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
            <p className="text-gray-600">
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
