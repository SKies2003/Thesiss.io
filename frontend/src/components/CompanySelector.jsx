import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

const CompanySelector = ({ selectedCompany, onSelect }) => {
  const { token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!dropdownRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("http://localhost:8000/companies/list", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;

        const data = await res.json();
        setCompanies(data);
      } catch (e) {
        console.error("Company fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchCompanies();
  }, [token]);

  // Clean ".NS" for searches (but not displayed)
  const cleanSymbol = (s) => s.replace(".NS", "").trim();

  // High-quality logo source
  const getLogo = (company) =>
    `https://tse2.mm.bing.net/th?q=${encodeURIComponent(company.company_name + " logo")}`;

  const filtered = companies.filter((c) =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    cleanSymbol(c.symbol).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full relative font-sans" ref={dropdownRef}>
      
      {/* TOP FIELD */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full bg-white text-black px-4 py-3 rounded-lg border border-gray-300 cursor-pointer flex justify-between items-center shadow-sm hover:shadow transition"
      >
        <span>
          {selectedCompany ? selectedCompany.company_name : "Select a Company"}
        </span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute left-0 right-0 bg-white rounded-xl shadow-2xl mt-2 z-50 overflow-hidden animate-fadeSlide">

          {/* SEARCH */}
          <div className="p-3 border-b bg-gray-50">
            <input
              type="text"
              placeholder="Search companies…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* SKELETON LOADING */}
          {loading ? (
            <div className="max-h-64 overflow-y-auto p-3 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg shimmer"></div>
              ))}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">

              {/* IF EMPTY */}
              {filtered.length === 0 ? (
                <p className="text-gray-400 py-4 text-center">No companies found</p>
              ) : (
                filtered.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => {
                      onSelect(company);
                      setOpen(false);
                    }}
                    className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition 
                      hover:bg-gray-100 
                      ${selectedCompany?.id === company.id ? "bg-gray-100" : ""}`}
                  >
                    {/* LOGO ONLY (no initials, no fallback) */}
                    <img
                      src={getLogo(company)}
                      alt={company.company_name}
                      className="h-8 w-8 rounded-full object-cover shadow"
                      onError={(e) => {
                        e.target.src = "/default-logo.png"; // You can add your own fallback logo
                      }}
                    />

                    {/* COMPANY NAME ONLY */}
                    <span className="font-medium">{company.company_name}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanySelector;
