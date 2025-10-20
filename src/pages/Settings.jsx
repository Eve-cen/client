import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import Sidebar from "../components/Sidebar";
import Input from "../components/Input";
import InputToggle from "../components/InputToggle";
import CardInput from "../components/CardInput";
import Button from "../components/Button";
import Modal from "../components/Modal";

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const { pathname } = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await apiFetch({
          endpoint: "/auth/me", // Assuming an endpoint to get current user
          method: "GET",
          cacheable: true,
        });
        setUser(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handlePersonalUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch({
        endpoint: "/settings/personal",
        method: "PUT",
        body: {
          name: user.name,
          preferredName: user.preferredName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
        },
      });
      setUser(data);
    } catch (err) {
      setError(err.message || "Update failed.");
    }
  };

  const handlePrivacyUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch({
        endpoint: "/settings/privacy",
        method: "PUT",
        body: {
          readReceipts: user.privacySettings.readReceipts,
          showListings: user.privacySettings.showListings,
          showReviewInfo: user.privacySettings.showReviewInfo,
        },
      });
      setUser(data);
    } catch (err) {
      setError(err.message || "Update failed.");
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch({
        endpoint: "/settings/payment",
        method: "POST",
        body: {
          type: "credit_card", // Default for now; can be a dropdown
          cardNumber: user.newCardNumber,
          expiryDate: user.newExpiryDate,
          cvv: user.newCvv,
        },
      });
      setUser({
        ...user,
        paymentMethods: data.paymentMethods,
        newCardNumber: "",
        newExpiryDate: "",
        newCvv: "",
      });
    } catch (err) {
      setError(err.message || "Payment addition failed.");
    }
  };

  const handleAddPayout = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiFetch({
        endpoint: "/settings/payout",
        method: "POST",
        body: {
          type: user.newPayoutType,
          details: user.newPayoutDetails,
        },
      });
      setUser({
        ...user,
        payoutMethods: data.payoutMethods,
        newPayoutType: "",
        newPayoutDetails: "",
      });
    } catch (err) {
      setError(err.message || "Payout addition failed.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setUser({
      ...user,
      privacySettings: { ...user.privacySettings, [name]: checked },
    });
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const showPopup = () => {
    setShowModal(true);
  };

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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        {pathname === "/settings/personal" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handlePersonalUpdate} className="space-y-4">
              <Input
                label="Legal Name"
                name="name"
                value={user.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Preferred First Name"
                name="preferredName"
                value={user.preferredName || ""}
                onChange={handleChange}
              />
              <Input
                label="Email Address"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Phone Number"
                name="phoneNumber"
                value={user.phoneNumber || ""}
                onChange={handleChange}
              />
              <Input
                label="Identity Verified"
                name="isVerified"
                value={user.isVerified ? "Yes" : "No"}
                disabled
              />
              <h4>Residential Address</h4>
              <Input
                placeholder="Country / region"
                name="country"
                value={user.country || ""}
                onChange={handleChange}
              />
              <Input
                placeholder="Street Address"
                name="address"
                value={user.address || ""}
                onChange={handleChange}
              />
              <Input
                placeholder="Apt, floor, bldg (if applicable)"
                name="floor"
                value={user.floor || ""}
                onChange={handleChange}
              />
              <Input
                placeholder="City / town / village"
                name="city"
                value={user.city || ""}
                onChange={handleChange}
              />
              <Input
                placeholder="Province / state / territory (if applicable)"
                name="state"
                value={user.state || ""}
                onChange={handleChange}
              />
              <Input
                placeholder="Postal code (if applicable)"
                name="postalCode"
                value={user.postalCode || ""}
                onChange={handleChange}
              />
              <Button type="submit" children="Save Changes" />
            </form>
          </div>
        )}
        {pathname === "/settings/privacy" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Privacy</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handlePrivacyUpdate} className="space-y-4">
              <InputToggle
                label="Read Receipts for Messages"
                name="readReceipts"
                checked={user.privacySettings.readReceipts}
                onChange={handleToggleChange}
              />
              <InputToggle
                label="Show Listings on Search"
                name="showListings"
                checked={user.privacySettings.showListings}
                onChange={handleToggleChange}
              />
              <InputToggle
                label="Show Review Information"
                name="showReviewInfo"
                checked={user.privacySettings.showReviewInfo}
                onChange={handleToggleChange}
              />
              <Button type="submit" children="Save Changes" />
            </form>
          </div>
        )}
        {pathname === "/settings/payments" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Payments</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <h3 className="text-lg font-semibold mb-4">Your payment</h3>
            <p>Keep track of all your payments and refunds</p>
            <Button children="Manage payment" />

            <hr className="my-8" />

            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <p>
              Add a payment method using our secure payment system, then start
              planning your next trip
            </p>

            {!user.paymentMethods.length > 0 ? (
              <>
                {/* Add Payment Button */}
                <Button children="Add payment method" onClick={showPopup} />

                {/* Modal */}
                {showModal && (
                  <Modal onClose={() => setShowModal(false)} isOpen={true}>
                    <h3 className="text-3xl text-center mb-6">
                      Add card details
                    </h3>
                    <form onSubmit={handleAddPayment} className="space-y-4">
                      <CardInput
                        label="Card Number"
                        name="newCardNumber"
                        value={user.newCardNumber}
                        onChange={handleCardChange}
                        placeholder="**** **** **** 1234"
                      />
                      <CardInput
                        label="Expiry Date"
                        name="newExpiryDate"
                        value={user.newExpiryDate}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                      />
                      <CardInput
                        label="CVV"
                        name="newCvv"
                        value={user.newCvv}
                        onChange={handleCardChange}
                        placeholder="***"
                      />
                      <Button
                        type="submit"
                        children="Add Card"
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      />
                    </form>
                  </Modal>
                )}

                {/* Existing payment methods */}
                <ul className="space-y-2 mt-4">
                  {user.paymentMethods.map((method, index) => (
                    <li key={index} className="p-2 bg-gray-100 rounded-lg">
                      {method.type}: **** **** ****{" "}
                      {method.cardNumber.slice(-4)}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Button children="Add payment method" onClick={showPopup} />
            )}
          </div>
        )}

        {pathname === "/settings/payout" && (
          <div>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <h3 className="text-lg font-semibold mb-4">How you'll get paid</h3>
            <p>
              Add at least one payout method so we know where to send your
              money.
            </p>

            {!user.payoutMethods.length > 0 ? (
              <>
                {/* Add Payment Button */}
                <Button children="Manage payouts" onClick={showPopup} />

                {/* Modal */}
                {showModal && (
                  <Modal onClose={() => setShowModal(false)} isOpen={true}>
                    <h3 className="text-3xl text-center mb-6">
                      Add card details
                    </h3>
                    <form onSubmit={handleAddPayment} className="space-y-4">
                      <CardInput
                        label="Card Number"
                        name="newCardNumber"
                        value={user.newCardNumber}
                        onChange={handleCardChange}
                        placeholder="**** **** **** 1234"
                      />
                      <CardInput
                        label="Expiry Date"
                        name="newExpiryDate"
                        value={user.newExpiryDate}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                      />
                      <CardInput
                        label="CVV"
                        name="newCvv"
                        value={user.newCvv}
                        onChange={handleCardChange}
                        placeholder="***"
                      />
                      <Button
                        type="submit"
                        children="Add Card"
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      />
                    </form>
                  </Modal>
                )}

                {/* Existing payment methods */}
                <ul className="space-y-2 mt-4">
                  {user.payoutMethods.map((method, index) => (
                    <li key={index} className="p-2 bg-gray-100 rounded-lg">
                      {method.type}: **** **** ****{" "}
                      {method.cardNumber.slice(-4)}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Button children="Add payment method" onClick={showPopup} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
