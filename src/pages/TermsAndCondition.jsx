import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero / Header */}
      <div className="bg-primary text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms and Conditions
          </h1>
          <p className="text-xl md:text-2xl opacity-90">
            Last updated: March 09, 2026
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-primary">
        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
          Welcome to VenCome ("we", "us", "our"). These Terms and Conditions
          ("Terms") govern your access to and use of the VenCome website, mobile
          application, and services (collectively, the "Platform").
        </p>

        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
          By accessing or using the Platform, you agree to be bound by these
          Terms. If you do not agree, please do not use the Platform.
        </p>

        <hr className="my-10 border-gray-200" />

        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          1. Acceptance of Terms
        </h2>
        <p>
          These Terms form a legally binding agreement between you and VenCome.
          We may update these Terms from time to time. Continued use of the
          Platform after changes constitutes acceptance of the updated Terms.
        </p>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          2. Eligibility
        </h2>
        <p>
          You must be at least 18 years old to use the Platform. By using the
          Platform, you represent and warrant that you meet this requirement and
          have the legal capacity to enter into these Terms.
        </p>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          3. User Accounts
        </h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            You are responsible for maintaining the confidentiality of your
            account credentials.
          </li>
          <li>
            You agree to provide accurate, current, and complete information
            during registration.
          </li>
          <li>
            We reserve the right to suspend or terminate accounts for violations
            of these Terms.
          </li>
        </ul>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          4. Services
        </h2>
        <p>
          VenCome provides a platform for venue hosts ("Hosts") to list event
          spaces and for users ("Guests") to discover, book, and pay for those
          spaces.
        </p>
        <p className="mt-4">
          We act solely as an intermediary — we do not own, control, or operate
          any venues.
        </p>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          5. Booking Process
        </h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            All bookings are subject to Host approval (unless Instant Book is
            enabled).
          </li>
          <li>
            Payments are processed via Stripe. Funds are held until the event is
            completed.
          </li>
          <li>
            Hosts receive funds 24 hours after the event ends (escrow release).
          </li>
          <li>
            Cancellations and refunds follow the Host's cancellation policy.
          </li>
        </ul>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          6. User Conduct
        </h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>Use the Platform for any unlawful purpose</li>
          <li>Post false, misleading, or fraudulent listings</li>
          <li>Harass, threaten, or discriminate against other users</li>
          <li>Attempt to circumvent payments or fees</li>
          <li>
            Share personal contact information (phone, email, social media)
            before booking confirmation
          </li>
        </ul>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">7. Fees</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li>Guests pay a service fee (displayed at checkout).</li>
          <li>Hosts pay a service fee (deducted from payout).</li>
          <li>Fees are non-refundable except as required by law.</li>
        </ul>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          8. Intellectual Property
        </h2>
        <p>
          All content on the Platform (logos, text, images) is owned by VenCome
          or its licensors. You may not copy, modify, or distribute it without
          permission.
        </p>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          9. Limitation of Liability
        </h2>
        <p>VenCome is not responsible for:</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>The quality, safety, or legality of any venue</li>
          <li>Actions or omissions of Hosts or Guests</li>
          <li>Any loss, damage, or injury during an event</li>
        </ul>
        <p className="mt-4">
          Our total liability shall not exceed the amount you paid us in the
          last 12 months.
        </p>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          10. Dispute Resolution
        </h2>
        <p>
          Disputes shall be resolved through mediation. If unresolved, binding
          arbitration in Dubai, UAE, under DIFC-LCIA rules.
        </p>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          11. Governing Law
        </h2>
        <p>These Terms are governed by the laws of the United Arab Emirates.</p>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          12. Changes to Terms
        </h2>
        <p>
          We may update these Terms at any time. Continued use constitutes
          acceptance.
        </p>

        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
          13. Contact Us
        </h2>
        <p>For questions about these Terms, contact us at:</p>
        <p className="mt-4">
          Email:{" "}
          <a
            href="mailto:legal@vencome.com"
            className="text-primary hover:underline"
          >
            legal@vencome.com
          </a>
          <br />
          Address: VenCome, London, UK
        </p>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-100 border-t border-gray-200 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            Thank you for using VenCome. We’re committed to providing a safe and
            reliable platform for all users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
