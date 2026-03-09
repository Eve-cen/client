import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import Button from "../components/Button";
import Footer from "../components/Footer";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "What is VenCome?",
          a: "VenCome is a marketplace that connects event organizers with unique venues in the UAE and beyond. From weddings and corporate events to private parties — find, book, and manage spaces easily.",
        },
        {
          q: "How do I create an account?",
          a: "Click 'Sign Up' in the top right corner. You can register with email/password or continue with Google/Apple/Facebook.",
        },
        {
          q: "Is it free to browse venues?",
          a: "Yes! Browsing, searching, and contacting hosts is completely free.",
        },
      ],
    },
    {
      category: "Booking & Payments",
      questions: [
        {
          q: "How do I book a venue?",
          a: "Select your preferred dates and capacity → click 'Request to Book' or 'Book Instantly' (if enabled by host) → complete payment via Stripe.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We currently accept credit/debit cards via Stripe. More methods (Apple Pay, Google Pay) coming soon.",
        },
        {
          q: "When is payment taken?",
          a: "For instant book: immediately. For request-to-book: after host approval.",
        },
        {
          q: "Can I cancel a booking?",
          a: "Yes — check the host's cancellation policy in the listing. Refunds depend on timing and policy.",
        },
      ],
    },
    {
      category: "For Venue Hosts",
      questions: [
        {
          q: "How do I list my venue?",
          a: "Go to 'List your Event Center' → follow the step-by-step wizard to add photos, pricing, features, and availability.",
        },
        {
          q: "What fees does VenCome charge hosts?",
          a: "VenCome charges a service fee of 10–20% (depending on plan) on each confirmed booking. You keep the rest.",
        },
        {
          q: "How do payouts work?",
          a: "Payments are held in escrow until 24 hours after the event ends, then automatically transferred to your connected payout method (bank transfer, PayPal, etc.).",
        },
        {
          q: "How do I verify my business?",
          a: "Go to Settings → Business Verification → submit company name, website, VAT, and registration number. Approved accounts get a verified badge.",
        },
      ],
    },
    {
      category: "Safety & Trust",
      questions: [
        {
          q: "How is my payment protected?",
          a: "All payments go through Stripe — funds are held until the booking is completed. We also offer dispute resolution.",
        },
        {
          q: "Are hosts and guests verified?",
          a: "We require identity verification for all users. Business hosts undergo additional verification (company docs + representative ID).",
        },
        {
          q: "What if something goes wrong during the event?",
          a: "Contact support immediately. We mediate disputes and may offer refunds or credits based on evidence.",
        },
      ],
    },
    {
      category: "Technical & Support",
      questions: [
        {
          q: "I forgot my password — what do I do?",
          a: "Click 'Forgot password' on the login page → enter your email → follow the reset link.",
        },
        {
          q: "How do I contact support?",
          a: "Use the chat bubble (bottom right) or email support@evecen.com. We're available 24/7.",
        },
        {
          q: "Is the platform mobile-friendly?",
          a: "Yes — the site is fully responsive and works great on phones and tablets.",
        },
      ],
    },
  ];

  const filteredFAQs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero / Search Section */}
      <div className="bg-primary text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-10">
            Find answers to common questions about booking, hosting, payments,
            and more.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-white opacity-70" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-12 pr-4 py-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
            />
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">
              No results found for "{searchQuery}".
            </p>
            <p className="text-gray-600 mt-2">
              Try different keywords or browse categories below.
            </p>
          </div>
        ) : (
          filteredFAQs.map((category, catIndex) => (
            <section key={catIndex} className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">
                {category.category}
              </h2>

              <div className="space-y-4">
                {category.questions.map((item, qIndex) => {
                  const isOpen = openIndex === `${catIndex}-${qIndex}`;
                  return (
                    <div
                      key={qIndex}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleAccordion(`${catIndex}-${qIndex}`)}
                        className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition"
                      >
                        <span className="text-lg font-medium text-gray-900 pr-8">
                          {item.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="h-6 w-6 text-primary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-gray-500 flex-shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-5 pt-1 text-gray-700 leading-relaxed border-t border-gray-100">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Still need help section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to help 24/7.
          </p>
          <Button>Contact Support</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
