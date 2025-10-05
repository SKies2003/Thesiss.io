import React from 'react';

const companies = [
  { name: "Amazon" },
  { name: "Google" },
  { name: "Microsoft" },
  // ...add as many as needed
];

const CompanySelector = ({ onSelect, selectedCompany }) => (
  <div className="flex flex-col min-h-[300px] max-h-[300px]">
    <span className="px-4 py-2 text-lg font-medium text-gray-700">
      Select a Company
    </span>
    <div className="flex-1 overflow-y-auto" style={{ maxHeight: '260px' }}>
      {/* You can increase/decrease maxHeight as per your UI */}
      {companies.map(company => (
        <button
          key={company.name}
          onClick={() => onSelect(company)}
          className={`w-full text-left text-md px-5 py-2 mb-2 rounded-2xl bg-gray-100
            hover:bg-blue-100 transition 
            ${selectedCompany?.name === company.name ? "border-2 border-blue-400 shadow" : ""}
          `}
        >
          {company.name}
        </button>
      ))}
    </div>
  </div>
);

export default CompanySelector;
