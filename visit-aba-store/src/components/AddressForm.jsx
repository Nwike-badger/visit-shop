import React from 'react';
import { NIGERIA_STATES } from '../utils/nigeriaGeo';

const AddressForm = ({ address, setAddress, loading }) => {

  const handleStateChange = (e) => {
    // When state changes, we must clear the city because the old city doesn't belong to the new state
    setAddress({ ...address, state: e.target.value, city: '' });
  };

  const handleCityChange = (e) => {
    setAddress({ ...address, city: e.target.value });
  };

  const handleTextChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const availableCities = address.state ? NIGERIA_STATES[address.state] : [];

  return (
    <div className="space-y-5 bg-white">
      
      {/* Country - Locked */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">Country / Region</label>
        <div className="w-full p-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed">
          Nigeria
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <div className="flex justify-between items-end mb-1.5">
          <label className="block text-sm font-bold text-gray-900">Phone number *</label>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">May be used to assist delivery</span>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">NG +234</span>
          <input 
            required 
            type="tel" 
            name="phoneNumber"
            disabled={loading}
            value={address.phoneNumber || ''} 
            onChange={handleTextChange} 
            placeholder="801 234 5678"
            className="w-full p-3.5 pl-20 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-medium text-gray-900"
          />
        </div>
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">Delivery address *</label>
        <input 
          required 
          type="text" 
          name="streetAddress"
          disabled={loading}
          value={address.streetAddress || ''} 
          onChange={handleTextChange} 
          placeholder="Street number, name, and other details"
          className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-medium text-gray-900"
        />
      </div>

      {/* State & City Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">State *</label>
          <select 
            required 
            disabled={loading}
            value={address.state || ''} 
            onChange={handleStateChange}
            className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-medium text-gray-900 bg-white appearance-none cursor-pointer"
          >
            <option value="" disabled>Select State</option>
            {Object.keys(NIGERIA_STATES).sort().map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">City / LGA *</label>
          <select 
            required 
            disabled={loading || !address.state}
            value={address.city || ''} 
            onChange={handleCityChange}
            className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-medium text-gray-900 bg-white appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="" disabled>{address.state ? "Select City" : "Select State First"}</option>
            {availableCities?.sort().map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;