import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiSave,
  FiX,
  FiCheck,
  FiAlertTriangle,
  FiSearch,
  FiPackage,
  FiLayers,
  FiShoppingBag,
  FiEye,
  FiEyeOff,
  FiGrid,
  FiTag,
} from 'react-icons/fi';

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────
const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-white';

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const apiOriginFrom = (apiUrl) => {
  try {
    return new URL(apiUrl).origin;
  } catch {
    return '';
  }
};

const toImageUrl = (apiUrl, value) => {
  if (!value) return '';
  if (value instanceof File) return URL.createObjectURL(value);
  const url = String(value);
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
  const origin = apiOriginFrom(apiUrl);
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanUrl}`;
};

const appendValue = (formData, key, value) => {
  if (value === undefined || value === null || value === '') return;
  if (value instanceof File) {
    formData.append(key, value);
    return;
  }
  formData.append(key, String(value));
};

const buildFormData = (values) => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => appendValue(formData, key, value));
  return formData;
};

// ─────────────────────────────────────────────────────────────────────────────
// Toast system
// ─────────────────────────────────────────────────────────────────────────────
let addToastRef;

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  addToastRef = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <FiCheck size={15} /> : <FiAlertTriangle size={15} />}
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const toast = (message, type) => addToastRef?.(message, type);

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const Badge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      active
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
        : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
    <input
      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-white"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const EmptyState = ({ icon: Icon, label, sub, action, actionLabel }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-white rounded-2xl border border-gray-100">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-1">
      <Icon size={26} className="text-gray-400" />
    </div>
    <p className="font-semibold text-gray-800">{label}</p>
    <p className="text-sm text-gray-400 max-w-xs">{sub}</p>
    {action && (
      <button
        onClick={action}
        className="mt-2 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
      >
        <FiPlus size={15} /> {actionLabel}
      </button>
    )}
  </div>
);

const ImagePicker = ({ label, required, error, preview, onChange, helpText }) => (
  <Field label={label} required={required} error={error}>
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
      {preview ? (
        <div className="mb-3 h-44 rounded-xl overflow-hidden bg-white border border-gray-100">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="mb-3 h-44 rounded-xl bg-white border border-gray-100 flex flex-col items-center justify-center text-gray-400">
          <FiImage size={32} />
          <p className="text-xs mt-2">Upload image</p>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-sm file:font-medium hover:file:bg-indigo-700"
      />

      {helpText && <p className="text-xs text-gray-400 mt-2">{helpText}</p>}
    </div>
  </Field>
);

const Modal = ({ open, title, onClose, children, maxWidth = 'max-w-2xl' }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          className={`w-full ${maxWidth} max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500"
            >
              <FiX size={18} />
            </button>
          </div>
          <div className="overflow-y-auto p-6">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ConfirmDialog = ({ open, title, message, danger, onConfirm, onCancel }) => (
  <Modal open={open} title={title || 'Confirm'} onClose={onCancel} maxWidth="max-w-sm">
    <div className="text-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
          danger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
        }`}
      >
        <FiAlertTriangle size={22} />
      </div>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'
          }`}
        >
          Confirm
        </button>
      </div>
    </div>
  </Modal>
);

// ─────────────────────────────────────────────────────────────────────────────
// Forms
// ─────────────────────────────────────────────────────────────────────────────
const CategoryForm = ({ apiUrl, initial, onSave, onClose, loading }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    priority: initial?.priority ?? '',
    description: initial?.description || '',
    feature_label: initial?.feature_label || '',
    is_active: initial?.is_active ?? true,
    image: null,
    cover: null,
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(initial?.image ? toImageUrl(apiUrl, initial.image) : '');
  const [coverPreview, setCoverPreview] = useState(initial?.cover ? toImageUrl(apiUrl, initial.cover) : '');

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Category name is required';
    if (form.priority === '' || isNaN(form.priority)) e.priority = 'Valid priority number required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImage = (file, field) => {
    if (!file) return;
    setForm((prev) => ({ ...prev, [field]: file }));
    const previewUrl = URL.createObjectURL(file);
    if (field === 'image') setImagePreview(previewUrl);
    if (field === 'cover') setCoverPreview(previewUrl);
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      name: form.name,
      priority: parseInt(form.priority, 10),
      description: form.description,
      feature_label: form.feature_label,
      is_active: form.is_active,
      image: form.image,
      cover: form.cover,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <Field label="Category Name" required error={errors.name}>
        <input
          className={inputCls}
          value={form.name}
          placeholder="e.g. Frozen Snacks"
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
      </Field>

      <Field label="Priority" required error={errors.priority}>
        <input
          className={inputCls}
          type="number"
          value={form.priority}
          placeholder="e.g. 1"
          onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
        />
      </Field>

      <ImagePicker
        label="Category Image"
        preview={imagePreview}
        onChange={(file) => handleImage(file, 'image')}
        helpText={initial?.image && !form.image ? 'Existing image will stay unchanged unless you upload a new one.' : ''}
      />

      <ImagePicker
        label="Category Cover Image"
        preview={coverPreview}
        onChange={(file) => handleImage(file, 'cover')}
        helpText={initial?.cover && !form.cover ? 'Existing cover will stay unchanged unless you upload a new one.' : ''}
      />

      <Field label="Feature Label">
        <input
          className={inputCls}
          value={form.feature_label}
          placeholder="e.g. Popular, New, Featured"
          onChange={(e) => setForm((prev) => ({ ...prev, feature_label: e.target.value }))}
        />
      </Field>

      <Field label="Description">
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          value={form.description}
          placeholder="Optional category description"
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
      </Field>

      <ToggleRow
        title="Active status"
        subtitle="Visible to customers when active"
        active={form.is_active}
        onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
      />

      <FormActions onClose={onClose} onSubmit={submit} loading={loading} submitText={initial ? 'Save changes' : 'Add Category'} />
    </div>
  );
};

const SubCategoryForm = ({ initial, categories, onSave, onClose, loading }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    priority: initial?.priority ?? '',
    parent_category: initial?.parent_category || '',
    is_active: initial?.is_active ?? true,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Subcategory name is required';
    if (form.priority === '' || isNaN(form.priority)) e.priority = 'Valid priority number required';
    if (!form.parent_category) e.parent_category = 'Parent category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      name: form.name,
      priority: parseInt(form.priority, 10),
      parent_category: parseInt(form.parent_category, 10),
      is_active: form.is_active,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <Field label="Subcategory Name" required error={errors.name}>
        <input
          className={inputCls}
          value={form.name}
          placeholder="e.g. Dumplings"
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
      </Field>

      <Field label="Parent Category" required error={errors.parent_category}>
        <select
          className={inputCls}
          value={form.parent_category}
          onChange={(e) => setForm((prev) => ({ ...prev, parent_category: e.target.value }))}
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Priority" required error={errors.priority}>
        <input
          className={inputCls}
          type="number"
          value={form.priority}
          placeholder="e.g. 1"
          onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
        />
      </Field>

      <ToggleRow
        title="Active status"
        subtitle="Visible to customers when active"
        active={form.is_active}
        onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
      />

      <FormActions onClose={onClose} onSubmit={submit} loading={loading} submitText={initial ? 'Save changes' : 'Add Subcategory'} />
    </div>
  );
};

const ProductForm = ({ apiUrl, initial, categories, subcategories, onSave, onClose, loading }) => {
  const getInitialCategory = () => {
    const currentSubcategoryId = Number(initial?.sub_category || '');
    const subcategory = subcategories.find((item) => Number(item.id) === currentSubcategoryId);
    return subcategory?.parent_category || '';
  };

  const [form, setForm] = useState({
    title: initial?.title || '',
    category: getInitialCategory(),
    sub_category: initial?.sub_category || '',
    price: initial?.price ?? '',
    description: initial?.description || '',
    is_active: initial?.is_active ?? true,
    is_bestseller: initial?.is_bestseller ?? false,
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(initial?.image ? toImageUrl(apiUrl, initial.image) : '');

  const filteredSubcategories = useMemo(() => {
    if (!form.category) return subcategories;
    return subcategories.filter((item) => Number(item.parent_category) === Number(form.category));
  }, [form.category, subcategories]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Product name is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.sub_category) e.sub_category = 'Subcategory is required';
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!initial && !form.image) e.image = 'Product image is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImage = (file) => {
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      title: form.title,
      price: parseFloat(form.price),
      description: form.description,
      sub_category: parseInt(form.sub_category, 10),
      is_active: form.is_active,
      is_bestseller: form.is_bestseller,
      image: form.image,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <ImagePicker
        label="Product Image"
        required={!initial}
        error={errors.image}
        preview={imagePreview}
        onChange={handleImage}
        helpText={initial?.image && !form.image ? 'Existing image will stay unchanged unless you upload a new one.' : ''}
      />

      <Field label="Product Name" required error={errors.title}>
        <input
          className={inputCls}
          value={form.title}
          placeholder="e.g. Cheesy Dumplings"
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Category" required error={errors.category}>
          <select
            className={inputCls}
            value={form.category}
            onChange={(e) => {
              const nextCategory = e.target.value;
              setForm((prev) => ({ ...prev, category: nextCategory, sub_category: '' }));
            }}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Subcategory" required error={errors.sub_category}>
          <select
            className={inputCls}
            value={form.sub_category}
            onChange={(e) => setForm((prev) => ({ ...prev, sub_category: e.target.value }))}
            disabled={!form.category}
          >
            <option value="">{form.category ? 'Select subcategory' : 'Select category first'}</option>
            {filteredSubcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Price (৳)" required error={errors.price}>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">৳</span>
          <input
            className={`${inputCls} pl-8`}
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            placeholder="0.00"
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
          />
        </div>
      </Field>

      <Field label="Description" required error={errors.description}>
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          value={form.description}
          placeholder="Product description"
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
      </Field>

      <ToggleRow
        title="Active status"
        subtitle="Visible to customers when active"
        active={form.is_active}
        onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
      />

      <ToggleRow
        title="Bestseller"
        subtitle="Mark this product as bestseller"
        active={form.is_bestseller}
        onClick={() => setForm((prev) => ({ ...prev, is_bestseller: !prev.is_bestseller }))}
      />

      <FormActions onClose={onClose} onSubmit={submit} loading={loading} submitText={initial ? 'Save changes' : 'Create Product'} />
    </div>
  );
};

const ToggleRow = ({ title, subtitle, active, onClick }) => (
  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
    <div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

const FormActions = ({ onClose, onSubmit, loading, submitText }) => (
  <div className="flex gap-3 pt-2">
    <button
      onClick={onClose}
      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
    >
      Cancel
    </button>
    <button
      onClick={onSubmit}
      disabled={loading}
      className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
    >
      {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <FiSave size={15} />}
      {submitText}
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Rows / cards
// ─────────────────────────────────────────────────────────────────────────────
const CategoryRow = ({ apiUrl, category, onEdit, onDelete, onToggle }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all overflow-hidden"
  >
    <div className="flex items-center gap-4 p-4">
      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 relative">
        {category.image ? (
          <img src={toImageUrl(apiUrl, category.image)} alt={category.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FiImage size={22} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
          <Badge active={category.is_active} />
          {category.feature_label && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">{category.feature_label}</span>}
        </div>
        <p className="text-xs text-gray-400 mt-1">Priority {category.priority}</p>
        {category.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{category.description}</p>}
      </div>
      <Actions item={category} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
    </div>
  </motion.div>
);

const SubCategoryRow = ({ subcategory, categories, onEdit, onDelete, onToggle }) => {
  const parent = categories.find((item) => Number(item.id) === Number(subcategory.parent_category));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all overflow-hidden"
    >
      <div className="flex items-center gap-4 p-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-500">
          <FiLayers size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{subcategory.name}</h3>
            <Badge active={subcategory.is_active} />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Parent: {parent?.name || 'Unknown'} · Priority {subcategory.priority}
          </p>
        </div>
        <Actions item={subcategory} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
      </div>
    </motion.div>
  );
};

const ProductCard = ({ apiUrl, product, categories, subcategories, onEdit, onDelete, onToggle }) => {
  const subcategory = subcategories.find((item) => Number(item.id) === Number(product.sub_category));
  const category = categories.find((item) => Number(item.id) === Number(subcategory?.parent_category));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="relative h-44 bg-gray-50">
        {product.image ? (
          <img src={toImageUrl(apiUrl, product.image)} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FiImage size={30} />
          </div>
        )}
        {!product.is_active && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">INACTIVE</div>}
        <div className="absolute top-3 right-3">
          <Badge active={product.is_active} />
        </div>
        {product.is_bestseller && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center gap-1">
            <FiTag size={12} /> Bestseller
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 leading-snug line-clamp-1">{product.title}</h3>
        <p className="text-xl font-bold text-indigo-600 mt-1">৳{product.price}</p>
        <p className="text-xs text-gray-400 mt-1">
          {category?.name || 'No category'} / {subcategory?.name || 'No subcategory'}
        </p>
        {product.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors"
          >
            <FiEdit2 size={13} /> Edit
          </button>
          <button
            onClick={() => onToggle(product.id, product.is_active)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              product.is_active ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
            }`}
          >
            {product.is_active ? <FiEyeOff size={13} /> : <FiEye size={13} />}
            {product.is_active ? 'Hide' : 'Show'}
          </button>
          <button onClick={() => onDelete(product.id)} className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Actions = ({ item, onEdit, onDelete, onToggle }) => (
  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
    <button
      onClick={() => onToggle(item.id, item.is_active)}
      title={item.is_active ? 'Deactivate' : 'Activate'}
      className={`p-2 rounded-lg transition-colors text-sm ${
        item.is_active ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-emerald-50 text-emerald-600'
      }`}
    >
      {item.is_active ? <FiEyeOff size={16} /> : <FiEye size={16} />}
    </button>
    <button onClick={() => onEdit(item)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors">
      <FiEdit2 size={16} />
    </button>
    <button onClick={() => onDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
      <FiTrash2 size={16} />
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
const tabs = [
  { key: 'categories', label: 'Categories', icon: FiPackage },
  { key: 'subcategories', label: 'Subcategories', icon: FiLayers },
  { key: 'products', label: 'Products', icon: FiShoppingBag },
];

const Products = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState('products');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');

  const [panel, setPanel] = useState(null); // { mode, type, item }
  const [confirm, setConfirm] = useState(null);

  const loadAll = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const [categoryRes, subcategoryRes, productRes] = await Promise.all([
        fetch(`${apiUrl}/categories/`),
        fetch(`${apiUrl}/subcategories/`),
        fetch(`${apiUrl}/products/`),
      ]);

      if (!categoryRes.ok) throw new Error('Failed to load categories');
      if (!subcategoryRes.ok) throw new Error('Failed to load subcategories');
      if (!productRes.ok) throw new Error('Failed to load products');

      const [categoryData, subcategoryData, productData] = await Promise.all([
        categoryRes.json(),
        subcategoryRes.json(),
        productRes.json(),
      ]);

      setCategories(normalizeList(categoryData).sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0)));
      setSubcategories(normalizeList(subcategoryData).sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0)));
      setProducts(normalizeList(productData));
    } catch (error) {
      toast(error.message || 'Failed to load data', 'error');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    setSearch('');
    setCategoryFilter('');
    setSubcategoryFilter('');
  }, [tab]);

  const filteredSubcategoriesForFilter = useMemo(() => {
    if (!categoryFilter) return subcategories;
    return subcategories.filter((item) => Number(item.parent_category) === Number(categoryFilter));
  }, [categoryFilter, subcategories]);

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter((item) => item.name?.toLowerCase().includes(q));
  }, [categories, search]);

  const filteredSubcategories = useMemo(() => {
    const q = search.toLowerCase();
    return subcategories.filter((item) => {
      const parentMatches = categoryFilter ? Number(item.parent_category) === Number(categoryFilter) : true;
      const textMatches = item.name?.toLowerCase().includes(q);
      return parentMatches && textMatches;
    });
  }, [subcategories, search, categoryFilter]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();

    return products.filter((product) => {
      const subcategory = subcategories.find((item) => Number(item.id) === Number(product.sub_category));
      const productCategoryId = subcategory?.parent_category;

      const textMatches =
        product.title?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q) ||
        subcategory?.name?.toLowerCase().includes(q);

      const categoryMatches = categoryFilter ? Number(productCategoryId) === Number(categoryFilter) : true;
      const subcategoryMatches = subcategoryFilter ? Number(product.sub_category) === Number(subcategoryFilter) : true;

      return textMatches && categoryMatches && subcategoryMatches;
    });
  }, [products, subcategories, search, categoryFilter, subcategoryFilter]);

  const getPanelTitle = () => {
    if (!panel) return '';
    const action = panel.mode === 'edit' ? 'Edit' : 'Add';
    if (panel.type === 'category') return `${action} Category`;
    if (panel.type === 'subcategory') return `${action} Subcategory`;
    return panel.mode === 'edit' ? 'Edit Product' : 'Create Product';
  };

  const openAdd = () => {
    if (tab === 'categories') setPanel({ mode: 'add', type: 'category' });
    if (tab === 'subcategories') setPanel({ mode: 'add', type: 'subcategory' });
    if (tab === 'products') setPanel({ mode: 'add', type: 'product' });
  };

  const addLabel = tab === 'categories' ? 'Add Category' : tab === 'subcategories' ? 'Add Subcategory' : 'Create Product';

  const saveItem = async (values) => {
    const { mode, type, item } = panel;
    setSaving(true);

    try {
      let endpoint = '';
      let method = mode === 'edit' ? 'PATCH' : 'POST';

      if (type === 'category') endpoint = mode === 'edit' ? `${apiUrl}/categories/${item.id}/` : `${apiUrl}/categories/`;
      if (type === 'subcategory') endpoint = mode === 'edit' ? `${apiUrl}/subcategories/${item.id}` : `${apiUrl}/subcategories/`;
      if (type === 'product') endpoint = mode === 'edit' ? `${apiUrl}/products/${item.id}/` : `${apiUrl}/products/`;

      // Use FormData for every create/update so image uploads work correctly.
      // Do not manually set Content-Type. Browser will set multipart boundary.
      const formData = buildFormData(values);

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Save failed');
      }

      await loadAll(false);
      setPanel(null);
      toast(mode === 'edit' ? 'Changes saved!' : `${type === 'product' ? 'Product' : type === 'category' ? 'Category' : 'Subcategory'} created!`);
    } catch (error) {
      toast(error.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus, type) => {
    try {
      const endpoint =
        type === 'category'
          ? `${apiUrl}/categories/${id}/`
          : type === 'subcategory'
          ? `${apiUrl}/subcategories/${id}`
          : `${apiUrl}/products/${id}/`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) throw new Error('Status update failed');

      if (type === 'category') {
        setCategories((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: !currentStatus } : item)));
      } else if (type === 'subcategory') {
        setSubcategories((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: !currentStatus } : item)));
      } else {
        setProducts((prev) => prev.map((item) => (item.id === id ? { ...item, is_active: !currentStatus } : item)));
      }

      toast(currentStatus ? 'Deactivated successfully' : 'Activated successfully');
    } catch (error) {
      toast(error.message || 'Failed to update status', 'error');
    }
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
            type === 'category'
              ? `${apiUrl}/categories/${id}/`
              : type === 'subcategory'
              ? `${apiUrl}/subcategories/${id}`
              : `${apiUrl}/products/${id}/`;

          const response = await fetch(endpoint, { method: 'DELETE' });
          if (!response.ok && response.status !== 204) throw new Error('Delete failed');

          if (type === 'category') setCategories((prev) => prev.filter((item) => item.id !== id));
          if (type === 'subcategory') setSubcategories((prev) => prev.filter((item) => item.id !== id));
          if (type === 'product') setProducts((prev) => prev.filter((item) => item.id !== id));

          toast(`${type === 'product' ? 'Product' : type === 'category' ? 'Category' : 'Subcategory'} deleted`);
        } catch (error) {
          toast(error.message || 'Delete failed', 'error');
        }
      },
    });
  };

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

      <Modal open={!!panel} title={getPanelTitle()} onClose={() => setPanel(null)} maxWidth={panel?.type === 'product' ? 'max-w-3xl' : 'max-w-2xl'}>
        {panel?.type === 'category' && (
          <CategoryForm apiUrl={apiUrl} initial={panel.item} onSave={saveItem} onClose={() => setPanel(null)} loading={saving} />
        )}

        {panel?.type === 'subcategory' && (
          <SubCategoryForm initial={panel.item} categories={categories} onSave={saveItem} onClose={() => setPanel(null)} loading={saving} />
        )}

        {panel?.type === 'product' && (
          <ProductForm
            apiUrl={apiUrl}
            initial={panel.item}
            categories={categories}
            subcategories={subcategories}
            onSave={saveItem}
            onClose={() => setPanel(null)}
            loading={saving}
          />
        )}
      </Modal>

      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
            <div>
              <h1 className="font-bold text-gray-900 text-xl tracking-tight">Product Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage products, categories, subcategories, images, prices, and visibility from one place.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={openAdd}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-indigo-200"
            >
              <FiPlus size={16} />
              {addLabel}
            </motion.button>
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                  tab === key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                <Icon size={15} />
                {label}
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                    tab === key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {key === 'categories' ? categories.length : key === 'subcategories' ? subcategories.length : products.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
          <div className="md:col-span-6">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={
                tab === 'categories'
                  ? 'Search categories...'
                  : tab === 'subcategories'
                  ? 'Search subcategories...'
                  : 'Search products by name, description, or subcategory...'
              }
            />
          </div>

          {(tab === 'subcategories' || tab === 'products') && (
            <div className="md:col-span-3">
              <select
                className={inputCls}
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setSubcategoryFilter('');
                }}
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tab === 'products' && (
            <div className="md:col-span-3">
              <select className={inputCls} value={subcategoryFilter} onChange={(e) => setSubcategoryFilter(e.target.value)}>
                <option value="">All subcategories</option>
                {filteredSubcategoriesForFilter.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {tab === 'products' && (
          <div className="mb-5 rounded-2xl bg-indigo-50 border border-indigo-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-indigo-900">Create products directly</h2>
              <p className="text-xs text-indigo-700 mt-1">
                Click Create Product, choose category and subcategory inside the modal, then upload the product image.
              </p>
            </div>
            <button
              onClick={() => setPanel({ mode: 'add', type: 'product' })}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
            >
              <FiPlus size={15} /> Create Product
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
            {tab === 'categories' &&
              (filteredCategories.length === 0 ? (
                <EmptyState
                  icon={FiPackage}
                  label="No categories found"
                  sub="Create categories with image and cover before adding products."
                  action={() => setPanel({ mode: 'add', type: 'category' })}
                  actionLabel="Add Category"
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredCategories.map((category) => (
                    <CategoryRow
                      key={category.id}
                      apiUrl={apiUrl}
                      category={category}
                      onEdit={(item) => setPanel({ mode: 'edit', type: 'category', item })}
                      onDelete={(id) => deleteItem(id, 'category')}
                      onToggle={(id, status) => toggleStatus(id, status, 'category')}
                    />
                  ))}
                </div>
              ))}

            {tab === 'subcategories' &&
              (filteredSubcategories.length === 0 ? (
                <EmptyState
                  icon={FiLayers}
                  label="No subcategories found"
                  sub="Create subcategories under a parent category. No image is used for subcategories."
                  action={() => setPanel({ mode: 'add', type: 'subcategory' })}
                  actionLabel="Add Subcategory"
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredSubcategories.map((subcategory) => (
                    <SubCategoryRow
                      key={subcategory.id}
                      subcategory={subcategory}
                      categories={categories}
                      onEdit={(item) => setPanel({ mode: 'edit', type: 'subcategory', item })}
                      onDelete={(id) => deleteItem(id, 'subcategory')}
                      onToggle={(id, status) => toggleStatus(id, status, 'subcategory')}
                    />
                  ))}
                </div>
              ))}

            {tab === 'products' &&
              (filteredProducts.length === 0 ? (
                <EmptyState
                  icon={FiShoppingBag}
                  label="No products found"
                  sub="Create a product directly from this tab. The modal includes category, subcategory, and image upload."
                  action={() => setPanel({ mode: 'add', type: 'product' })}
                  actionLabel="Create Product"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      apiUrl={apiUrl}
                      product={product}
                      categories={categories}
                      subcategories={subcategories}
                      onEdit={(item) => setPanel({ mode: 'edit', type: 'product', item })}
                      onDelete={(id) => deleteItem(id, 'product')}
                      onToggle={(id, status) => toggleStatus(id, status, 'product')}
                    />
                  ))}
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
