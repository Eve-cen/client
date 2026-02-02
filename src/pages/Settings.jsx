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
import VencomeLoader from "../components/Loader";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  IbanElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Settings = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [payoutType, setPayoutType] = useState("card"); // or 'bank_account'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const { pathname } = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setPageLoading(true);
        const data = await apiFetch({
          endpoint: "/auth/me",
          method: "GET",
          cacheable: true,
        });
        // setUser(data);
        setError("");
        setPageLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load user data.");
        setPageLoading(false);
      } finally {
        setPageLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const response = await apiFetch({
          endpoint: "/payments",
          method: "GET",
        });

        if (response.success) {
          setUser((prev) => ({
            ...prev,
            payments: response.payments,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch payment history:", err);
      }
    };

    if (pathname === "/settings/payments") {
      fetchPaymentHistory();
    }
  }, [pathname]);

  useEffect(() => {
    const fetchPayoutHistory = async () => {
      try {
        const response = await apiFetch({
          endpoint: "/payouts/payout-history",
          method: "GET",
        });

        if (response.success) {
          setUser((prev) => ({
            ...prev,
            payouts: response.payouts,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch payout history:", err);
      }
    };

    if (pathname === "/settings/payout") {
      fetchPayoutHistory();
    }
  }, [pathname]);

  // Minimum date for 18 years old
  const today = new Date();
  const minYear = today.getFullYear() - 18;
  const maxDate = `${minYear}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;

  const handleDobChange = (e) => {
    const selected = e.target.value; // YYYY-MM-DD
    const [year, month, day] = selected.split("-").map(Number);

    // Check age
    const birthDate = new Date(year, month - 1, day);
    const ageDifMs = today - birthDate;
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) {
      alert("You must be at least 18 years old.");
      return;
    }

    // Update user state in the { dob: { day, month, year } } format
    handleChange({
      target: {
        name: "dob",
        value: { day, month, year },
      },
    });
  };

  const handlePersonalUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch({
        endpoint: "/settings/personal",
        method: "PUT",
        body: {
          lastName: user.lastName,
          firstName: user.firstName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: {
            floor: user.address?.floor || "",
            streetAddress: user.address?.streetAddress || "",
            city: user.address?.city || "",
            state: user.address?.state || "",
            postalCode: user.address?.postalCode || "",
            country: user.address?.country || "",
          },
          dob: {
            day: user.dob?.day || "",
            month: user.dob?.month || "",
            year: user.dob?.year || "",
          },
        },
      });

      setUser(data);
      toast.success("Saved successfully");
      setLoading(false);
    } catch (err) {
      setError(err.message || "Update failed.");
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
      setLoading(false);
    } catch (err) {
      setError(err.message || "Update failed.");
      setLoading(false);
    }
  };

  const handleAddPayment = async (token) => {
    try {
      const response = await apiFetch({
        endpoint: "/payments",
        method: "POST",
        body: {
          tokenId: token.id,
          last4: token.card.last4,
          brand: token.card.brand,
        },
      });

      if (response.ok) {
        toast.success("Payout added");
        setUser({
          ...user,
          paymentMethods: response.paymentMethods,
        });

        setShowModal(false);
        setError(null);
      }
    } catch (err) {
      setError(err.message || "Failed to add payment method");
    }
  };

  function StripePaymentForm({ onSuccess, onError, user, setUser }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const CARD_ELEMENT_OPTIONS = {
      style: {
        base: {
          color: "#32325d",
          fontFamily: "inherit",
          fontSize: "16px",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#fa755a",
          iconColor: "#fa755a",
        },
      },
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setProcessing(true);

      const cardNumberElement = elements.getElement(CardNumberElement);

      const { token, error } = await stripe.createToken(cardNumberElement, {
        name: `${user?.firstName} ${user?.lastName}`,
      });

      if (error) {
        onError(error.message);
        setProcessing(false);
      } else {
        onSuccess(token);
        setProcessing(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Card Number</label>
          <div className="p-3 border border-gray-300 rounded-lg bg-white">
            <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Expiry Date
            </label>
            <div className="p-3 border border-gray-300 rounded-lg bg-white">
              <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">CVV</label>
            <div className="p-3 border border-gray-300 rounded-lg bg-white">
              <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!stripe || processing}
          children={processing ? "Processing..." : "Add Card"}
          className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 disabled:opacity-50"
        />
      </form>
    );
  }

  const handleAddPayout = async (token) => {
    console.log("running");
    const payload =
      payoutType === "card"
        ? {
            type: "card",
            tokenId: token.id,
            last4: token.card.last4,
            brand: token.card.brand,
          }
        : {
            type: "bank_account",
            bankAccount: {
              bankName: "Chase Bank",
              accountNumber: "1234567890",
              routingNumber: "110000000",
              country: "US",
              currency: "USD",
            },
          };

    // : {
    //     type: "bank_account",
    //     bankAccount: {
    //       accountNumber: user?.bankAccount?.accountNumber,
    //       routingNumber: user?.bankAccount?.routingNumber,
    //       bankName: user?.bankAccount?.bankName,
    //       country: user?.bankAccount?.country,
    //       currency: user?.bankAccount?.currency,
    //     },
    //   };

    try {
      // Send token.id to your backend
      const response = await apiFetch({
        endpoint: "/payouts",
        method: "POST",
        body: payload,
      });

      if (response.ok) {
        toast.success("Payout added");
        setUser({
          ...user,
          payoutMethods: [
            ...user.payoutMethods,
            {
              type: token.card.brand,
              cardNumber: `************${token.card.last4}`,
            },
          ],
        });

        setShowModal(false);
        setError(null);
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  const countryToCurrency = {
    US: "USD",
    GB: "GBP",
    EU: "EUR",
  };

  useEffect(() => {
    if (user?.bankAccount?.country) {
      setUser((prev) => ({
        ...prev,
        bankAccount: {
          ...prev.bankAccount,
          currency: countryToCurrency[user.bankAccount.country] || "",
        },
      }));
    }
  }, [user?.bankAccount?.country]);

  function StripePayoutForm({ onSuccess, onError, user, setUser }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const CARD_ELEMENT_OPTIONS = {
      style: {
        base: {
          color: "#32325d",
          fontFamily: "inherit",
          fontSize: "16px",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#fa755a",
          iconColor: "#fa755a",
        },
      },
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (payoutType === "card") {
        if (!stripe || !elements) {
          return;
        }

        setProcessing(true);

        const cardNumberElement = elements.getElement(CardNumberElement);

        const { token, error } = await stripe.createToken(cardNumberElement, {
          name: `${user?.firstName} ${user?.lastName}`,
        });

        if (error) {
          onError(error.message);
          setProcessing(false);
        } else {
          onSuccess(token);
          setProcessing(false);
        }
      } else {
        onSuccess();
        setProcessing(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-4">
          <button
            type="button"
            className={`px-3 py-2 rounded-lg cursor-pointer ${
              payoutType === "card" ? "bg-primary text-white" : "bg-gray-200"
            }`}
            onClick={() => setPayoutType("card")}
          >
            Card
          </button>
          <button
            type="button"
            className={`px-3 py-2 rounded-lg cursor-pointer ${
              payoutType === "bank_account"
                ? "bg-primary text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setPayoutType("bank_account")}
          >
            Bank
          </button>
        </div>
        {payoutType === "card" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Card Number
              </label>
              <div className="p-3 border border-gray-300 rounded-lg bg-white">
                <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Expiry Date
                </label>
                <div className="p-3 border border-gray-300 rounded-lg bg-white">
                  <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CVV</label>
                <div className="p-3 border border-gray-300 rounded-lg bg-white">
                  <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                </div>
              </div>
            </div>
          </>
        )}

        {payoutType === "bank_account" && (
          <>
            {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              IBAN
            </label>
            <div className="p-4 border rounded-lg">
              <IbanElement
                options={{
                  supportedCountries: ["SEPA"],
                  style: { base: { fontSize: "16px" } },
                }}
              />
            </div> */}
            <Input
              label="Account Number"
              placeholder="Account Number"
              name="accountNumber"
              value={user?.bankAccount?.accountNumber || ""}
              onChange={handleBankDetailsChange}
            />
            <Input
              label="Routing Number"
              placeholder="Routing Number"
              name="routingNumber"
              value={user?.bankAccount?.routingNumber || ""}
              onChange={handleBankDetailsChange}
            />
            <Input
              label="Bank Name"
              placeholder="Bank Name"
              name="bankName"
              value={user?.bankAccount?.bankName || ""}
              onChange={handleBankDetailsChange}
            />
            <Input
              label="Country / region"
              placeholder="Country / region"
              name="bankCountry"
              value={user?.bankAccount?.country || ""}
              onChange={handleBankDetailsChange}
            />
            <label className="block text-sm font-medium mb-1">Currency</label>

            <select
              name="currency"
              value={user?.bankAccount?.currency || ""}
              disabled
              className="mt-1 block w-full p-2 border rounded-lg bg-gray-100"
            >
              <option value={user?.bankAccount?.currency}>
                {user?.bankAccount?.currency}
              </option>
            </select>
          </>
        )}

        <Button
          type="submit"
          children={
            processing
              ? "Processing..."
              : payoutType === "bank_account"
              ? "Add Bank"
              : "Add Card"
          }
          className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80"
        />
      </form>
    );
  }

  // function StripePayoutForm({ onSuccess, onError }) {
  //   const stripe = useStripe();
  //   const elements = useElements();
  //   const [payoutType, setPayoutType] = useState("card"); // or 'bank_account'
  //   const [loading, setLoading] = useState(false);

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     setLoading(true);
  //     onError(""); // clear previous errors

  //     if (!stripe || !elements) return;

  //     try {
  //       let tokenResult;
  //       if (payoutType === "card") {
  //         const card = elements.getElement(CardElement);
  //         tokenResult = await stripe.createToken(card);
  //       } else if (payoutType === "bank_account") {
  //         const iban = elements.getElement(IbanElement);
  //         tokenResult = await stripe.createToken(iban, {
  //           account_holder_name: `${user.firstName} ${user.lastName}`,
  //           account_holder_type: user.businessType || "individual",
  //         });
  //       }

  //       if (tokenResult.error) {
  //         onError(tokenResult.error.message);
  //         setLoading(false);
  //         return;
  //       }

  //       // Send token.id to your backend
  //       await onSuccess({
  //         tokenId: tokenResult.token.id,
  //         type: payoutType,
  //         last4:
  //           payoutType === "card"
  //             ? tokenResult.token.card.last4
  //             : tokenResult.token.bank_account.last4,
  //         brand:
  //           payoutType === "card"
  //             ? tokenResult.token.card.brand
  //             : tokenResult.token.bank_account.bank_name,
  //       });

  //       setLoading(false);
  //     } catch (err) {
  //       onError(err.message || "Payout creation failed");
  //       setLoading(false);
  //     }
  //   };

  //   return (
  //     <form onSubmit={handleSubmit} className="space-y-4">
  //       <div className="flex space-x-4">
  //         <button
  //           type="button"
  //           className={`px-3 py-2 rounded-lg ${
  //             payoutType === "card" ? "bg-primary text-white" : "bg-gray-200"
  //           }`}
  //           onClick={() => setPayoutType("card")}
  //         >
  //           Card
  //         </button>
  //         <button
  //           type="button"
  //           className={`px-3 py-2 rounded-lg ${
  //             payoutType === "bank_account"
  //               ? "bg-primary text-white"
  //               : "bg-gray-200"
  //           }`}
  //           onClick={() => setPayoutType("bank_account")}
  //         >
  //           Bank
  //         </button>
  //       </div>

  //       {payoutType === "card" && (
  //         <div className="p-4 border rounded-lg">
  //           <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
  //         </div>
  //       )}

  //       {payoutType === "bank_account" && (
  //         <div className="p-4 border rounded-lg">
  //           <IbanElement
  //             options={{
  //               supportedCountries: ["SEPA"],
  //               style: { base: { fontSize: "16px" } },
  //             }}
  //           />
  //         </div>
  //       )}

  //       <button
  //         type="submit"
  //         disabled={loading}
  //         className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/80"
  //       >
  //         {loading ? "Processing..." : "Add Payout"}
  //       </button>
  //     </form>
  //   );
  // }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [name]: value,
      },
    }));
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setUser({
      ...user,
      privacySettings: { ...user.privacySettings, [name]: checked },
    });
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

  if (pageLoading) return <VencomeLoader />;

  if (error || !user) {
    toast.error(error || "User not found.");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
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

      <div
        className={`
    fixed lg:static inset-y-0 left-0 z-40
    w-64 bg-white shadow-lg lg:shadow-none
    transform transition-transform duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
      >
        <Sidebar user={user} onLinkClick={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 p-8 sm:p-6 lg:p-8 w-full">
        <div className="max-w-3xl md:max-w-full mx-auto md:mx-0 pt-4 lg:pt-0">
          {pathname === "/settings/personal" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                Personal Information
              </h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <form onSubmit={handlePersonalUpdate} className="space-y-4">
                <Input
                  label="Last Name"
                  name="lastName"
                  value={user.lastName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="First Name"
                  name="firstName"
                  value={user.firstName || ""}
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
                <div>
                  <label className="block mb-1 font-medium">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={
                      user?.dob
                        ? `${user.dob.year}-${String(user.dob.month).padStart(
                            2,
                            "0"
                          )}-${String(user.dob.day).padStart(2, "0")}`
                        : ""
                    }
                    onChange={handleDobChange}
                    max={maxDate} // ensures user is at least 18
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <h4 className="font-semibold mt-6 mb-2">Residential Address</h4>
                <Input
                  placeholder="Country / region"
                  name="country"
                  value={user.address?.country || ""}
                  onChange={handleAddressChange}
                />
                <Input
                  placeholder="Street Address"
                  name="streetAddress"
                  value={user.address?.streetAddress || ""}
                  onChange={handleAddressChange}
                />
                <Input
                  placeholder="Apt, floor, bldg (if applicable)"
                  name="floor"
                  value={user.address?.floor || ""}
                  onChange={handleAddressChange}
                />
                <Input
                  placeholder="City / town / village"
                  name="city"
                  value={user.address?.city || ""}
                  onChange={handleAddressChange}
                />
                <Input
                  placeholder="Province / state / territory (if applicable)"
                  name="state"
                  value={user.address?.state || ""}
                  onChange={handleAddressChange}
                />
                <Input
                  placeholder="Postal code (if applicable)"
                  name="postalCode"
                  value={user.address?.postalCode || ""}
                  onChange={handleAddressChange}
                />
                <Button
                  type="submit"
                  children={
                    loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )
                  }
                />
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

              {user?.paymentMethods?.length > 0 ? (
                <>
                  <Button children="Manage payment" onClick={showPopup} />

                  {showModal && (
                    <Modal onClose={() => setShowModal(false)} isOpen={true}>
                      <h3 className="text-2xl sm:text-3xl text-center mb-4 sm:mb-6">
                        Add payment details
                      </h3>
                      <Elements stripe={stripePromise}>
                        <StripePaymentForm
                          user={user}
                          setUser={setUser}
                          onSuccess={handleAddPayment}
                          onError={(errorMsg) => setError(errorMsg)}
                        />
                      </Elements>
                    </Modal>
                  )}

                  <ul className="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-2">
                    {user?.paymentMethods?.map((method, index) => {
                      const brandIcons = {
                        visa: "/visa.png",
                        mastercard: "/mastercard.png",
                        verve: "/verve.png",
                        paypal: "/paypal.png",
                      };

                      // Disable delete if default or only one method left
                      const canDelete =
                        !method.isDefault && user.paymentMethods.length > 1;

                      const handleDelete = async () => {
                        if (!canDelete) return;
                        try {
                          await apiFetch({
                            endpoint: `/payments/${method._id}`,
                            method: "DELETE",
                          });

                          // Remove from local state
                          setUser((prev) => ({
                            ...prev,
                            paymentMethods: prev.paymentMethods.filter(
                              (m) => m._id !== method._id
                            ),
                          }));
                        } catch (err) {
                          console.error(err);
                          alert(
                            err.message || "Failed to delete payout method."
                          );
                        }
                      };

                      return (
                        <li
                          key={index}
                          className="relative flex items-center justify-between p-4 bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200"
                        >
                          {/* Left: Icon + Type */}
                          <div className="flex items-center space-x-3">
                            {method.brand &&
                              brandIcons[method.brand.toLowerCase()] && (
                                <img
                                  src={brandIcons[method.brand.toLowerCase()]}
                                  alt={method.brand}
                                  className="h-8 w-auto"
                                />
                              )}
                            <div>
                              <p className="text-gray-700 font-medium capitalize">
                                {method.type}
                              </p>
                              <p className="text-gray-500 text-sm tracking-widest">
                                **** **** **** {method.last4}
                              </p>
                            </div>
                          </div>

                          {/* Right: Default badge or delete button */}
                          <div className="flex items-center space-x-2">
                            {method.isDefault && (
                              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full cursor-pointer">
                                Default
                              </span>
                            )}
                            {canDelete && (
                              <button
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200 text-sm font-semibold cursor-pointer"
                                title="Delete payout method"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <>
                  <p className="mb-4 text-sm sm:text-base">
                    Add a payment method using our secure payment system, then
                    start planning your next trip
                  </p>
                  <Button children="Add payment method" onClick={showPopup} />
                </>
              )}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Payment History
                </h2>

                {user?.payments && user.payments.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Booking
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Method
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th scope="col" className="relative px-4 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {user.payments.map((payment) => (
                          <tr
                            key={payment._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {payment.booking?.property?.title ||
                                payment.booking?._id ||
                                "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              ${payment.amount?.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <div className="flex items-center space-x-2">
                                {payment.paymentMethodBrand && (
                                  <img
                                    src={`/${payment.paymentMethodBrand.toLowerCase()}.png`}
                                    alt={payment.paymentMethodBrand}
                                    className="h-5 w-auto"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                )}
                                <span className="capitalize">
                                  {payment.paymentMethod || "Card"} ****
                                  {payment.last4 || "****"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  payment.status === "succeeded" ||
                                  payment.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : payment.status === "pending" ||
                                      payment.status === "processing"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : payment.status === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : payment.status === "refunded"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {payment.status?.charAt(0).toUpperCase() +
                                  payment.status?.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium">
                              {payment.status === "succeeded" && (
                                <button
                                  onClick={() => handleViewReceipt(payment._id)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Receipt
                                </button>
                              )}
                              {payment.status === "failed" && (
                                <button
                                  onClick={() =>
                                    handleRetryPayment(payment._id)
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Retry
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <p className="mt-4 text-gray-600">No payment history yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Your payments will appear here once you make a booking
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {pathname === "/settings/payout" && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                Payouts
              </h2>

              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
                How you'll get paid
              </h3>
              {user?.payoutMethods?.length > 0 ? (
                <>
                  <Button children="Manage payouts" onClick={showPopup} />

                  {showModal && (
                    <Modal onClose={() => setShowModal(false)} isOpen={true}>
                      <h3 className="text-2xl sm:text-3xl text-center mb-4 sm:mb-6">
                        Add payout details
                      </h3>
                      <Elements stripe={stripePromise}>
                        <StripePayoutForm
                          user={user}
                          setUser={setUser}
                          onSuccess={handleAddPayout}
                          onError={(err) => setError(err)}
                        />
                      </Elements>
                    </Modal>
                  )}

                  <ul className="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-2">
                    {user?.payoutMethods?.map((method, index) => {
                      const brandIcons = {
                        visa: "/visa.png",
                        mastercard: "/mastercard.png",
                        verve: "/verve.png",
                        paypal: "/paypal.png",
                      };

                      // Disable delete if default or only one method left
                      const canDelete =
                        !method.isDefault && user.payoutMethods.length > 1;

                      const handleDelete = async () => {
                        if (!canDelete) return;
                        try {
                          await apiFetch({
                            endpoint: `/payouts/payout-method/${method._id}`,
                            method: "DELETE",
                          });

                          // Remove from local state
                          setUser((prev) => ({
                            ...prev,
                            payoutMethods: prev.payoutMethods.filter(
                              (m) => m._id !== method._id
                            ),
                          }));
                        } catch (err) {
                          console.error(err);
                          setError(
                            err.message || "Failed to delete payout method."
                          );
                        }
                      };

                      const handleSetDefault = async () => {
                        if (method.isDefault) return;
                        try {
                          await apiFetch({
                            endpoint: `/payouts/${method._id}/default`,
                            method: "PATCH",
                          });

                          // Update local state
                          setUser((prev) => ({
                            ...prev,
                            payoutMethods: prev.payoutMethods.map((m) =>
                              m._id === method._id
                                ? { ...m, isDefault: true }
                                : { ...m, isDefault: false }
                            ),
                          }));
                        } catch (err) {
                          console.error(err);
                          setError(
                            err.message ||
                              "Failed to set default payout method."
                          );
                        }
                      };

                      return (
                        <li
                          key={method._id || index}
                          className="relative flex items-center justify-between p-4 bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200"
                        >
                          {/* Left: Icon + Type */}
                          <div className="flex items-center space-x-3">
                            {method.brand &&
                              brandIcons[method.brand.toLowerCase()] && (
                                <img
                                  src={brandIcons[method.brand.toLowerCase()]}
                                  alt={method.brand}
                                  className="h-8 w-auto"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              )}
                            <div>
                              <p className="text-gray-700 font-medium capitalize">
                                {method.brand || method.type}
                              </p>
                              <p className="text-gray-500 text-sm tracking-widest">
                                **** **** **** {method.last4}
                              </p>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center space-x-2">
                            {method.isDefault ? (
                              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                Default
                              </span>
                            ) : (
                              <button
                                onClick={handleSetDefault}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm font-semibold cursor-pointer"
                                title="Set as default"
                              >
                                Set Default
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200 text-sm font-semibold cursor-pointer"
                                title="Delete payout method"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <>
                  <p className="mb-4 text-sm sm:text-base">
                    Add at least one payout method so we know where to send your
                    money.
                  </p>
                  <Button children="Add payout method" onClick={showPopup} />

                  {showModal && (
                    <Modal onClose={() => setShowModal(false)} isOpen={true}>
                      <h3 className="text-2xl sm:text-3xl text-center mb-4 sm:mb-6">
                        Add payout details
                      </h3>
                      <Elements stripe={stripePromise}>
                        <StripePayoutForm
                          user={user}
                          setUser={setUser}
                          onSuccess={handleAddPayout}
                          onError={(err) => setError(err)}
                        />
                      </Elements>
                    </Modal>
                  )}
                </>
              )}

              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Payout History
                </h2>
                {user?.payouts && user.payouts.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Booking
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Platform Fee
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Method
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Arrival
                          </th>
                          <th scope="col" className="relative px-4 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {user.payouts.map((payout) => (
                          <tr
                            key={payout._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {new Date(
                                payout?.releasedAt || payout?.createdAt
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {payout.booking?.property?.title ||
                                payout.booking?._id ||
                                "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              ${payout.amount?.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              -${payout.platformFee?.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <div className="flex items-center space-x-2">
                                {payout.destinationBrand && (
                                  <img
                                    src={`/${payout.destinationBrand.toLowerCase()}.png`}
                                    alt={payout.destinationBrand}
                                    className="h-5 w-auto"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                )}
                                <span className="capitalize">
                                  {payout.payoutMethod || "Card"} ****
                                  {payout.destination?.slice(-4) || "****"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  payout.status === "paid"
                                    ? "bg-green-100 text-green-700"
                                    : payout.status === "pending" ||
                                      payout.status === "in_transit"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : payout.status === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {payout.status?.charAt(0).toUpperCase() +
                                  payout.status?.slice(1).replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {payout.arrivedAt
                                ? new Date(
                                    payout.arrivedAt
                                  ).toLocaleDateString()
                                : payout.expectedArrival
                                ? new Date(
                                    payout.expectedArrival
                                  ).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium">
                              {payout.status === "failed" && (
                                <button
                                  onClick={() => handleRetryPayout(payout._id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Retry
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="mt-4 text-gray-600">No payout history yet</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Your payouts will appear here once guests complete their
                      bookings
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
