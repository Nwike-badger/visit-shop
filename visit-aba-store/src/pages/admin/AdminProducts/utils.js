// ─── Formatters & helpers ─────────────────────────────────────────────────────
export const fmt = (n) => Number(n || 0).toLocaleString('en-NG');
export const isActive = (obj) => obj?.active !== false;
export const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const getErr = (err) => {
  if (err.response?.data?.errors?.length > 0)
    return err.response.data.errors[0].defaultMessage;
  return err.response?.data?.message || err.message || 'Something went wrong';
};

// ─── Shared input class ───────────────────────────────────────────────────────
export const inp =
  'w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300';

// ─── Hide browser number-input spinners ───────────────────────────────────────
// Apply to any type="number" input so the +/- arrows never overlap content.
export const noSpin =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

// ─── Flatten category tree for <select> ──────────────────────────────────────
export const flattenTree = (nodes, depth = 0, result = []) => {
  for (const n of nodes) {
    result.push({
      label: `${'  '.repeat(depth)}${depth > 0 ? '↳ ' : ''}${n.name}`,
      value: n.slug || n.id,
    });
    if (n.children?.length) flattenTree(n.children, depth + 1, result);
  }
  return result;
};