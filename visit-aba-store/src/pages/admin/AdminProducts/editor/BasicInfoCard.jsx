import React from 'react';
import { Card, CardBody, Field } from '../SharedUI';

export default function BasicInfoCard({ form, setF, handleNameChange, inp, slugEdited }) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <Field label="Product Title" required>
          <input
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
            className={inp}
            placeholder="e.g. Apple iPhone 15 Pro Max"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={e => setF({ description: e.target.value })}
            className={`${inp} h-28 resize-none leading-relaxed`}
            placeholder="Describe key features, materials, dimensions, and use cases…"
          />
        </Field>

        <Field label="URL Slug" hint="Auto-generated from title. Edit to customise the product URL.">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm font-medium select-none">/</span>
            <input
              value={form.slug}
              onChange={e => {
                slugEdited.current = true;
                setF({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') });
              }}
              className={`${inp} pl-6 font-mono text-sm text-slate-600`}
              placeholder="auto-generated-from-title"
            />
          </div>
        </Field>
      </CardBody>
    </Card>
  );
}