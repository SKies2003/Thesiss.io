// StartingCapitalInput.jsx
import React from 'react';

const StartingCapitalInput = ({ value, onChange }) => (
  <div className="mb-6">
    <label className="block text-gray-200 mb-2 font-medium text-sm">
      Starting Capital (₹)
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="w-full bg-gray-500 bg-opacity-60 text-white py-2 px-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 font-semibold text-lg transition"
      placeholder="₹1,00,00,000"
    />
  </div>
);

export default StartingCapitalInput;
