import React from 'react';
import { CheckCircle, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../SharedUI';

export default function StatusCard({ form, setF }) {
  return (
    <Card>
      <CardHeader>Status</CardHeader>
      <CardBody className="space-y-2.5">
        <button
          onClick={() => setF({ isActive: true })}
          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
            form.isActive
              ? 'border-green-400 bg-green-50'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <CheckCircle size={18} className={form.isActive ? 'text-green-500' : 'text-slate-300'} />
          <div>
            <p className="text-sm font-bold text-slate-900">Active</p>
            <p className="text-[11px] text-slate-500">Visible in store and search</p>
          </div>
        </button>

        <button
          onClick={() => setF({ isActive: false })}
          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
            !form.isActive
              ? 'border-slate-400 bg-slate-100'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <EyeOff size={18} className={!form.isActive ? 'text-slate-600' : 'text-slate-300'} />
          <div>
            <p className="text-sm font-bold text-slate-900">Draft</p>
            <p className="text-[11px] text-slate-500">Hidden from customers</p>
          </div>
        </button>
      </CardBody>
    </Card>
  );
}