import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Package, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api/axiosConfig';

const AccountPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Address Form State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addressForm, setAddressForm] = useState({
    streetAddress: '', city: '', state: '', postalCode: '', country: 'Nigeria'
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/v1/users/me');
        setUser(res.data);
        if (res.data.defaultAddress) {
            setAddressForm(res.data.defaultAddress);
        } else {
            setIsEditingAddress(true); // Auto-open form if they have no address!
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
        navigate('/login'); // Kick them out if token is dead
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleAddressUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
        const res = await api.put('/v1/users/me/address', { address: addressForm });
        setUser(res.data);
        setIsEditingAddress(false);
        alert("Address saved successfully!"); // Replace with a nice toast later
    } catch (err) {
        alert("Failed to save address.");
    } finally {
        setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;

  const profileCompletion = user?.defaultAddress ? 100 : 70;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans min-h-screen">
      <h1 className="text-3xl font-black text-gray-900 mb-8">My Account</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:w-64 shrink-0 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl transition-colors">
                <User size={20}/> Profile Overview
            </button>
            <button onClick={() => navigate('/orders')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">
                <Package size={20}/> My Orders
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">
                <Settings size={20}/> Settings
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors mt-4">
                Log Out
            </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 space-y-8">
            
            {/* Completion Banner */}
            {profileCompletion < 100 && (
                <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl flex items-start sm:items-center gap-4">
                    <div className="bg-orange-100 p-2 rounded-full text-orange-600 shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-orange-900 font-bold text-lg">Complete your profile</h3>
                        <p className="text-orange-700 text-sm mt-1">Add your shipping address so you can check out faster on your next purchase.</p>
                    </div>
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-white p-6 sm:p-8 border border-gray-100 shadow-sm rounded-2xl flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg">
                    {user?.firstName?.charAt(0)}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
                    <p className="text-gray-500">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full mt-2">
                        <CheckCircle size={12}/> Verified Customer
                    </span>
                </div>
            </div>

            {/* Address Book Card */}
            <div className="bg-white p-6 sm:p-8 border border-gray-100 shadow-sm rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><MapPin className="text-blue-600"/> Default Shipping Address</h3>
                    {!isEditingAddress && user?.defaultAddress && (
                        <button onClick={() => setIsEditingAddress(true)} className="text-sm font-bold text-blue-600 hover:text-blue-800">Edit</button>
                    )}
                </div>

                {isEditingAddress ? (
                    <form onSubmit={handleAddressUpdate} className="space-y-4 max-w-2xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address</label>
                            <input required type="text" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={addressForm.streetAddress} onChange={e => setAddressForm({...addressForm, streetAddress: e.target.value})} placeholder="e.g. 12 Awolowo Way" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                                <input required type="text" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} placeholder="Ikeja" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                                <input required type="text" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} placeholder="Lagos" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                                <input disabled type="text" className="w-full p-3 bg-gray-200 border border-gray-300 rounded-lg text-gray-500" value="Nigeria" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Postal Code (Optional)</label>
                                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500" value={addressForm.postalCode} onChange={e => setAddressForm({...addressForm, postalCode: e.target.value})} placeholder="100001" />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="submit" disabled={saving} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save Address'}
                            </button>
                            {user?.defaultAddress && (
                                <button type="button" onClick={() => setIsEditingAddress(false)} className="text-gray-500 font-bold px-4 hover:text-gray-800">Cancel</button>
                            )}
                        </div>
                    </form>
                ) : user?.defaultAddress ? (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-gray-600 mt-1">{user.defaultAddress.streetAddress}</p>
                        <p className="text-gray-600">{user.defaultAddress.city}, {user.defaultAddress.state}</p>
                        <p className="text-gray-600">{user.defaultAddress.country}</p>
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                        <p className="text-gray-500 mb-4">You haven't added a shipping address yet.</p>
                        <button onClick={() => setIsEditingAddress(true)} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition shadow-md">
                            Add Address
                        </button>
                    </div>
                )}
            </div>
            
        </div>
      </div>
    </div>
  );
};

export default AccountPage;