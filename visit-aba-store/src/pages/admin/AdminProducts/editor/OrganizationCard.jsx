import React from 'react';
import { Tag, X } from 'lucide-react';
import { Card, CardHeader, CardBody, Field } from '../SharedUI';

export default function OrganizationCard({ form, setF, flatCats, brands, inp }) {
  const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <Card>
      <CardHeader>Organisation</CardHeader>
      <CardBody className="space-y-4">
        <Field label="Category">
          <select
            value={form.categorySlug}
            onChange={e => setF({ categorySlug: e.target.value })}
            className={inp}
          >
            <option value="">No category</option>
            {flatCats.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Brand">
          <select
            value={form.brandSlug}
            onChange={e => setF({ brandSlug: e.target.value })}
            className={inp}
          >
            <option value="">No brand</option>
            {brands.map(b => (
              <option key={b.slug || b.id} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Campaign Tags" hint="Comma-separated. Used by the campaign engine for promotions.">
          <input
            value={form.tags}
            onChange={e => setF({ tags: e.target.value })}
            className={inp}
            placeholder="flash-sale, electronics, new-arrival"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-1 rounded-lg"
                >
                  <Tag size={9} /> {t}
                </span>
              ))}
            </div>
          )}
        </Field>
      </CardBody>
    </Card>
  );
}