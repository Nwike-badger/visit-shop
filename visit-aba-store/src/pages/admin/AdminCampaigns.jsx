import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig'; // Ensure this points to your axios instance
import { toast } from 'react-hot-toast';
import { Plus, Tag, Calendar, Play, Square, Trash2, Edit, Activity, AlertCircle } from 'lucide-react';

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State for creating a Flash Sale
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountPercentage: '',
    targetCategorySlug: '',
    targetBrandSlug: '',
    startDate: '',
    endDate: ''
  });

  // Load Campaigns
  const fetchCampaigns = async () => {
    try {
      // NOTE: Ensure your axiosConfig sends the JWT token for Admin routes!
      const res = await api.get('/v1/admin/campaigns');
      setCampaigns(res.data);
    } catch (err) {
      toast.error("Failed to load campaigns. Are you logged in as Admin?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Handle Form Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create Campaign
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up empty strings to null for backend mapping
      const payload = {
          ...formData,
          targetCategorySlug: formData.targetCategorySlug || null,
          targetBrandSlug: formData.targetBrandSlug || null,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      await api.post('/v1/admin/campaigns', payload);
      toast.success("Flash Sale Created Successfully!");
      setShowModal(false);
      fetchCampaigns(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create campaign");
    }
  };

  // Activate / Deactivate
  const toggleCampaignStatus = async (id, isActive) => {
    try {
      if (isActive) {
        await api.post(`/v1/admin/campaigns/${id}/deactivate`);
        toast.success("Campaign Deactivated. Prices restored.");
      } else {
        await api.post(`/v1/admin/campaigns/${id}/activate`);
        toast.success("Campaign Activated! Prices slashed.");
      }
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  // Delete Campaign
  const deleteCampaign = async (id) => {
    if(!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await api.delete(`/v1/admin/campaigns/${id}`);
      toast.success("Campaign Deleted");
      fetchCampaigns();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="p-10 font-bold text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Activity className="text-blue-600" /> Promotion Engine
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage flash sales, discounts, and store-wide events.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Create Flash Sale
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              <th className="p-5">Campaign Name</th>
              <th className="p-5">Discount</th>
              <th className="p-5">Target</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-medium">No campaigns found. Create one to start a sale!</td></tr>
            ) : (
              campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5">
                    <p className="font-bold text-slate-900 text-sm">{camp.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{camp.description}</p>
                  </td>
                  <td className="p-5">
                    <span className="bg-red-50 text-red-600 font-black text-xs px-3 py-1 rounded-md">
                      {camp.discountPercentage}% OFF
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                      <Tag size={12} /> {camp.targetCategorySlug || camp.targetBrandSlug || 'Storewide'}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${camp.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {camp.active ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live Now</> : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-5 text-right flex justify-end items-center gap-3">
                    
                    {/* The Magic Toggle Button */}
                    <button 
                      onClick={() => toggleCampaignStatus(camp.id, camp.active)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${camp.active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                    >
                      {camp.active ? <><Square size={12} fill="currentColor"/> Stop Sale</> : <><Play size={12} fill="currentColor"/> Launch Sale</>}
                    </button>

                    <button onClick={() => deleteCampaign(camp.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Create New Flash Sale</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Campaign Name</label>
                <input required type="text" name="name" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="e.g., Black Friday Madness" />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Discount %</label>
                  <input required type="number" name="discountPercentage" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 20" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Category Slug</label>
                  <input type="text" name="targetCategorySlug" onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., electronics (optional)" />
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800 font-medium">
                  <AlertCircle className="shrink-0 text-blue-500" size={20} />
                  <p>When you click <b>Launch Sale</b>, the engine will automatically apply this discount to all matching products. Prices restore instantly when stopped.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-200 hover:bg-black transition-colors text-sm">Save Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCampaigns;