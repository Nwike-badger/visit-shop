import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Package, Settings, AlertCircle, CheckCircle, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../../api/axiosConfig';
import AddressForm from '../../components/AddressForm';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext'; 

const AccountPage = () => {
  const navigate = useNavigate();
  const { updateUser, logout } = useAuth(); 
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [addressForm, setAddressForm] = useState({
    streetAddress: '', city: '', state: '', phoneNumber: '', country: 'Nigeria'
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/v1/users/me');
        setUser(res.data);
        if (res.data.defaultAddress) {
            setAddressForm(res.data.defaultAddress);
        } else {
            setIsEditingAddress(true); 
        }
      } catch (err) {
        navigate('/login'); 
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
        
        // Sync with global state so Navbar & Checkout instantly update!
        if (updateUser) {
            updateUser(res.data); 
        }

        setIsEditingAddress(false);
        toast.success("Address saved successfully!");
    } catch (err) {
        toast.error("Failed to save address.");
    } finally {
        setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
        <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
        </div>
    </div>
  );

  const isAddressComplete = user?.defaultAddress?.streetAddress && user?.defaultAddress?.city && user?.defaultAddress?.phoneNumber;
  const profileCompletion = isAddressComplete ? 100 : 70;
  
  // Admin Check
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.role === 'ROLE_ADMIN';

  return (
    <div className="bg-gray-50/30 min-h-screen pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Page Header */}
        <div className="mb-8 lg:mb-12">
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">My Account</h1>
            <p className="text-gray-500 font-medium mt-2">Manage your profile, orders, and preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* ─── SIDEBAR NAVIGATION ───────────────────────────────────────── */}
          <div className="lg:w-72 shrink-0">
              <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm sticky top-28 space-y-1.5">
                  <button className="w-full flex items-center justify-between px-5 py-3.5 bg-blue-50 text-blue-700 font-bold rounded-2xl transition-colors group">
                      <div className="flex items-center gap-3"><User size={20} className="text-blue-600"/> Profile Overview</div>
                      <ChevronRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={() => navigate('/orders')} className="w-full flex items-center justify-between px-5 py-3.5 text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 rounded-2xl transition-colors group">
                      <div className="flex items-center gap-3"><Package size={20} className="text-gray-400"/> My Orders</div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="w-full flex items-center justify-between px-5 py-3.5 text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 rounded-2xl transition-colors group">
                      <div className="flex items-center gap-3"><Settings size={20} className="text-gray-400"/> Settings</div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  {isAdmin && (
                    <>
                      <div className="h-px bg-gray-100 my-2" />
                      <button onClick={() => navigate('/admin/products')} className="w-full flex items-center justify-between px-5 py-3.5 text-blue-700 font-bold bg-blue-50/50 hover:bg-blue-100 rounded-2xl transition-colors group">
                          <div className="flex items-center gap-3"><ShieldCheck size={20} /> Admin Portal</div>
                          <ChevronRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </>
                  )}

                  <div className="h-px bg-gray-100 my-2" />
                  
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3.5 text-red-500 font-bold hover:bg-red-50 hover:text-red-600 rounded-2xl transition-colors">
                      <LogOut size={20}/> Log Out
                  </button>
              </div>
          </div>

          {/* ─── MAIN CONTENT AREA ────────────────────────────────────────── */}
          <div className="flex-1 space-y-6 lg:space-y-8 max-w-4xl">
              
              {/* Profile Completion Nudge */}
              {profileCompletion < 100 && (
                  <div className="bg-orange-50/80 border border-orange-200/60 p-5 sm:p-6 rounded-3xl flex items-start sm:items-center gap-4 sm:gap-5 shadow-sm">
                      <div className="bg-white p-3 rounded-2xl text-orange-500 shadow-sm shrink-0">
                          <AlertCircle size={24} />
                      </div>
                      <div className="flex-1">
                          <h3 className="text-orange-900 font-black text-lg tracking-tight">Complete your profile</h3>
                          <p className="text-orange-800/80 text-sm mt-1 font-medium">Add your shipping address so you can check out faster on your next purchase.</p>
                      </div>
                  </div>
              )}

              {/* Identity Card */}
              <div className="bg-white p-6 sm:p-10 border border-gray-100 shadow-sm rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-xl shrink-0">
                      {user?.firstName?.charAt(0)}
                  </div>
                  <div className="flex-1 pt-2">
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-1">{user?.firstName} {user?.lastName}</h2>
                      <p className="text-gray-500 font-medium mb-4">{user?.email}</p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200/60 text-xs font-bold px-3 py-1.5 rounded-full">
                              <CheckCircle size={14}/> Verified Customer
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 border border-gray-200/60 text-xs font-bold px-3 py-1.5 rounded-full">
                              Member since {new Date().getFullYear()}
                          </span>
                      </div>
                  </div>
              </div>

              {/* Address Book Card */}
              <div className="bg-white p-6 sm:p-10 border border-gray-100 shadow-sm rounded-3xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                          <MapPin className="text-blue-600"/> Shipping Address
                        </h3>
                        <p className="text-gray-500 text-sm font-medium mt-1">Where should we send your orders?</p>
                      </div>
                      
                      {!isEditingAddress && isAddressComplete && (
                          <button 
                            onClick={() => setIsEditingAddress(true)} 
                            className="text-sm font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-xl transition-colors"
                          >
                            Edit Address
                          </button>
                      )}
                  </div>

                  {isEditingAddress ? (
                      <div className="bg-gray-50/50 p-1 sm:p-6 rounded-2xl">
                        <form onSubmit={handleAddressUpdate}>
                            <AddressForm address={addressForm} setAddress={setAddressForm} loading={saving} />

                            <div className="flex flex-col sm:flex-row gap-3 pt-8 mt-8 border-t border-gray-200/60">
                                <button 
                                  type="submit" 
                                  disabled={saving} 
                                  className="w-full sm:w-auto bg-blue-600 text-white font-black text-sm uppercase tracking-widest py-4 px-10 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving Details...' : 'Save Address'}
                                </button>
                                {isAddressComplete && (
                                    <button 
                                      type="button" 
                                      onClick={() => setIsEditingAddress(false)} 
                                      className="w-full sm:w-auto text-gray-600 font-bold px-8 py-4 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                      Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                      </div>
                  ) : isAddressComplete ? (
                      <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-100 relative group">
                          {/* Visual decorative badge */}
                          <div className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all">
                             <MapPin size={20} />
                          </div>
                          
                          <p className="font-black text-gray-900 text-lg mb-2">{user.firstName} {user.lastName}</p>
                          
                          <div className="space-y-1 text-gray-600 font-medium">
                            <p className="text-gray-900 font-bold">{user.defaultAddress.phoneNumber}</p>
                            <p className="pt-2">{user.defaultAddress.streetAddress}</p>
                            <p>{user.defaultAddress.city}, {user.defaultAddress.state}</p>
                            <p className="text-gray-400 text-sm mt-1">{user.defaultAddress.country}</p>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center py-12 px-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-400">
                             <MapPin size={24} />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-2">No Address Found</h4>
                          <p className="text-gray-500 font-medium mb-6 max-w-sm mx-auto">Your address book is currently empty. Add a delivery address to speed up checkout.</p>
                          <button 
                            onClick={() => setIsEditingAddress(true)} 
                            className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black hover:shadow-lg transition-all"
                          >
                              Add New Address
                          </button>
                      </div>
                  )}
              </div>
              
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;