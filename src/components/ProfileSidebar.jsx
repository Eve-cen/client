import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { pathname } = useLocation();

  const sections = [
    { name: "About", path: "/profile/about" },
    { name: "Past Trips", path: "/profile/past-trips" },
    { name: "Reviews", path: "/profile/reviews" },
  ];
  return (
    <div className="w-64 h-screen border-r fixed top-16 left-0 p-4 hidden sm:flex flex-col justify-between pb-[100px]">
      <div>
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
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
      <Link
        to="/settings/personal"
        className={`block py-2 px-4 rounded-lg mb-2 text-gray-600 hover:bg-gray-100
        }`}
      >
        Settings
      </Link>
    </div>
  );
};

export default Sidebar;
