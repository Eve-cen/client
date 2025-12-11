import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ onLinkClick }) => {
  const { pathname } = useLocation();

  const sections = [
    { name: "Personal Information", path: "/settings/personal" },
    { name: "Privacy", path: "/settings/privacy" },
    { name: "Payments", path: "/settings/payments" },
    { name: "Payout", path: "/settings/payout" },
  ];

  return (
    <div className="w-64 h-screen border-r fixed top-16 left-0 p-4 sm:block">
      {sections.map((section) => (
        <Link
          key={section.path}
          to={section.path}
          onClick={onLinkClick}
          className={`block py-2 px-4 rounded-lg mb-2 ${
            pathname === section.path
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {section.name}
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
