// TimeDurationInput.jsx
import React from 'react';

const TimeDurationInput = ({ value, onChange }) => (
  <div className="mb-6">
    <label className="block text-gray-200 mb-2 font-medium text-sm">
      Time Horizon (Years)
    </label>
    <input
      type="number"
      min={1}
      value={value}
      onChange={onChange}
      className="w-full bg-gray-500 bg-opacity-60 text-white py-2 px-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 font-semibold text-lg transition"
      placeholder="e.g., 5"
    />
  </div>
);

export default TimeDurationInput;
