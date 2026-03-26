import React from 'react';
import { NIGERIA_STATES } from '../utils/nigeriaGeo';

const AddressForm = ({ address, setAddress, loading }) => {

  const handleStateChange = (e) => {
    
    setAddress({ ...address, state: e.target.value, city: '' });
  };

  const handleCityChange = (e) => {
    setAddress({ ...address, city: e.target.value });
  };

  const handleTextChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    
    let numericValue = e.target.value.replace(/\D/g, '');
    
    
    if (numericValue.length > 10) {
      numericValue = numericValue.slice(0, 10);
    }
    
    setAddress({ ...address, phoneNumber: numericValue });
  };

  const availableCities = address.state ? NIGERIA_STATES[address.state] : [];

  return (
    <div className="space-y-5 bg-white">
      
      {/* Country - Locked */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">Country / Region</label>
        <div className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed select-none">
          Nigeria
        </div>
      </div>

      {/* Phone Number - Strictly Validated */}
      <div>
        <div className="flex justify-between items-end mb-1.5">
          <label className="block text-sm font-bold text-gray-900">Phone number *</label>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold hidden sm:inline-block">
            For delivery updates
          </span>
        </div>
        <div className="relative flex items-center">
          {/* Prefix Badge */}
          <div className="absolute left-1 top-1 bottom-1 flex items-center justify-center px-3 bg-gray-100 rounded-lg border-r border-gray-200 pointer-events-none z-10">
            <span className="text-sm font-black text-gray-700">+234</span>
          </div>
          <input 
            required 
            type="tel" 
            name="phoneNumber"
            disabled={loading}
            value={address.phoneNumber || ''} 
            onChange={handlePhoneChange} 
            placeholder="801 234 5678"
            pattern="[0-9]{10}"
            title="Please enter exactly 10 digits (e.g., 8067088888)"
            className="w-full p-3.5 pl-[84px] border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-bold text-gray-900 placeholder:font-medium placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
        {/* Dynamic validation feedback */}
        {address.phoneNumber && address.phoneNumber.length > 0 && address.phoneNumber.length < 10 && (
          <p className="text-[10px] text-red-500 font-bold mt-1.5">Must be exactly 10 digits.</p>
        )}
      </div>

      {/* Street Address - Strictly Validated */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-1.5">Delivery address *</label>
        <input 
          required 
          type="text" 
          name="streetAddress"
          disabled={loading}
          value={address.streetAddress || ''} 
          onChange={handleTextChange} 
          minLength={5}
          placeholder="Street number, name, and other details"
          className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-gray-900 placeholder:text-gray-300 disabled:bg-gray-50"
        />
      </div>

      {/* State & City Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">State *</label>
          <div className="relative">
            <select 
              required 
              disabled={loading}
              value={address.state || ''} 
              onChange={handleStateChange}
              className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-gray-900 bg-white appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>Select State</option>
              {Object.keys(NIGERIA_STATES).sort().map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {/* Custom dropdown arrow for consistent styling across browsers */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-1.5">City / LGA *</label>
          <div className="relative">
            <select 
              required 
              disabled={loading || !address.state}
              value={address.city || ''} 
              onChange={handleCityChange}
              className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-gray-900 bg-white appearance-none cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="" disabled>{address.state ? "Select City" : "Select State First"}</option>
              {availableCities?.sort().map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AddressForm;