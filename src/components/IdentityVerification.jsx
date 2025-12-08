// client/src/components/IdentityVerification.jsx
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiFetch } from "../utils/api";

const stripePromise = loadStripe(
  "pk_test_51ST9SoJwnD1dhW6Y6zRqMUFNpArDlWof5HESYLISi8ARb06omu1OnChvpfQ6OYDOi7OX6goFEOgnxnIK6xaUZ5KI00ZT6AsPUn"
); // Your publishable key

const VerificationButton = () => {
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();

  const startVerification = async () => {
    setLoading(true);
    try {
      const { clientSecret } = await apiFetch({
        endpoint: "/verification/create-verification-session",
        method: "POST",
        credentials: "include",
      });

      const { error } = await stripe.verifyIdentity(clientSecret);
      if (error) {
        console.log(error);
      }
    } catch (err) {
      alert("Failed to start verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={startVerification}
      disabled={loading}
      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition disabled:opacity-50"
    >
      {loading ? "Starting..." : "Verify Identity with Stripe"}
    </button>
  );
};

const IdentityVerification = ({ user }) => {
  if (user.isVerified) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
        <p className="text-6xl mb-4">Checkmark</p>
        <p className="text-2xl font-bold text-green-800">Identity Verified</p>
        <p className="text-green-600">
          Verified on {new Date(user.verifiedAt).toLocaleDateString()}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center shadow-xl">
      <h3 className="text-2xl font-bold mb-4">Verify Your Identity</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Upload your government ID and take a selfie. This helps build trust with
        hosts.
      </p>
      <Elements stripe={stripePromise}>
        <VerificationButton />
      </Elements>
    </div>
  );
};

export default IdentityVerification;
