import React from 'react';
import { X, Plus } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../SharedUI';

export default function SpecsCard({ specs, setSpecs, updateSpec, inp }) {
  const filled = specs.filter(s => s.key.trim()).length;

  return (
    <Card>
      <CardHeader
        subtitle={filled > 0 ? `${filled} spec${filled !== 1 ? 's' : ''} defined` : 'Optional product details'}
        action={
          <button
            onClick={() => setSpecs(prev => [...prev, { key: '', value: '' }])}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors"
          >
            <Plus size={12} /> Add row
          </button>
        }
      >
        Technical Specifications
      </CardHeader>
      <CardBody className="space-y-2">
        {specs.map((s, i) => (
          <div key={i} className="flex gap-2 items-center group">
            <input
              value={s.key}
              onChange={e => updateSpec(i, 'key', e.target.value)}
              className={`${inp} w-[38%] text-sm`}
              placeholder="Attribute"
            />
            <input
              value={s.value}
              onChange={e => updateSpec(i, 'value', e.target.value)}
              className={`${inp} flex-1 text-sm`}
              placeholder="Value"
            />
            <button
              onClick={() => setSpecs(p => p.filter((_, j) => j !== i))}
              className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                specs.length > 1
                  ? 'text-slate-200 group-hover:text-slate-400 hover:text-red-500 hover:bg-red-50'
                  : 'text-slate-100 cursor-not-allowed'
              }`}
              disabled={specs.length === 1}
            >
              <X size={13} />
            </button>
          </div>
        ))}
        {!specs.some(s => s.key) && (
          <p className="text-[11px] text-slate-400 leading-relaxed">
            e.g. Weight → 180g · Screen → 6.1" OLED · Battery → 3,800 mAh
          </p>
        )}
      </CardBody>
    </Card>
  );
}