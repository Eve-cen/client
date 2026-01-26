import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import Sidebar from "../components/Sidebar";
import Input from "../components/Input";
import InputToggle from "../components/InputToggle";
import CardInput from "../components/CardInput";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { Menu, X } from "lucide-react";
import vencomeLoader from "../components/Loader";

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const { pathname } = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await apiFetch({
          endpoint: "/auth/me",
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
          type: "credit_card",
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
      setShowModal(false);
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
      setShowModal(false);
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

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [sidebarOpen]);

  if (loading) return <vencomeLoader />;

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || "User not found."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Button - Fixed at top */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-18 right-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* MOBILE OVERLAY (shows only when sidebarOpen = true) */}
      {sidebarOpen && (
        <div
          className="
      fixed inset-0 bg-black/40 backdrop-blur-sm
      z-30 lg:hidden
      transition-opacity duration-300
    "
          onClick={() => setSidebarOpen(false)} // Clicking overlay closes sidebar
        ></div>
      )}

      {/* SIDEBAR CONTAINER */}
      <div
        className={`
    fixed lg:static inset-y-0 left-0 z-40
    w-64 bg-white shadow-lg lg:shadow-none
    transform transition-transform duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
      >
        <Sidebar onLinkClick={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 sm:p-6 lg:p-8 w-full">
        {/* Add top padding on mobile to account for the menu button */}
        <div className="max-w-3xl md:max-w-full mx-auto md:mx-0 pt-4 lg:pt-0">
          {pathname === "/settings/personal" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                Personal Information
              </h2>
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
                <h4 className="font-semibold mt-6 mb-2">Residential Address</h4>
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
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                Privacy
              </h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <form onSubmit={handlePrivacyUpdate} className="space-y-4">
                <InputToggle
                  label="Read Receipts for Messages"
                  name="readReceipts"
                  // checked={user.privacySettings.readReceipts}
                  onChange={handleToggleChange}
                />
                <InputToggle
                  label="Show Listings on Search"
                  name="showListings"
                  // checked={user.privacySettings.showListings}
                  onChange={handleToggleChange}
                />
                <InputToggle
                  label="Show Review Information"
                  name="showReviewInfo"
                  // checked={user.privacySettings.showReviewInfo}
                  onChange={handleToggleChange}
                />
                <Button type="submit" children="Save Changes" />
              </form>
            </div>
          )}

          {pathname === "/settings/payments" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                Payments
              </h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}

              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
                Your payment
              </h3>
              <p className="mb-4 text-sm sm:text-base">
                Keep track of all your payments and refunds
              </p>
              <Button children="Manage payment" />

              <hr className="my-6 sm:my-8" />

              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
                Payment Method
              </h3>
              <p className="mb-4 text-sm sm:text-base">
                Add a payment method using our secure payment system, then start
                planning your next trip
              </p>

              {!user.paymentMethods.length > 0 ? (
                <>
                  <Button children="Add payment method" onClick={showPopup} />

                  {showModal && (
                    <Modal onClose={() => setShowModal(false)} isOpen={true}>
                      <h3 className="text-2xl sm:text-3xl text-center mb-4 sm:mb-6">
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
                          className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80"
                        />
                      </form>
                    </Modal>
                  )}

                  <ul className="space-y-2 mt-4">
                    {user.paymentMethods.map((method, index) => (
                      <li
                        key={index}
                        className="p-2 sm:p-3 bg-gray-100 rounded-lg text-sm sm:text-base"
                      >
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
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                Payouts
              </h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}

              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
                How you'll get paid
              </h3>
              <p className="mb-4 text-sm sm:text-base">
                Add at least one payout method so we know where to send your
                money.
              </p>

              {!user.payoutMethods.length > 0 ? (
                <>
                  <Button children="Manage payouts" onClick={showPopup} />

                  {showModal && (
                    <Modal onClose={() => setShowModal(false)} isOpen={true}>
                      <h3 className="text-2xl sm:text-3xl text-center mb-4 sm:mb-6">
                        Add payout details
                      </h3>
                      <form onSubmit={handleAddPayout} className="space-y-4">
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
                          className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80"
                        />
                      </form>
                    </Modal>
                  )}

                  <ul className="space-y-2 mt-4">
                    {user.payoutMethods.map((method, index) => (
                      <li
                        key={index}
                        className="p-2 sm:p-3 bg-gray-100 rounded-lg text-sm sm:text-base"
                      >
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
    </div>
  );
};

export default Settings;
