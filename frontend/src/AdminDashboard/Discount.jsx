import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiTrash2, FiTag, FiX,
  FiSearch, FiRefreshCw, FiEdit2, FiChevronLeft, FiChevronRight,
  FiChevronDown, FiCheck
} from 'react-icons/fi';
import Swal from 'sweetalert2';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const isActive   = (d) => { const n = new Date(); return new Date(d.start_date) <= n && new Date(d.end_date) >= n; };
const isExpired  = (d) => new Date(d.end_date) < new Date();
const isUpcoming = (d) => new Date(d.start_date) > new Date();

const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const StatusBadge = ({ discount }) => {
  if (isActive(discount))
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 bg-emerald-50 text-emerald-700 ring-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active</span>;
  if (isExpired(discount))
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 bg-red-50 text-red-700 ring-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Expired</span>;
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 bg-amber-50 text-amber-700 ring-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Upcoming</span>;
};

const Pagination = ({ total, page, perPage, onChange }) => {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  const visible = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) visible.push(i);
    else if (visible[visible.length - 1] !== '...') visible.push('...');
  }
  return (
    <div className="flex items-center gap-1.5 justify-center py-4">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="w-8 h-8 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors">
        <FiChevronLeft size={13} />
      </button>
      {visible.map((v, i) => v === '...'
        ? <span key={`e${i}`} className="text-gray-300 px-1 text-sm">…</span>
        : <button key={v} onClick={() => onChange(v)}
            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${page === v ? 'bg-gray-900 text-white border border-gray-900' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
            {v}
          </button>
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === Math.ceil(total / perPage)}
        className="w-8 h-8 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors">
        <FiChevronRight size={13} />
      </button>
      <span className="text-gray-400 text-xs ml-2">{total} total</span>
    </div>
  );
};

// ─── Scope Selector ───────────────────────────────────────────────────────────

const SCOPE_TABS = [
  { key: 'products',      label: 'Products' },
  { key: 'subcategories', label: 'Subcategories' },
  { key: 'categories',    label: 'Categories' },
];

const ScopeSelector = ({ apiUrl, value, onChange }) => {
  const [open, setOpen]       = useState(false);
  const [activeTab, setTab]   = useState('products');
  const [search, setSearch]   = useState('');
  const [options, setOptions] = useState({ products: [], subcategories: [], categories: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      fetch(`${apiUrl}/products/?is_active=true`).then(r => r.json()),
      fetch(`${apiUrl}/subcategories/`).then(r => r.json()),
      fetch(`${apiUrl}/categories/`).then(r => r.json()),
    ]).then(([products, subcategories, categories]) => {
      setOptions({
        products:      Array.isArray(products)      ? products      : (products.results      ?? []),
        subcategories: Array.isArray(subcategories) ? subcategories : (subcategories.results ?? []),
        categories:    Array.isArray(categories)    ? categories    : (categories.results    ?? []),
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [open, apiUrl]);

  const totalSelected = (value.products?.length ?? 0) + (value.subcategories?.length ?? 0) + (value.categories?.length ?? 0);

  // When a category is toggled ON, also auto-select all its products
  const toggleCategory = (catId, isRemoving) => {
    const currentCats = value.categories ?? [];
    const nextCats = isRemoving
      ? currentCats.filter(x => x !== catId)
      : [...currentCats, catId];

    // Find all subcategories that belong to this category
    const relatedSubcatIds = options.subcategories
      .filter(sc => sc.parent_category === catId)
      .map(sc => sc.id);

    // Find all products that belong to those subcategories
    const relatedProductIds = options.products
      .filter(p => relatedSubcatIds.includes(p.sub_category))
      .map(p => p.id);

    let nextProducts = [...(value.products ?? [])];
    if (isRemoving) {
      // Remove auto-selected products (only remove ones that came from this category)
      nextProducts = nextProducts.filter(id => !relatedProductIds.includes(id));
    } else {
      // Add related products, avoid duplicates
      relatedProductIds.forEach(id => {
        if (!nextProducts.includes(id)) nextProducts.push(id);
      });
    }

    onChange({ ...value, categories: nextCats, products: nextProducts });
  };

  // When a subcategory is toggled ON, auto-select its products too
  const toggleSubcategory = (subcatId, isRemoving) => {
    const currentSubcats = value.subcategories ?? [];
    const nextSubcats = isRemoving
      ? currentSubcats.filter(x => x !== subcatId)
      : [...currentSubcats, subcatId];

    const relatedProductIds = options.products
      .filter(p => p.sub_category === subcatId)
      .map(p => p.id);

    let nextProducts = [...(value.products ?? [])];
    if (isRemoving) {
      nextProducts = nextProducts.filter(id => !relatedProductIds.includes(id));
    } else {
      relatedProductIds.forEach(id => {
        if (!nextProducts.includes(id)) nextProducts.push(id);
      });
    }

    onChange({ ...value, subcategories: nextSubcats, products: nextProducts });
  };

  const toggle = (tab, id) => {
    const current = value[tab] ?? [];
    const isRemoving = current.includes(id);

    if (tab === 'categories')    return toggleCategory(id, isRemoving);
    if (tab === 'subcategories') return toggleSubcategory(id, isRemoving);

    // Plain product toggle
    const next = isRemoving ? current.filter(x => x !== id) : [...current, id];
    onChange({ ...value, [tab]: next });
  };

  // Select All / Deselect All for the active tab
  const toggleSelectAll = () => {
    const nameKey = activeTab === 'products' ? 'title' : 'name';
    const visibleIds = options[activeTab]
      .filter(item => (item[nameKey] ?? '').toLowerCase().includes(search.toLowerCase()))
      .map(item => item.id);

    const currentSelected = value[activeTab] ?? [];
    const allVisible = visibleIds.every(id => currentSelected.includes(id));

    if (allVisible) {
      // Deselect all visible
      if (activeTab === 'categories') {
        visibleIds.forEach(id => toggleCategory(id, true));
        return;
      }
      if (activeTab === 'subcategories') {
        visibleIds.forEach(id => toggleSubcategory(id, true));
        return;
      }
      onChange({ ...value, [activeTab]: currentSelected.filter(id => !visibleIds.includes(id)) });
    } else {
      // Select all visible
      if (activeTab === 'categories') {
        visibleIds.filter(id => !currentSelected.includes(id)).forEach(id => toggleCategory(id, false));
        return;
      }
      if (activeTab === 'subcategories') {
        visibleIds.filter(id => !currentSelected.includes(id)).forEach(id => toggleSubcategory(id, false));
        return;
      }
      const merged = [...currentSelected];
      visibleIds.forEach(id => { if (!merged.includes(id)) merged.push(id); });
      onChange({ ...value, [activeTab]: merged });
    }
  };

  const removeChip = (tab, id) => toggle(tab, id);

  const nameKey = activeTab === 'products' ? 'title' : 'name';
  const displayed = (options[activeTab] ?? []).filter(item =>
    (item[nameKey] ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const visibleIds = displayed.map(i => i.id);
  const currentSelected = value[activeTab] ?? [];
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => currentSelected.includes(id));
  const someVisibleSelected = visibleIds.some(id => currentSelected.includes(id));

  const chips = SCOPE_TABS.flatMap(({ key }) =>
    (value[key] ?? []).map(id => {
      const nk = key === 'products' ? 'title' : 'name';
      const item = (options[key] ?? []).find(o => o.id === id);
      return item ? { tab: key, id, label: item[nk] } : null;
    }).filter(Boolean)
  );

  const scopeHint = totalSelected === 0
    ? 'All products (no restriction)'
    : chips.slice(0, 2).map(c => c.label).join(', ') + (chips.length > 2 ? ` +${chips.length - 2} more` : '');

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
      {/* Header row */}
      <button type="button"
        onClick={() => { setOpen(o => !o); setSearch(''); setTab('products'); }}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Apply Discount To</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{scopeHint}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {totalSelected > 0 && (
            <span className="text-xs font-bold bg-gray-900 text-white rounded-full px-2 py-0.5">{totalSelected}</span>
          )}
          <FiChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
            className="overflow-hidden">
            <div className="p-3 border-t border-gray-100">

              {/* Tabs */}
              <div className="flex gap-1.5 mb-3">
                {SCOPE_TABS.map(({ key, label }) => {
                  const count = value[key]?.length ?? 0;
                  return (
                    <button key={key} type="button"
                      onClick={() => { setTab(key); setSearch(''); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        activeTab === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {label}
                      {count > 0 && (
                        <span className={`text-xs rounded-full px-1.5 font-bold ${activeTab === key ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Search + Select All row */}
              <div className="flex gap-2 mb-2 items-center">
                <div className="relative flex-1">
                  <FiSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={`Search ${activeTab}…`}
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:outline-gray-900 focus:outline-2" />
                </div>
                {/* Select All checkbox button */}
                {!loading && displayed.length > 0 && (
                  <button type="button" onClick={toggleSelectAll}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-semibold transition-colors flex-shrink-0 ${
                      allVisibleSelected
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : someVisibleSelected
                        ? 'bg-gray-100 border-gray-300 text-gray-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}>
                    <span className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center flex-shrink-0 ${
                      allVisibleSelected ? 'bg-white border-white' : someVisibleSelected ? 'bg-gray-400 border-gray-400' : 'border-gray-400'
                    }`}>
                      {allVisibleSelected && <FiCheck size={9} className="text-gray-900" strokeWidth={3} />}
                      {someVisibleSelected && !allVisibleSelected && <span className="w-1.5 h-0.5 bg-white rounded block" />}
                    </span>
                    All
                  </button>
                )}
              </div>

              {/* Option list */}
              <div className="max-h-44 overflow-y-auto flex flex-col gap-0.5 pr-0.5">
                {loading ? (
                  <p className="text-center text-xs text-gray-400 py-6">Loading…</p>
                ) : displayed.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-6">No {activeTab} found</p>
                ) : displayed.map(item => {
                  const nk = activeTab === 'products' ? 'title' : 'name';
                  const isSelected = (value[activeTab] ?? []).includes(item.id);

                  // Show auto-selected indicator: product was pulled in by a category/subcat
                  const isAutoSelected = activeTab === 'products' && (() => {
                    const parentSubcat = options.subcategories.find(sc => sc.id === item.sub_category);
                    if (!parentSubcat) return false;
                    return (value.subcategories ?? []).includes(parentSubcat.id) ||
                           (value.categories ?? []).includes(parentSubcat.parent_category);
                  })();

                  return (
                    <button key={item.id} type="button"
                      onClick={() => toggle(activeTab, item.id)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors w-full ${
                        isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'
                      }`}>
                      <span className={`w-4 h-4 rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-300'
                      }`}>
                        {isSelected && <FiCheck size={10} className="text-white" strokeWidth={3} />}
                      </span>
                      <span className="text-xs text-gray-800 font-medium flex-1 truncate">{item[nk]}</span>
                      {isAutoSelected && (
                        <span className="text-xs text-indigo-500 font-semibold flex-shrink-0">auto</span>
                      )}
                      {activeTab === 'products' && item.price != null && (
                        <span className="text-xs text-gray-400 flex-shrink-0">৳{item.price}</span>
                      )}
                      {activeTab === 'subcategories' && item.parent_category_name && (
                        <span className="text-xs text-gray-400 flex-shrink-0">{item.parent_category_name}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Chips */}
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                  {chips.map(c => (
                    <span key={`${c.tab}-${c.id}`}
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                      {c.label}
                      <button type="button" onClick={() => removeChip(c.tab, c.id)}
                        className="text-gray-400 hover:text-gray-900 transition-colors">
                        <FiX size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-2.5 pt-2 border-t border-gray-100">
                Selecting a category or subcategory auto-selects its products. Leaving all empty applies to every product.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Empty form state ─────────────────────────────────────────────────────────

const emptyForm = {
  name: '', code: '', amount: '', is_percentage: true,
  start_date: '', end_date: '', is_auto_apply: false,
  // scope
  products: [], subcategories: [], categories: [],
};

// ─── Main component ───────────────────────────────────────────────────────────

const Discount = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [page, setPage]           = useState(1);
  const PER_PAGE = 8;

  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${apiUrl}/discounts/`);
      const d = await r.json();
      setDiscounts(Array.isArray(d) ? d.sort((a, b) => b.id - a.id) : []);
    } catch { Swal.fire('Error', 'Failed to load discounts', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDiscounts(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return discounts.filter(d => {
      const matchSearch = d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q);
      const matchFilter =
        filter === 'all'      ? true :
        filter === 'active'   ? isActive(d) :
        filter === 'upcoming' ? isUpcoming(d) :
        isExpired(d);
      return matchSearch && matchFilter;
    });
  }, [discounts, search, filter]);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(() => ({
    total:    discounts.length,
    active:   discounts.filter(isActive).length,
    upcoming: discounts.filter(isUpcoming).length,
    expired:  discounts.filter(isExpired).length,
  }), [discounts]);

const toDateInput = (iso) => {
  if (!iso) return '';
  const dt = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');

  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

const dateToISOWithAutoTime = (dateValue, type) => {
  if (!dateValue) return null;

  const [year, month, day] = dateValue.split('-').map(Number);

  const dt = type === 'start'
    ? new Date(year, month - 1, day, 0, 0, 0, 0)
    : new Date(year, month - 1, day, 23, 59, 59, 999);

  return dt.toISOString();
};

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditTarget(d);
    setForm({
      name:          d.name,
      code:          d.code || '',
      amount:        d.amount,
      is_percentage: d.is_percentage,
      is_auto_apply: d.is_auto_apply || false,
      start_date:    toDateInput(d.start_date),
end_date:      toDateInput(d.end_date),
      // Scope — backend returns arrays of IDs or objects; normalise to ID arrays
      products:      (d.products      ?? []).map(x => typeof x === 'object' ? x.id : x),
      subcategories: (d.subcategories ?? []).map(x => typeof x === 'object' ? x.id : x),
      categories:    (d.categories    ?? []).map(x => typeof x === 'object' ? x.id : x),
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditTarget(null); setForm(emptyForm); };

  const handleSubmit = async () => {
    if (!form.name || !form.amount || !form.start_date || !form.end_date)
      return Swal.fire('Missing fields', 'Please fill in name, amount, and dates.', 'warning');

    setSaving(true);
    try {
      const body = {
        name:          form.name,
        code:          form.code || null,
        amount:        parseFloat(form.amount),
        is_percentage: form.is_percentage,
        is_auto_apply: form.is_auto_apply,
      start_date:    dateToISOWithAutoTime(form.start_date, 'start'),
end_date:      dateToISOWithAutoTime(form.end_date, 'end'),
        // Send scope as ID arrays — backend ManyToMany expects this
        products:      form.products,
        subcategories: form.subcategories,
        categories:    form.categories,
      };

      const url    = editTarget ? `${apiUrl}/discounts/${editTarget.id}/` : `${apiUrl}/discounts/`;
      const method = editTarget ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      const saved = await res.json();

      if (editTarget) {
        setDiscounts(prev => prev.map(d => d.id === saved.id ? saved : d));
        Swal.fire({ icon: 'success', title: 'Updated!', toast: true, position: 'top-end', showConfirmButton: false, timer: 1800 });
      } else {
        setDiscounts(prev => [saved, ...prev]);
        Swal.fire({ icon: 'success', title: 'Discount created!', toast: true, position: 'top-end', showConfirmButton: false, timer: 1800 });
      }
      closeModal();
    } catch { Swal.fire('Error', 'Failed to save discount', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    const ok = await Swal.fire({
      title: 'Delete discount?', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete',
    });
    if (!ok.isConfirmed) return;
    try {
      await fetch(`${apiUrl}/discounts/${id}/`, { method: 'DELETE' });
      setDiscounts(prev => prev.filter(d => d.id !== id));
      Swal.fire({ icon: 'success', title: 'Deleted', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch { Swal.fire('Error', 'Failed to delete', 'error'); }
  };

  // Scope summary shown on each discount card
  const scopeSummary = (d) => {
    const parts = [];
    if (d.products?.length)      parts.push(`${d.products.length} product${d.products.length > 1 ? 's' : ''}`);
    if (d.subcategories?.length) parts.push(`${d.subcategories.length} subcat${d.subcategories.length > 1 ? 's' : ''}`);
    if (d.categories?.length)    parts.push(`${d.categories.length} categor${d.categories.length > 1 ? 'ies' : 'y'}`);
    return parts.length ? parts.join(', ') : 'All products';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, body, .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
        input:focus, select:focus { outline: 2px solid #111 !important; outline-offset: 1px; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 py-7">

        {/* Header */}
        <div className="flex justify-between items-end flex-wrap gap-3 mb-7">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Discounts</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage promo codes and automatic discounts</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
            <FiPlus size={14} /> New Discount
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total',    value: stats.total,    color: 'text-gray-900' },
            { label: 'Active',   value: stats.active,   color: 'text-emerald-600' },
            { label: 'Upcoming', value: stats.upcoming, color: 'text-amber-600' },
            { label: 'Expired',  value: stats.expired,  color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-2xl px-4 py-3 mb-4 shadow-sm border border-gray-100 flex gap-2.5 flex-wrap items-center">
          <div className="flex-1 min-w-44 relative">
            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name or code…"
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
          </div>
          <div className="flex gap-1.5">
            {['all','active','upcoming','expired'].map(f => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                  filter === f ? 'bg-gray-900 text-white' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={fetchDiscounts}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            <FiRefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-9 h-9 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading discounts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <FiTag size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="font-bold text-gray-600 text-base">No discounts found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || filter !== 'all' ? 'Try adjusting your filters.' : 'Create your first discount to get started.'}
            </p>
            {!search && filter === 'all' && (
              <button onClick={openAdd}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors mx-auto">
                <FiPlus size={13} /> New Discount
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {paged.map((d) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="border-b border-gray-50 last:border-0 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4 flex-wrap">

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive(d) ? 'bg-emerald-50 text-emerald-600' :
                      isExpired(d) ? 'bg-red-50 text-red-400' : 'bg-amber-50 text-amber-500'
                    }`}>
                      <FiTag size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-black text-sm text-gray-900">{d.name}</span>
                        <StatusBadge discount={d} />
                        {d.is_auto_apply && (
                          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                            Auto-apply
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {d.code ? (
                          <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold tracking-wider">
                            {d.code}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No code</span>
                        )}
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-xs text-gray-500">{fmtDate(d.start_date)} → {fmtDate(d.end_date)}</span>
                        <span className="text-gray-300 text-xs">·</span>
                        {/* Scope pill */}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          (!d.products?.length && !d.subcategories?.length && !d.categories?.length)
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {scopeSummary(d)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className={`text-xl font-black ${d.is_percentage ? 'text-indigo-600' : 'text-emerald-600'}`}>
                        {d.is_percentage ? `${d.amount}%` : `৳${d.amount}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{d.is_percentage ? 'percentage off' : 'flat discount'}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => openEdit(d)}
                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                        <FiEdit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(d.id)}
                        className="w-8 h-8 rounded-lg border border-red-100 bg-white hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors">
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <Pagination total={filtered.length} page={page} perPage={PER_PAGE}
              onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-black text-lg text-gray-900">{editTarget ? 'Edit Discount' : 'New Discount'}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{editTarget ? 'Update discount details' : 'Create a promo code or auto-discount'}</p>
                </div>
                <button onClick={closeModal}
                  className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                  <FiX size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-4">

                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Discount Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Summer Sale 20%"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                </div>

                {/* Amount + Type */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Discount Value *</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                        {form.is_percentage ? '%' : '৳'}
                      </span>
                      <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                        placeholder="0" min="0" step="0.01"
                        className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                    </div>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                      <button type="button" onClick={() => setForm(p => ({ ...p, is_percentage: true }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${form.is_percentage ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>%</button>
                      <button type="button" onClick={() => setForm(p => ({ ...p, is_percentage: false }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${!form.is_percentage ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>৳</button>
                    </div>
                  </div>
                </div>

                {/* Code */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                    Promo Code 
                  </label>
                  <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SUMMER20"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono tracking-wider focus:outline-none" />
                </div>

               {/* Dates */}
<div className="grid grid-cols-2 gap-3">
  <div>
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
      Start Date *
    </label>
    <input
      type="date"
      value={form.start_date}
      onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
    />
    <p className="text-[11px] text-gray-400 mt-1">
      Starts automatically at 12:00 AM
    </p>
  </div>

  <div>
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
      End Date *
    </label>
    <input
      type="date"
      value={form.end_date}
      onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
    />
    <p className="text-[11px] text-gray-400 mt-1">
      Ends automatically at 11:59 PM
    </p>
  </div>
</div>

                {/* ── SCOPE SELECTOR ── */}
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Scope</label>
                  <ScopeSelector
                    apiUrl={apiUrl}
                    value={{ products: form.products, subcategories: form.subcategories, categories: form.categories }}
                    onChange={scope => setForm(p => ({ ...p, ...scope }))}
                  />
                </div>

                {/* Auto-apply toggle */}
                <div
                  onClick={() => setForm(p => ({ ...p, is_auto_apply: !p.is_auto_apply }))}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    form.is_auto_apply ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Auto-apply</p>
                    <p className="text-xs text-gray-400 mt-0.5">Apply automatically without a code</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.is_auto_apply ? 'bg-gray-900' : 'bg-gray-200'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_auto_apply ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>

                {/* Submit */}
                <button onClick={handleSubmit} disabled={saving}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1">
                  {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Discount'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discount;