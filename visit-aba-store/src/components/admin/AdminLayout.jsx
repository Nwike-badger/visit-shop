import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Package, Activity, Settings, Store } from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
          <div className="p-6 bg-slate-900 text-white">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Settings size={16} /> Admin Portal
            </h2>
          </div>
          
          <nav className="p-4 flex flex-col gap-2">
            <NavLink 
              to="/admin/products"
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Package size={18} /> Inventory
            </NavLink>

            <NavLink 
              to="/admin/campaigns"
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Activity size={18} /> Promotions
            </NavLink>

            <div className="my-2 border-t border-gray-100"></div>

            <NavLink 
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Store size={18} /> Back to Store
            </NavLink>
          </nav>
        </aside>

        {/* DYNAMIC CONTENT AREA */}
        <main className="flex-1 w-full bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[70vh]">
           {/* <Outlet /> injects AdminProducts or AdminCampaigns right here based on the URL */}
           <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;