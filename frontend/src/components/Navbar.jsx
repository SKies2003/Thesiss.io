// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({ openAuth }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full bg-[#ffffffd8] backdrop-blur-md border-b border-gray-200 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-6">

        {/* Logo */}
        <Link to={user ? "/" : "/"}>
        <img
        src="src/assets/Screenshot 2025-10-01 123117-Photoroom 1.png"
        alt="Thesis.io logo"
        className="
          w-auto 
          h-45              /* bigger height = bigger logo */
          object-contain
          transition-transform 
          duration-300 
          hover:scale-105   /* gentle zoom */
        "
        style={{ transform: "scale(1.05)" }}  // default slight zoom
      />

        </Link>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => {
            if (!user) {
              openAuth();   // open login/signup modal directly
              return;
            }
            setOpen(!open); // only open dropdown when logged in
          }}
          className="h-10 w-10 rounded-full bg-black flex items-center justify-center cursor-pointer hover:scale-105 transition"
        >

            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          {open && (
            <div className="absolute right-0 mt-3 w-44 rounded-xl dropdown-card bg-white shadow-lg py-2 animate-fade">

              {/* IF USER IS NOT LOGGED IN */}
              {!user && (
                <>
                  <button
                    onClick={() => {
                      openAuth();
                      setOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Login
                  </button>

                  <button
                    onClick={() => {
                      openAuth();
                      setOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Signup
                  </button>
                </>
              )}

              {/* IF USER IS LOGGED IN */}
              {user && (
                <>
                  <div className="px-4 py-2 text-gray-500 border-b">
                    {user.email}
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-500"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;