import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight,
  FiChevronRight, FiArrowLeft, FiX, FiCheck, FiAlertTriangle,
  FiSearch, FiPackage, FiLayers, FiShoppingBag, FiImage,
  FiSave, FiEye, FiEyeOff, FiGrid, FiList
} from 'react-icons/fi';

// ─── Tiny toast system ────────────────────────────────────────────────────────
let _addToast;
const Toast = () => {
  const [toasts, setToasts] = useState([]);
  _addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium
              ${t.type === 'success' ? 'bg-emerald-600 text-white' :
                t.type === 'error' ? 'bg-red-600 text-white' :
                'bg-amber-500 text-white'}`}
          >
            {t.type === 'success' ? <FiCheck size={15} /> : <FiAlertTriangle size={15} />}
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
const toast = (msg, type) => _addToast?.(msg, type);

// ─── Confirm dialog ──────────────────────────────────────────────────────────
const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, danger }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div initial={{ scale: 0.93, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto
            ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
            <FiAlertTriangle className={danger ? 'text-red-600' : 'text-amber-600'} size={22} />
          </div>
          <h3 className="text-center font-semibold text-gray-900 text-lg mb-1">{title}</h3>
          <p className="text-center text-gray-500 text-sm mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors
                ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Slide Panel ─────────────────────────────────────────────────────────────
const SlidePanel = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm" />
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-lg bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-lg">{title}</h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500">
              <FiX size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ─── Form Field ───────────────────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-white";

// ─── Category / Subcategory Form ──────────────────────────────────────────────
const CategoryForm = ({ initial, categories, isCategory, onSave, onClose, loading }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    priority: initial?.priority ?? '',
    parent_category: initial?.parent_category || '',
    is_active: initial?.is_active ?? true,
    description: initial?.description || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.priority === '' || isNaN(form.priority)) e.priority = 'Valid priority number required';
    if (!isCategory && !form.parent_category) e.parent_category = 'Parent category required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ ...form, priority: parseInt(form.priority) });
  };

  return (
    <div className="flex flex-col gap-5">
      <Field label="Name" required error={errors.name}>
        <input className={inputCls} placeholder={`${isCategory ? 'Category' : 'Subcategory'} name`}
          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={255} />
      </Field>

      <Field label="Priority" required error={errors.priority}>
        <input className={inputCls} type="number" placeholder="e.g. 1"
          value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} />
        <p className="text-xs text-gray-400">Lower number = higher priority in list</p>
      </Field>

      {!isCategory && (
        <Field label="Parent Category" required error={errors.parent_category}>
          <select className={inputCls} value={form.parent_category}
            onChange={e => setForm(f => ({ ...f, parent_category: parseInt(e.target.value) }))}>
            <option value="">Select category…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      )}

      <Field label="Description">
        <textarea className={inputCls + ' resize-none'} rows={3} placeholder="Optional description…"
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </Field>

      <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
        <div>
          <p className="text-sm font-medium text-gray-700">Active status</p>
          <p className="text-xs text-gray-400">Visible to customers when active</p>
        </div>
        <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${form.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FiSave size={15} />}
          {initial ? 'Save changes' : `Add ${isCategory ? 'category' : 'subcategory'}`}
        </button>
      </div>
    </div>
  );
};

// ─── Product Form ──────────────────────────────────────────────────────────────
const ProductForm = ({ initial, onSave, onClose, loading }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    price: initial?.price ?? '',
    description: initial?.description || '',
    is_active: initial?.is_active ?? true,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Product name is required';
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ ...form, price: parseFloat(form.price) });
  };

  return (
    <div className="flex flex-col gap-5">
      {initial?.image && (
        <div className="relative rounded-xl overflow-hidden h-40 bg-gray-100">
          <img src={initial.image} alt={initial.title} className="w-full h-full object-cover" />
        </div>
      )}

      <Field label="Product Name" required error={errors.title}>
        <input className={inputCls} placeholder="e.g. Premium Wireless Headphones"
          value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </Field>

      <Field label="Price (৳)" required error={errors.price}>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">৳</span>
          <input className={inputCls + ' pl-8'} type="number" step="0.01" min="0" placeholder="0.00"
            value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
        </div>
      </Field>

      <Field label="Description">
        <textarea className={inputCls + ' resize-none'} rows={4} placeholder="Product description…"
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </Field>

      <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
        <div>
          <p className="text-sm font-medium text-gray-700">Active status</p>
          <p className="text-xs text-gray-400">Visible to customers when active</p>
        </div>
        <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${form.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FiSave size={15} />}
          {initial ? 'Save changes' : 'Add product'}
        </button>
      </div>
    </div>
  );
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const Badge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
    ${active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

// ─── Category / Subcategory Row ───────────────────────────────────────────────
const ItemRow = ({ item, isCategory, categories, onEdit, onDelete, onToggle, onDrillDown }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all overflow-hidden">
    <div className="flex items-center gap-4 p-4">
      {/* Image / Placeholder */}
      <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 relative">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-300">
              <FiImage size={20} />
            </div>}
        {!item.is_active && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <FiEyeOff size={14} className="text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
          <Badge active={item.is_active} />
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-400">Priority {item.priority}</span>
          {!isCategory && (
            <span className="text-xs text-gray-400">
              · {categories.find(c => c.id === item.parent_category)?.name || 'Uncategorized'}
            </span>
          )}
          {item.description && (
            <span className="text-xs text-gray-400 truncate hidden sm:block">· {item.description}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onToggle(item.id, item.is_active)}
          title={item.is_active ? 'Deactivate' : 'Activate'}
          className={`p-2 rounded-lg transition-colors text-sm
            ${item.is_active ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-emerald-50 text-emerald-600'}`}>
          {item.is_active ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
        <button onClick={() => onEdit(item)}
          className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors">
          <FiEdit2 size={16} />
        </button>
        <button onClick={() => onDelete(item.id)}
          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
          <FiTrash2 size={16} />
        </button>
      </div>

      {onDrillDown && (
        <button onClick={() => onDrillDown(item.id)}
          className="ml-1 p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors flex items-center gap-1 text-xs font-medium">
          View
          <FiChevronRight size={14} />
        </button>
      )}
    </div>
  </motion.div>
);

// ─── Product Card ──────────────────────────────────────────────────────────────
const ProductCard = ({ product, onEdit, onDelete, onToggle }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all overflow-hidden">
    {product.image && (
      <div className="relative h-44 bg-gray-50">
        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        {!product.is_active && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-3 py-1 bg-black/60 text-white text-xs font-bold rounded-full tracking-wide">INACTIVE</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge active={product.is_active} />
        </div>
      </div>
    )}
    <div className="p-4">
      {!product.image && (
        <div className="flex items-center justify-between mb-2">
          <Badge active={product.is_active} />
        </div>
      )}
      <h3 className="font-semibold text-gray-900 leading-snug">{product.title}</h3>
      <p className="text-xl font-bold text-indigo-600 mt-1">৳{product.price}</p>
      {product.description && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
      )}
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
        <button onClick={() => onEdit(product)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors">
          <FiEdit2 size={13} /> Edit
        </button>
        <button onClick={() => onToggle(product.id, product.is_active)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors
            ${product.is_active
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}>
          {product.is_active ? <><FiEyeOff size={13} /> Hide</> : <><FiEye size={13} /> Show</>}
        </button>
        <button onClick={() => onDelete(product.id)}
          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Search bar ───────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
    <input
      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-white"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

// ─── Tab bar ──────────────────────────────────────────────────────────────────
const tabs = [
  { key: 'categories', label: 'Categories', icon: FiPackage },
  { key: 'subcategories', label: 'Subcategories', icon: FiLayers },
  { key: 'products', label: 'Products', icon: FiShoppingBag },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const Products = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // ── data
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── navigation
  const [tab, setTab] = useState('categories');           // categories | subcategories | products
  const [drillCategory, setDrillCategory] = useState(null);   // category obj
  const [drillSubcategory, setDrillSubcategory] = useState(null); // subcategory obj
  // drill view: null | 'subcategories' | 'products'
  const drillView = drillSubcategory ? 'products' : drillCategory ? 'subcategories' : null;

  // ── ui state
  const [search, setSearch] = useState('');
  const [gridMode, setGridMode] = useState(false);

  // ── panel / form
  const [panel, setPanel] = useState(null); // { mode: 'add'|'edit', type: 'category'|'subcategory'|'product', item?: {} }

  // ── confirm dialog
  const [confirm, setConfirm] = useState(null); // { title, message, onConfirm, danger }

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch helpers
  // ─────────────────────────────────────────────────────────────────────────────
  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/categories/`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data.sort((a, b) => a.priority - b.priority));
    } catch { toast('Failed to load categories', 'error'); }
    finally { setLoading(false); }
  };

  const loadSubcategories = async (parentId) => {
    try {
      setLoading(true);
      const url = parentId ? `${apiUrl}/subcategories/?parent_category=${parentId}` : `${apiUrl}/subcategories/`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubcategories(data.sort((a, b) => a.priority - b.priority));
    } catch { toast('Failed to load subcategories', 'error'); }
    finally { setLoading(false); }
  };

  const loadProducts = async (subcategoryId) => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/subcategories/${subcategoryId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(data.products || []);
    } catch { toast('Failed to load products', 'error'); }
    finally { setLoading(false); }
  };

  // Initial loads
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (tab === 'subcategories') loadSubcategories(null);
    if (tab === 'categories') loadCategories();
    // products tab starts from category drill-down
    setDrillCategory(null);
    setDrillSubcategory(null);
    setSearch('');
  }, [tab]);

  // ─────────────────────────────────────────────────────────────────────────────
  // CRUD operations
  // ─────────────────────────────────────────────────────────────────────────────
  const saveItem = async (formValues) => {
    const { mode, type, item } = panel;
    setSaving(true);
    try {
      let endpoint, method;
      if (type === 'category') {
        endpoint = mode === 'edit' ? `${apiUrl}/categories/${item.id}/` : `${apiUrl}/categories/`;
        method = mode === 'edit' ? 'PATCH' : 'POST';
      } else if (type === 'subcategory') {
        endpoint = mode === 'edit' ? `${apiUrl}/subcategories/${item.id}` : `${apiUrl}/subcategories/`;
        method = mode === 'edit' ? 'PATCH' : 'POST';
      } else {
        // product — adjust endpoint as needed
        endpoint = mode === 'edit' ? `${apiUrl}/products/${item.id}/` : `${apiUrl}/products/`;
        method = mode === 'edit' ? 'PATCH' : 'POST';
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();

      if (type === 'category') {
        setCategories(prev =>
          mode === 'edit'
            ? prev.map(c => c.id === item.id ? { ...c, ...saved } : c).sort((a, b) => a.priority - b.priority)
            : [...prev, saved].sort((a, b) => a.priority - b.priority)
        );
      } else if (type === 'subcategory') {
        setSubcategories(prev =>
          mode === 'edit'
            ? prev.map(s => s.id === item.id ? { ...s, ...saved } : s).sort((a, b) => a.priority - b.priority)
            : [...prev, saved].sort((a, b) => a.priority - b.priority)
        );
      } else {
        setProducts(prev =>
          mode === 'edit'
            ? prev.map(p => p.id === item.id ? { ...p, ...saved } : p)
            : [...prev, saved]
        );
      }

      toast(mode === 'edit' ? 'Changes saved!' : `${type.charAt(0).toUpperCase() + type.slice(1)} added!`);
      setPanel(null);
    } catch (e) {
      toast(e.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus, type) => {
    try {
      const endpoint =
        type === 'category' ? `${apiUrl}/categories/${id}/` :
        type === 'subcategory' ? `${apiUrl}/subcategories/${id}` :
        `${apiUrl}/products/${id}/`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (!res.ok) throw new Error();

      const label = currentStatus ? 'Deactivated' : 'Activated';
      if (type === 'category') setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      else if (type === 'subcategory') setSubcategories(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
      else setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
      toast(`${label} successfully`);
    } catch { toast('Failed to update status', 'error'); }
  };

  const deleteItem = (id, type) => {
    setConfirm({
      title: `Delete ${type}?`,
      message: "This action can't be undone.",
      danger: true,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const endpoint =
            type === 'category' ? `${apiUrl}/categories/${id}/` :
            type === 'subcategory' ? `${apiUrl}/subcategories/${id}` :
            `${apiUrl}/products/${id}/`;

          const res = await fetch(endpoint, { method: 'DELETE' });
          if (!res.ok && res.status !== 204) throw new Error();

          if (type === 'category') setCategories(prev => prev.filter(c => c.id !== id));
          else if (type === 'subcategory') setSubcategories(prev => prev.filter(s => s.id !== id));
          else setProducts(prev => prev.filter(p => p.id !== id));
          toast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`);
        } catch { toast('Delete failed', 'error'); }
      }
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Drill-down navigation
  // ─────────────────────────────────────────────────────────────────────────────
  const drillIntoCategory = async (category) => {
    setDrillCategory(category);
    await loadSubcategories(category.id);
  };

  const drillIntoSubcategory = async (subcategory) => {
    setDrillSubcategory(subcategory);
    await loadProducts(subcategory.id);
  };

  const goBack = () => {
    if (drillSubcategory) {
      setDrillSubcategory(null);
      setSearch('');
    } else if (drillCategory) {
      setDrillCategory(null);
      setSearch('');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Filtered lists
  // ─────────────────────────────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(q));
  const filteredSubcategories = subcategories.filter(s => s.name.toLowerCase().includes(q));
  const filteredProducts = products.filter(p => p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  // Breadcrumb path
  const breadcrumbItems = [];
  if (tab === 'products') {
    breadcrumbItems.push({ label: 'Products', onClick: () => { setDrillCategory(null); setDrillSubcategory(null); } });
    if (drillCategory) breadcrumbItems.push({ label: drillCategory.name, onClick: drillSubcategory ? goBack : null });
    if (drillSubcategory) breadcrumbItems.push({ label: drillSubcategory.name });
  }

  const currentType =
    tab === 'categories' ? 'category' :
    tab === 'subcategories' ? 'subcategory' :
    drillView === 'products' ? 'product' : null;

  const canAdd = tab !== 'products' || drillView === 'products';

  const addLabel =
    tab === 'categories' ? 'Add Category' :
    tab === 'subcategories' ? 'Add Subcategory' :
    drillView === 'products' ? 'Add Product' : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast />
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        danger={confirm?.danger}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />

      {/* Slide-in panel */}
      <SlidePanel
        open={!!panel}
        onClose={() => setPanel(null)}
        title={panel ? `${panel.mode === 'edit' ? 'Edit' : 'Add'} ${panel.type.charAt(0).toUpperCase() + panel.type.slice(1)}` : ''}
      >
        {panel?.type === 'product' ? (
          <ProductForm
            initial={panel.item}
            onSave={saveItem}
            onClose={() => setPanel(null)}
            loading={saving}
          />
        ) : panel ? (
          <CategoryForm
            initial={panel.item}
            categories={categories}
            isCategory={panel.type === 'category'}
            onSave={saveItem}
            onClose={() => setPanel(null)}
            loading={saving}
          />
        ) : null}
      </SlidePanel>

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="font-bold text-gray-900 text-lg tracking-tight">Product Management</h1>
            </div>
            {canAdd && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setPanel({ mode: 'add', type: currentType })}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-indigo-200">
                <FiPlus size={16} />
                {addLabel}
              </motion.button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 pb-0.5">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
                  ${tab === key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}>
                <Icon size={15} />
                {label}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold
                  ${tab === key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                  {key === 'categories' ? categories.length :
                   key === 'subcategories' ? subcategories.length :
                   drillView === 'products' ? products.length : categories.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumb (products drill-down) */}
        {breadcrumbItems.length > 0 && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <button onClick={goBack} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium">
              <FiArrowLeft size={14} /> Back
            </button>
            <span className="text-gray-300">/</span>
            {breadcrumbItems.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-300">/</span>}
                <button
                  onClick={b.onClick}
                  className={b.onClick && i < breadcrumbItems.length - 1
                    ? 'text-indigo-600 hover:text-indigo-800 font-medium'
                    : 'text-gray-900 font-semibold pointer-events-none'}>
                  {b.label}
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={
                tab === 'categories' ? 'Search categories…' :
                tab === 'subcategories' ? 'Search subcategories…' :
                drillView === 'products' ? 'Search products…' :
                drillView === 'subcategories' ? 'Search subcategories…' :
                'Search categories…'
              }
            />
          </div>
          {(tab === 'products' && drillView === 'products') && (
            <button onClick={() => setGridMode(m => !m)}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              {gridMode ? <FiList size={16} /> : <FiGrid size={16} />}
            </button>
          )}
        </div>

        {/* ── Loading ─────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : (
          <>
            {/* ── CATEGORIES TAB ─────────────────────────────────────────────── */}
            {tab === 'categories' && (
              filteredCategories.length === 0 ? (
                <EmptyState icon={FiPackage} label="No categories yet"
                  sub="Create your first category to get started"
                  action={() => setPanel({ mode: 'add', type: 'category' })} actionLabel="Add Category" />
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredCategories.map(c => (
                    <ItemRow key={c.id} item={c} isCategory categories={categories}
                      onEdit={item => setPanel({ mode: 'edit', type: 'category', item })}
                      onDelete={id => deleteItem(id, 'category')}
                      onToggle={(id, s) => toggleStatus(id, s, 'category')} />
                  ))}
                </div>
              )
            )}

            {/* ── SUBCATEGORIES TAB ──────────────────────────────────────────── */}
            {tab === 'subcategories' && (
              filteredSubcategories.length === 0 ? (
                <EmptyState icon={FiLayers} label="No subcategories yet"
                  sub="Create your first subcategory to get started"
                  action={() => setPanel({ mode: 'add', type: 'subcategory' })} actionLabel="Add Subcategory" />
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredSubcategories.map(s => (
                    <ItemRow key={s.id} item={s} isCategory={false} categories={categories}
                      onEdit={item => setPanel({ mode: 'edit', type: 'subcategory', item })}
                      onDelete={id => deleteItem(id, 'subcategory')}
                      onToggle={(id, st) => toggleStatus(id, st, 'subcategory')} />
                  ))}
                </div>
              )
            )}

            {/* ── PRODUCTS TAB ───────────────────────────────────────────────── */}
            {tab === 'products' && !drillView && (
              /* Choose category */
              filteredCategories.length === 0 ? (
                <EmptyState icon={FiShoppingBag} label="No categories found"
                  sub="Add categories first to manage products" />
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">Select a category to browse its products</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map(c => (
                      <motion.button key={c.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                        onClick={() => drillIntoCategory(c)}
                        className="text-left bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all p-5 group">
                        <div className="flex items-start gap-3">
                          {c.image
                            ? <img src={c.image} alt={c.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                            : <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                <FiPackage size={22} className="text-indigo-400" />
                              </div>
                          }
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-gray-900 truncate">{c.name}</h3>
                              <FiChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                            </div>
                            {c.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{c.description}</p>}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge active={c.is_active} />
                              <span className="text-xs text-gray-400">P{c.priority}</span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              )
            )}

            {tab === 'products' && drillView === 'subcategories' && (
              /* Choose subcategory */
              filteredSubcategories.length === 0 ? (
                <EmptyState icon={FiLayers} label="No subcategories"
                  sub="This category doesn't have any subcategories yet" />
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">Select a subcategory to view its products</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubcategories.map(s => (
                      <motion.button key={s.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                        onClick={() => drillIntoSubcategory(s)}
                        className="text-left bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all p-5 group">
                        <div className="flex items-start gap-3">
                          {s.image
                            ? <img src={s.image} alt={s.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                            : <div className="w-14 h-14 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                                <FiLayers size={22} className="text-violet-400" />
                              </div>
                          }
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-gray-900 truncate">{s.name}</h3>
                              <FiChevronRight size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge active={s.is_active} />
                              <span className="text-xs text-gray-400">{s.products?.length || 0} products</span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              )
            )}

            {tab === 'products' && drillView === 'products' && (
              filteredProducts.length === 0 ? (
                <EmptyState icon={FiShoppingBag} label="No products here"
                  sub="Add the first product to this subcategory"
                  action={() => setPanel({ mode: 'add', type: 'product' })} actionLabel="Add Product" />
              ) : gridMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(p => (
                    <ProductCard key={p.id} product={p}
                      onEdit={item => setPanel({ mode: 'edit', type: 'product', item })}
                      onDelete={id => deleteItem(id, 'product')}
                      onToggle={(id, s) => toggleStatus(id, s, 'product')} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredProducts.map(p => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative">
                          {p.image
                            ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-300"><FiImage size={20} /></div>}
                          {!p.is_active && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <FiEyeOff size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">{p.title}</h3>
                            <Badge active={p.is_active} />
                          </div>
                          <p className="text-lg font-bold text-indigo-600 mt-0.5">৳{p.price}</p>
                          {p.description && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleStatus(p.id, p.is_active, 'product')}
                            className={`p-2 rounded-lg transition-colors ${p.is_active ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-emerald-50 text-emerald-600'}`}>
                            {p.is_active ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </button>
                          <button onClick={() => setPanel({ mode: 'edit', type: 'product', item: p })}
                            className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors">
                            <FiEdit2 size={16} />
                          </button>
                          <button onClick={() => deleteItem(p.id, 'product')}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, label, sub, action, actionLabel }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-1">
      <Icon size={26} className="text-gray-400" />
    </div>
    <p className="font-semibold text-gray-800">{label}</p>
    <p className="text-sm text-gray-400 max-w-xs">{sub}</p>
    {action && (
      <button onClick={action}
        className="mt-2 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
        <FiPlus size={15} /> {actionLabel}
      </button>
    )}
  </div>
);

export default Products;