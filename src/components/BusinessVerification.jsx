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
  const [status, setStatus] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await apiFetch({
          endpoint: "/verification/business",
          method: "GET",
          credentials: "include",
        });
        setStatus(data.status);
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

  const handleFileChange = (e) => {
    setIdFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("companyName", formData.companyName);
      payload.append("websiteURL", formData.websiteURL);
      payload.append("vat", formData.vat);

      if (idFile) {
        payload.append("idDocument", idFile);
      }

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/verification/business`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Submission failed");

      if (data.success) {
        setStatus("under_review");
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (status === "verified") {
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

  if (status === "under_review") {
    return (
      <div className="p-6 bg-yellow-100 rounded-lg text-center">
        <h3 className="text-xl font-bold text-yellow-800 mb-2">
          Verification Under Review
        </h3>
        <p className="text-yellow-700">
          Your business verification is currently under review. This usually
          takes 24–48 hours.
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
        <div>
          <label className="block text-sm font-medium mb-1">
            Upload ID Document
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            required
            className="w-full border rounded-md p-2"
          />
        </div>
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
