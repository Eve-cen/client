import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import Input from "./Input";
import Button from "./Button";

const BusinessVerification = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    websiteURL: "",
    vat: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await apiFetch({
          endpoint: "/verification/business",
          method: "GET",
          credentials: "include",
        });
        setIsVerified(data.businessVerified);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch({
        endpoint: "/verification/business",
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (response.success) {
        setIsVerified(true);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="p-6 bg-green-100 rounded-lg text-center">
        <h3 className="text-xl font-bold text-green-800 mb-2">
          Business Verified
        </h3>
        <p className="text-green-600">
          Your business has been successfully verified.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center">
        Business Verification
      </h3>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          required
        />
        <Input
          label="Website URL"
          name="websiteURL"
          value={formData.websiteURL}
          onChange={handleChange}
          required
        />
        <Input
          label="VAT Number"
          name="vat"
          value={formData.vat}
          onChange={handleChange}
          required
        />
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-600 text-white hover:bg-pink-700"
        >
          {loading ? "Submitting..." : "Verify Business"}
        </Button>
      </form>
    </div>
  );
};

export default BusinessVerification;
