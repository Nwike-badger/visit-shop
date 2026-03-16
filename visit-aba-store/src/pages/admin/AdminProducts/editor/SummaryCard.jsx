import React from 'react';
import { Card, CardHeader, CardBody } from '../SharedUI';
import { fmt } from '../utils';

export default function SummaryCard({ variants, totalUnits, media, specs, form }) {
  const rows = [
    { label: 'Variants',    val: variants.length,                          note: null },
    { label: 'Total stock', val: `${totalUnits} units`,                    note: null },
    { label: 'Media',       val: `${media.length} file${media.length !== 1 ? 's' : ''}`, note: null },
    { label: 'Specs',       val: specs.filter(s => s.key).length,          note: null },
    { label: 'Tags',        val: form.tags ? form.tags.split(',').filter(Boolean).length : 0, note: null },
  ];

  return (
    <Card>
      <CardHeader>Quick Summary</CardHeader>
      <CardBody className="p-0">
        <div className="divide-y divide-slate-50">
          {rows.map(({ label, val }) => (
            <div key={label} className="flex justify-between items-center px-5 py-2.5">
              <span className="text-xs text-slate-500">{label}</span>
              <span className="text-xs font-bold text-slate-800">{val}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}