import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

const CompanySelector = ({ selectedCompany, onSelect }) => {
  const { token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch companies from backend
  useEffect(() => {
    const getCompanies = async () => {
      if (!token) return;
      try {
        const response = await fetch("http://localhost:8000/companies/list", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) return;
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        console.log("Company fetch error:", err);
      }
    };

    getCompanies();
  }, [token]);

  const filtered = companies.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full relative" ref={dropdownRef}>
      
      {/* Input box */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full bg-white text-black px-4 py-3 rounded-lg border border-gray-300 cursor-pointer flex justify-between items-center"
      >
        <span>
          {selectedCompany ? selectedCompany.company_name : "Select a Company"}
        </span>

        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </div>

      {/* Animated Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 bg-white rounded-xl shadow-2xl mt-2 z-50 overflow-hidden animate-fadeSlide"
          style={{ maxHeight: "320px" }}
        >

          {/* Search Bar */}
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 text-black focus:outline-none"
            />
          </div>

          {/* Scrollable List */}
          <div className="max-h-64 overflow-y-scroll">
            {filtered.length === 0 ? (
              <p className="text-gray-400 py-4 text-center">No companies found</p>
            ) : (
              filtered.map(company => (
                <div
                  key={company.id}
                  onClick={() => {
                    onSelect(company);
                    setOpen(false);
                  }}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition flex flex-col"
                >
                  <span className="font-medium">{company.company_name}</span>
                  <span className="text-gray-500 text-sm">{company.symbol}</span>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default CompanySelector;
