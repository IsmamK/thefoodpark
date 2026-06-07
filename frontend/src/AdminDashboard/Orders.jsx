import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiRefreshCw, FiChevronDown, FiChevronUp, FiPackage,
  FiCheckCircle, FiTruck, FiShoppingBag, FiXCircle,
  FiCopy, FiEdit2, FiCheck, FiDollarSign,
  FiBarChart2, FiTrendingUp, FiUser, FiPlus, FiMinus,
  FiTrash2, FiTag, FiCalendar, FiClock, FiPhone,
  FiArrowRight, FiSearch, FiFilter, FiChevronLeft,
  FiChevronRight, FiX, FiAlertCircle, FiPieChart,
  FiActivity, FiZap, FiRepeat,FiDownload
} from 'react-icons/fi';
import { downloadFinanceReport } from './FinanceReport';

import Swal from 'sweetalert2';



// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n || 0);

const fmtShort = (n) => {
  if (n >= 1000000) return `৳${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `৳${(n / 1000).toFixed(1)}K`;
  return `৳${Math.round(n || 0)}`;
};

const STATUS_META = {
  placed:    { label: 'Placed',      dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
  checkout:  { label: 'Checked Out', dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 ring-blue-200' },
  shipped:   { label: 'Shipped',     dot: 'bg-indigo-500',  badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  delivered: { label: 'Delivered',   dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  cancelled: { label: 'Cancelled',   dot: 'bg-red-500',     badge: 'bg-red-50 text-red-700 ring-red-200' },
};

const EXPENSE_CATS = [
  { id: 'raw_materials', label: 'Raw Materials', color: 'text-amber-600', bg: 'bg-amber-50', icon: '🥩' },
  { id: 'chef_salary',   label: "Chef's Salary", color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '👨‍🍳' },
  { id: 'ads',           label: 'Ad Spend',      color: 'text-blue-600', bg: 'bg-blue-50', icon: '📣' },
  { id: 'miscellaneous', label: 'Miscellaneous', color: 'text-violet-600', bg: 'bg-violet-50', icon: '📦' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const STATUS_TABS = [
  { id: 'placed',    label: 'Placed',      activeClass: 'border-amber-400 bg-amber-50 text-amber-700' },
  { id: 'checkout',  label: 'Checked Out', activeClass: 'border-blue-500 bg-blue-50 text-blue-700' },
  { id: 'shipped',   label: 'Shipped',     activeClass: 'border-indigo-500 bg-indigo-50 text-indigo-700' },
  { id: 'delivered', label: 'Delivered',   activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { id: 'cancelled', label: 'Cancelled',   activeClass: 'border-red-500 bg-red-50 text-red-700' },
];

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const m = STATUS_META[status] || { label: status, dot: 'bg-gray-400', badge: 'bg-gray-50 text-gray-600 ring-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${m.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, colorClass, icon }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <p className={`text-2xl font-black tracking-tight ${colorClass}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${colorClass} bg-current/10`}>
        <span className="opacity-100">{icon}</span>
      </div>
    </div>
  </div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ total, page, perPage, onChange }) => {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  const visible = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) visible.push(i);
    else if (visible[visible.length - 1] !== '...') visible.push('...');
  }
  return (
    <div className="flex items-center gap-1.5 justify-center py-4 flex-wrap">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="w-8 h-8 rounded-lg border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors">
        <FiChevronLeft size={13} />
      </button>
      {visible.map((v, i) => v === '...'
        ? <span key={`e${i}`} className="text-gray-300 px-1 text-sm">…</span>
        : <button key={v} onClick={() => onChange(v)}
            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${page === v ? 'bg-gray-900 text-white border border-gray-900' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
            {v}
          </button>
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === pages}
        className="w-8 h-8 rounded-lg border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors">
        <FiChevronRight size={13} />
      </button>
      <span className="text-gray-400 text-xs ml-2">{total} total</span>
    </div>
  );
};

// ─── Customer History Modal ───────────────────────────────────────────────────
const CustomerHistoryModal = ({ phone, name, onClose, apiUrl }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetch(`${apiUrl}/customer-history/?phone=${phone}`)
      .then(r => r.json())
      .then(d => { setHistory(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [phone]);

  const deliveredOrders = useMemo(() => history?.orders.filter(o => o.status === 'delivered') || [], [history]);
  const cancelledOrders = useMemo(() => history?.orders.filter(o => o.status === 'cancelled') || [], [history]);
  const activeOrders = useMemo(() => history?.orders.filter(o => !['delivered','cancelled'].includes(o.status)) || [], [history]);

  const totalSpent = useMemo(() => deliveredOrders.reduce((s, o) => s + parseFloat(o.grandtotal || 0), 0), [deliveredOrders]);

  const itemSummary = useMemo(() => {
    const map = {};
    deliveredOrders.forEach(o => {
      (o.order_items || []).forEach(it => {
        const n = (it.product_name?.trim()) ? it.product_name : `Product #${it.product}`;
        if (!map[n]) map[n] = { qty: 0, val: 0 };
        map[n].qty += it.quantity;
        map[n].val += (parseFloat(it.price) || 0) * it.quantity;
      });
    });
    return Object.entries(map).sort((a, b) => b[1].qty - a[1].qty);
  }, [deliveredOrders]);

  const OrderGroup = ({ title, orders, dotClass, emptyMsg }) => {
    if (orders.length === 0) return null;
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</p>
          <span className="text-xs text-gray-300 font-medium">({orders.length})</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {orders.map(o => {
            const isExp = expandedOrder === o.id;
            return (
              <div key={o.id} className="border border-gray-100 rounded-xl overflow-hidden">
                <div
                  className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedOrder(isExp ? null : o.id)}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button className="w-6 h-6 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-400 flex-shrink-0">
                      {isExp ? <FiChevronUp size={11} /> : <FiChevronDown size={11} />}
                    </button>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900">Order #{o.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(o.order_time).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <Badge status={o.status} />
                    <span className="font-black text-sm text-gray-900 whitespace-nowrap">{fmt(o.grandtotal)}</span>
                  </div>
                </div>
                <AnimatePresence>
                  {isExp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
                        {(o.order_items && o.order_items.length > 0) ? (
                          <div className="flex flex-col gap-1.5 mb-3">
                            {o.order_items.map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {it.quantity}
                                  </span>
                                  <span className="text-sm text-gray-800 truncate">{it.product_name || `Product #${it.product}`}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-700 ml-2 flex-shrink-0">{fmt((parseFloat(it.price) || 0) * it.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mb-3">No item details available</p>
                        )}
                        <div className="bg-white rounded-lg p-3 flex flex-col gap-1.5 border border-gray-100">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Order Value</span>
                            <span className="font-semibold text-gray-700">{fmt(o.grandtotal)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Delivery Charge</span>
                            <span className="font-semibold text-gray-700">{fmt(100)}</span>
                          </div>
                          <div className="flex justify-between text-xs font-black text-gray-900 border-t border-gray-100 pt-1.5 mt-0.5">
                            <span>Total Bill</span>
                            <span>{fmt(parseFloat(o.grandtotal || 0))}</span>
                          </div>
                        </div>
                        {o.shipping_address && (
                          <p className="text-xs text-gray-400 mt-2.5 flex items-start gap-1.5">
                            <span className="flex-shrink-0 mt-0.5">📍</span>
                            {o.shipping_address}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="min-w-0 flex-1 mr-3">
            <h3 className="font-black text-lg text-gray-900 truncate">{name}</h3>
            <p className="text-gray-500 text-sm mt-0.5">{phone}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors flex-shrink-0">
            <FiX size={14} />
          </button>
        </div>

        <div className="px-5 sm:px-7 py-5 flex flex-col gap-5">
          {loading ? (
            <div className="text-center py-10 text-gray-400">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3" />
              Loading history…
            </div>
          ) : !history ? (
            <div className="text-center py-10 text-red-500">Failed to load</div>
          ) : (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-emerald-50 rounded-xl p-2.5 sm:p-3 text-center">
                  <p className="text-xl sm:text-2xl font-black text-emerald-600">{deliveredOrders.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Delivered</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-2.5 sm:p-3 text-center">
                  <p className="text-lg sm:text-xl font-black text-blue-600">{fmtShort(totalSpent)}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Spent</p>
                </div>
                <div className="bg-violet-50 rounded-xl p-2.5 sm:p-3 text-center">
                  <p className="text-lg sm:text-xl font-black text-violet-600">
                    {fmtShort(deliveredOrders.length > 0 ? totalSpent / deliveredOrders.length : 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Avg Order</p>
                </div>
              </div>

              {/* Status pills */}
              {history.count > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {[
                    { status: 'placed',    label: 'Placed',      count: history.orders.filter(o=>o.status==='placed').length,    dot:'bg-amber-400' },
                    { status: 'checkout',  label: 'Checked Out', count: history.orders.filter(o=>o.status==='checkout').length,  dot:'bg-blue-500' },
                    { status: 'shipped',   label: 'Shipped',     count: history.orders.filter(o=>o.status==='shipped').length,   dot:'bg-indigo-500' },
                    { status: 'delivered', label: 'Delivered',   count: history.orders.filter(o=>o.status==='delivered').length, dot:'bg-emerald-500' },
                    { status: 'cancelled', label: 'Cancelled',   count: history.orders.filter(o=>o.status==='cancelled').length, dot:'bg-red-400' },
                  ].filter(s => s.count > 0).map(s => (
                    <div key={s.status} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      <span className="text-xs text-gray-600 font-semibold">{s.label}</span>
                      <span className="text-xs font-black text-gray-900">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Item Summary */}
              {itemSummary.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                    📦 Items Ordered <span className="normal-case font-normal text-gray-300">(delivered only)</span>
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {itemSummary.map(([itemName, d], idx) => (
                      <div key={itemName} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${idx === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-gray-800 truncate pr-2">{itemName}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0">{fmt(d.val)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                                style={{ width: `${(d.qty / itemSummary[0][1].qty) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-indigo-600 flex-shrink-0 w-8 text-right">×{d.qty}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                    <span className="text-xs font-bold text-gray-500">Revenue from delivered orders</span>
                    <span className="text-xs font-black text-emerald-600">{fmt(totalSpent)}</span>
                  </div>
                </div>
              )}

              {/* Order History */}
              <div className="flex flex-col gap-5">
                <OrderGroup title="Active Orders" orders={activeOrders} dotClass="bg-blue-500" />
                <OrderGroup title="Delivered" orders={deliveredOrders} dotClass="bg-emerald-500" />
                <OrderGroup title="Cancelled" orders={cancelledOrders} dotClass="bg-red-400" />
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Add Expense Modal ────────────────────────────────────────────────────────
const AddExpenseModal = ({ onClose, onSave, apiUrl }) => {
  const [form, setForm] = useState({ category: 'raw_materials', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.amount || !form.date) return Swal.fire('Error', 'Fill in amount and date', 'error');
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/expenses/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) })
      });
      if (res.ok) { onSave(); onClose(); }
      else throw new Error();
    } catch { Swal.fire('Error', 'Failed to save expense', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-7 w-full sm:max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-lg text-gray-900">Log Expense</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
            <FiX size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-800">
              {EXPENSE_CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Amount (BDT)</label>
            <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
              Description <span className="text-gray-400 normal-case font-normal">(optional)</span>
            </label>
            <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="e.g. Chicken for this week"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <button onClick={submit} disabled={saving}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1">
            {saving ? 'Saving…' : 'Log Expense'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Expense Rows (inline editable) ──────────────────────────────────────────
const ExpenseRows = ({ expenses, apiUrl, onSave }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const startEdit = (e) => {
    setEditingId(e.id);
    setEditForm({ category: e.category, amount: e.amount, description: e.description || '', date: e.date });
  };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/expenses/${editingId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, amount: parseFloat(editForm.amount) }),
      });
      if (res.ok) { onSave(); cancelEdit(); }
      else throw new Error();
    } catch { Swal.fire('Error', 'Failed to update expense', 'error'); }
    finally { setSaving(false); }
  };

  const deleteExpense = async (id) => {
    const ok = await Swal.fire({ title: 'Delete expense?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' });
    if (!ok.isConfirmed) return;
    try {
      await fetch(`${apiUrl}/expenses/${id}/`, { method: 'DELETE' });
      onSave();
    } catch { Swal.fire('Error', 'Failed to delete', 'error'); }
  };

  return expenses.map(e => {
    const cat = EXPENSE_CATS.find(c => c.id === e.category) || {};
    const isEditing = editingId === e.id;

    if (isEditing) {
      return (
        <tr key={e.id} className="border-b border-gray-100 bg-blue-50/30">
          <td className="px-2 sm:px-3 py-2">
            <input
              type="date"
              value={editForm.date}
              onChange={ev => setEditForm(p => ({ ...p, date: ev.target.value }))}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            />
          </td>
          <td className="px-2 sm:px-3 py-2">
            <select
              value={editForm.category}
              onChange={ev => setEditForm(p => ({ ...p, category: ev.target.value }))}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              {EXPENSE_CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </td>
          <td className="px-2 sm:px-3 py-2 hidden sm:table-cell">
            <input
              type="text"
              value={editForm.description}
              onChange={ev => setEditForm(p => ({ ...p, description: ev.target.value }))}
              placeholder="Description"
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </td>
          <td className="px-2 sm:px-3 py-2">
            <input
              type="number"
              value={editForm.amount}
              onChange={ev => setEditForm(p => ({ ...p, amount: ev.target.value }))}
              className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-right focus:outline-none focus:ring-2 focus:ring-gray-900 ml-auto block"
            />
          </td>
          <td className="px-2 sm:px-3 py-2">
            <div className="flex items-center gap-1 justify-end">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-2 py-1 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving ? '…' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
        <td className="px-2 sm:px-3 py-3 text-xs sm:text-sm text-gray-500 whitespace-nowrap">{new Date(e.date).toLocaleDateString()}</td>
        <td className="px-2 sm:px-3 py-3">
          <span className={`inline-flex items-center gap-1 ${cat.bg} ${cat.color} px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap`}>
            {cat.icon} <span className="hidden sm:inline">{cat.label}</span>
          </span>
        </td>
        <td className="px-2 sm:px-3 py-3 text-xs sm:text-sm text-gray-600 hidden sm:table-cell max-w-[120px] truncate">{e.description || <span className="text-gray-300">—</span>}</td>
        <td className="px-2 sm:px-3 py-3 text-right font-bold text-xs sm:text-sm text-red-500 whitespace-nowrap">-{fmt(e.amount)}</td>
        <td className="px-2 sm:px-3 py-3">
          <div className="flex items-center gap-1 justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => startEdit(e)}
              className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
            >
              <FiEdit2 size={11} />
            </button>
            <button
              onClick={() => deleteExpense(e.id)}
              className="w-7 h-7 rounded-lg border border-red-100 bg-white hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
            >
              <FiTrash2 size={11} />
            </button>
          </div>
        </td>
      </tr>
    );
  });
};


// ─── Top Customers Tab ────────────────────────────────────────────────────────
const TopCustomers = ({ apiUrl }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerModal, setCustomerModal] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    const fetchTopCustomers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/orders/?status=delivered`);
        const data = await res.json();

        const withItems = await Promise.all(
          data.map(async (order) => {
            const ir = await fetch(`${apiUrl}/order-items/?order=${order.id}`);
            const items = await ir.json();
            return { ...order, order_items: items };
          })
        );

        const map = {};
        withItems.forEach(order => {
          const phone = order.phone_number;
          if (!map[phone]) {
            map[phone] = {
              phone,
              name: order.name,
              address: order.shipping_address,
              orders: [],
              totalSpent: 0,
              itemMap: {},
            };
          }
          map[phone].totalSpent += parseFloat(order.grandtotal || 0);
          map[phone].orders.push(order);
          (order.order_items || []).forEach(it => {
            const n = it.product_name?.trim() || `Product #${it.product}`;
            if (!map[phone].itemMap[n]) map[phone].itemMap[n] = { qty: 0, val: 0 };
            map[phone].itemMap[n].qty += it.quantity;
            map[phone].itemMap[n].val += (parseFloat(it.price) || 0) * it.quantity;
          });
        });

        const sorted = Object.values(map)
          .map(c => ({
            ...c,
            orderCount: c.orders.length,
            avgOrder: c.totalSpent / c.orders.length,
            topItems: Object.entries(c.itemMap).sort((a, b) => b[1].qty - a[1].qty).slice(0, 3),
          }))
          .sort((a, b) => b.totalSpent - a.totalSpent);

        setCustomers(sorted);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchTopCustomers();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  if (loading) return (
    <div className="text-center py-16 text-gray-400">
      <div className="w-9 h-9 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3" />
      Loading customers…
    </div>
  );

  if (customers.length === 0) return (
    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400">
      <FiUser size={28} className="mx-auto mb-2 opacity-30" />
      <p className="text-sm">No delivered orders yet</p>
    </div>
  );

  const maxSpent = customers[0]?.totalSpent || 1;
  const pagedCustomers = customers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <div className="space-y-5">
        {/* Top 3 podium */}
        {customers.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {customers.slice(0, 3).map((c, i) => (
              <div
                key={c.phone}
                onClick={() => setCustomerModal({ phone: c.phone, name: c.name })}
                className={`bg-white rounded-2xl p-3 sm:p-5 shadow-sm border cursor-pointer transition-all duration-150 hover:shadow-md hover:border-gray-300 border-gray-100
                  ${i === 0 ? 'border-t-4 border-t-amber-400' : i === 1 ? 'border-t-4 border-t-gray-400' : 'border-t-4 border-t-amber-700'}`}
              >
                <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{medals[i]}</div>
                <p className="font-black text-xs sm:text-sm text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate hidden sm:block">{c.phone}</p>
                <p className="text-base sm:text-xl font-black text-emerald-600 mt-1 sm:mt-3">{fmtShort(c.totalSpent)}</p>
                <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{c.orderCount} orders · avg {fmtShort(c.avgOrder)}</p>
                <p className="text-xs text-gray-400 mt-0.5 sm:hidden">{c.orderCount} orders</p>
                {c.topItems[0] && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-50 hidden sm:block">
                    <p className="text-xs text-gray-400 truncate">⭐ {c.topItems[0][0]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Full leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-black text-gray-900">All Customers</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">{customers.length} customers</span>
          </div>
          <div className="divide-y divide-gray-50">
            {pagedCustomers.map((c, i) => {
              const globalRank = (page - 1) * PER_PAGE + i;
              return (
                <div
                  key={c.phone}
                  onClick={() => setCustomerModal({ phone: c.phone, name: c.name })}
                  className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 cursor-pointer transition-colors hover:bg-gray-50/70"
                >
                  {/* Rank */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    globalRank === 0 ? 'bg-amber-100 text-amber-700' :
                    globalRank === 1 ? 'bg-gray-100 text-gray-600' :
                    globalRank === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {globalRank + 1}
                  </div>

                  {/* Name + phone */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-sm text-gray-900 truncate">{c.name}</p>
                      {c.orderCount >= 5 && (
                        <span className="bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2 py-0.5 rounded-full text-xs font-bold">VIP</span>
                      )}
                      {c.orderCount >= 3 && c.orderCount < 5 && (
                        <span className="bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 px-2 py-0.5 rounded-full text-xs font-bold">Loyal</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <p className="text-xs text-gray-400">{c.phone}</p>
                      {c.topItems[0] && (
                        <>
                          <span className="text-gray-200 hidden sm:inline">·</span>
                          <p className="text-xs text-gray-400 truncate hidden sm:block">Fav: {c.topItems[0][0]}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Spend bar - desktop only */}
                  <div className="w-16 sm:w-24 hidden sm:block">
                    <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(c.totalSpent / maxSpent) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-sm text-emerald-600">{fmtShort(c.totalSpent)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.orderCount} orders</p>
                  </div>

                  <FiChevronRight size={13} className="text-gray-300 flex-shrink-0 hidden sm:block" />
                </div>
              );
            })}
          </div>

          <div className="px-4 sm:px-6 border-t border-gray-100">
            <Pagination
              total={customers.length}
              page={page}
              perPage={PER_PAGE}
              onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          </div>
        </div>
      </div>

      {customerModal && (
        <CustomerHistoryModal
          phone={customerModal.phone}
          name={customerModal.name}
          apiUrl={apiUrl}
          onClose={() => setCustomerModal(null)}
        />
      )}
    </>
  );
};

// ─── Finance Tab ──────────────────────────────────────────────────────────────
const FinanceTab = ({ apiUrl }) => {
  const now = new Date();
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [expenses, setExpenses] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expPage, setExpPage] = useState(1);

  const isCurrentMonth = selYear === now.getFullYear() && selMonth === now.getMonth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, ordRes] = await Promise.all([
        fetch(`${apiUrl}/expenses/?year=${selYear}&month=${selMonth + 1}`),
        fetch(`${apiUrl}/orders/?status=delivered`)
      ]);
      const [expData, ordData] = await Promise.all([expRes.json(), ordRes.json()]);
      setExpenses(Array.isArray(expData) ? expData : []);
      const filtered = (Array.isArray(ordData) ? ordData : []).filter(o => {
        const d = new Date(o.order_time);
        const inMonth = d.getFullYear() === selYear && d.getMonth() === selMonth;
        if (!isCurrentMonth) return inMonth;
        return inMonth && d <= now;
      });
      setDeliveredOrders(filtered);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [selYear, selMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const metrics = useMemo(() => {
    const sales = deliveredOrders.reduce((s, o) => s + parseFloat(o.grandtotal || 0) - 100, 0);
    const rawMat = expenses.filter(e => e.category === 'raw_materials').reduce((s, e) => s + parseFloat(e.amount), 0);
    const adSpend = expenses.filter(e => e.category === 'ads').reduce((s, e) => s + parseFloat(e.amount), 0);
    const chefSalary = expenses.filter(e => e.category === 'chef_salary').reduce((s, e) => s + parseFloat(e.amount), 0);
    const misc = expenses.filter(e => e.category === 'miscellaneous').reduce((s, e) => s + parseFloat(e.amount), 0);
    const totalExpenses = rawMat + adSpend + chefSalary + misc;
    const grossProfit1 = sales - rawMat;
    const grossProfit2 = sales - rawMat - adSpend;
    const netProfit = sales - totalExpenses;
    return {
      sales, rawMat, adSpend, chefSalary, misc, totalExpenses,
      grossProfit1, grossProfit2, netProfit,
      gpm1: sales > 0 ? (grossProfit1 / sales) * 100 : 0,
      gpm2: sales > 0 ? (grossProfit2 / sales) * 100 : 0,
      npm: sales > 0 ? (netProfit / sales) * 100 : 0,
      roas: adSpend > 0 ? sales / adSpend : 0,
      ordCount: deliveredOrders.length,
      aov: deliveredOrders.length > 0 ? sales / deliveredOrders.length : 0,
    };
  }, [deliveredOrders, expenses]);

  const years = [now.getFullYear() - 1, now.getFullYear()];
  const pagedExpenses = expenses.slice((expPage - 1) * 8, expPage * 8);

  const MetricRow = ({ label, value, pct, positive, bold }) => (
    <div className={`flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 ${bold ? 'mt-1' : ''}`}>
      <span className={`text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{label}</span>
      <div className="text-right flex-shrink-0 ml-2">
        <span className={`font-${bold ? 'black' : 'semibold'} text-${bold ? 'base' : 'sm'} ${positive === true ? 'text-emerald-600' : positive === false ? 'text-red-500' : 'text-gray-900'}`}>
          {fmt(value)}
        </span>
        {pct !== undefined && <span className="text-xs text-gray-400 ml-1.5">({pct.toFixed(1)}%)</span>}
      </div>
    </div>
  );

  const generatePDFReport = () => {
    const monthLabel = `${MONTHS[selMonth]} ${selYear}`;
    const mtd = isCurrentMonth ? ' (Month-to-Date)' : '';
    const generatedOn = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const fmtBDT = (n) => `৳${Math.round(n || 0).toLocaleString('en-BD')}`;
    const pctStr = (n) => `${(n || 0).toFixed(1)}%`;

    const itemMap = {};
    deliveredOrders.forEach(o => {
      (o.order_items || []).forEach(it => {
        const name = it.product_name?.trim() || `Product #${it.product}`;
        if (!itemMap[name]) itemMap[name] = { qty: 0, revenue: 0 };
        itemMap[name].qty += it.quantity;
        itemMap[name].revenue += (parseFloat(it.price) || 0) * it.quantity;
      });
    });
    const topItems = Object.entries(itemMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8);

    const custMap = {};
    deliveredOrders.forEach(o => {
      const key = o.phone_number;
      if (!custMap[key]) custMap[key] = { name: o.name, phone: o.phone_number, orders: 0, revenue: 0 };
      custMap[key].orders += 1;
      custMap[key].revenue += parseFloat(o.grandtotal || 0) - 100;
    });
    const topCustomers = Object.values(custMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

    const maxItemRev = topItems[0]?.[1].revenue || 1;
    const maxCustRev = topCustomers[0]?.revenue || 1;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>FoodPark — ${monthLabel} Financial Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fff; color: #111827; font-size: 11px; line-height: 1.5; }
    .cover { background: #111827; color: #fff; padding: 36px 48px 28px; display: flex; justify-content: space-between; align-items: flex-end; }
    .cover-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .cover-logo-icon { width: 36px; height: 36px; background: #fff; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .cover-logo-name { font-size: 15px; font-weight: 800; color: #fff; }
    .cover-title { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
    .cover-sub { font-size: 13px; color: #9ca3af; margin-top: 4px; }
    .cover-meta { text-align: right; }
    .cover-meta-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; }
    .cover-meta-val { font-size: 11px; color: #d1d5db; margin-top: 2px; }
    .body { padding: 32px 48px 40px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #9ca3af; border-bottom: 1px solid #f3f4f6; padding-bottom: 6px; margin-bottom: 14px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .kpi { border: 1px solid #f3f4f6; border-radius: 10px; padding: 13px 14px; position: relative; overflow: hidden; }
    .kpi::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; }
    .kpi.green::before { background: #10b981; }
    .kpi.blue::before { background: #3b82f6; }
    .kpi.indigo::before { background: #6366f1; }
    .kpi.red::before { background: #ef4444; }
    .kpi-label { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 5px; }
    .kpi-value { font-size: 19px; font-weight: 900; color: #111827; line-height: 1; }
    .kpi-value.profit { color: #059669; }
    .kpi-value.loss { color: #ef4444; }
    .kpi-sub { font-size: 9px; color: #9ca3af; margin-top: 3px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .card { border: 1px solid #f3f4f6; border-radius: 10px; padding: 16px 18px; }
    .card-title { font-size: 12px; font-weight: 800; color: #111827; margin-bottom: 12px; }
    .pl-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #f9fafb; font-size: 11px; }
    .pl-row:last-child { border-bottom: none; }
    .pl-row.total { border-top: 1.5px solid #e5e7eb; border-bottom: none; margin-top: 4px; padding-top: 7px; font-weight: 800; }
    .pl-row.sub { padding-left: 10px; color: #6b7280; }
    .pl-section { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #d1d5db; padding: 8px 0 3px; }
    .green { color: #059669; }
    .red { color: #ef4444; }
    .muted { color: #9ca3af; }
    .margin-row { margin-bottom: 8px; }
    .margin-header { display: flex; justify-content: space-between; font-size: 10px; color: #6b7280; margin-bottom: 3px; }
    .bar-track { background: #f3f4f6; border-radius: 99px; height: 5px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 99px; }
    .ad-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
    .ad-cell { border-radius: 7px; padding: 9px 10px; text-align: center; }
    .ad-val { font-size: 14px; font-weight: 900; }
    .ad-lbl { font-size: 9px; color: #6b7280; margin-top: 1px; }
    .ad-note { font-size: 9px; color: #6b7280; background: #f9fafb; border-radius: 6px; padding: 5px 8px; text-align: center; }
    table { width: 100%; border-collapse: collapse; }
    thead th { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #9ca3af; padding: 0 8px 7px; text-align: left; border-bottom: 1.5px solid #f3f4f6; }
    thead th.right { text-align: right; }
    tbody td { padding: 6px 8px; font-size: 10.5px; color: #374151; border-bottom: 1px solid #f9fafb; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    tbody td.right { text-align: right; }
    tbody td.red { color: #ef4444; font-weight: 700; text-align: right; }
    tbody td.muted { color: #9ca3af; }
    .rank-num { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; font-size: 9px; font-weight: 800; background: #f3f4f6; color: #6b7280; flex-shrink: 0; }
    .rank-num.gold { background: #fef3c7; color: #d97706; }
    .rank-num.silver { background: #f3f4f6; color: #6b7280; }
    .rank-num.bronze { background: #fef3c7; color: #b45309; }
    .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
    .bar-row:last-child { margin-bottom: 0; }
    .bar-label { flex: 1; font-size: 10px; color: #374151; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar-val { font-size: 10px; font-weight: 800; color: #111827; flex-shrink: 0; width: 80px; text-align: right; }
    .bar-sub { font-size: 9px; color: #9ca3af; }
    .bar-wrap { flex: 1.5; }
    .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; font-size: 9px; color: #d1d5db; }
    @page { size: A4; margin: 0; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="cover">
    <div>
      <div class="cover-logo">
        <div class="cover-logo-icon">🛍️</div>
        <span class="cover-logo-name">FoodPark</span>
      </div>
      <div class="cover-title">Financial Report</div>
      <div class="cover-sub">${monthLabel}${mtd}</div>
    </div>
    <div class="cover-meta">
      <div class="cover-meta-label">Generated on</div>
      <div class="cover-meta-val">${generatedOn}</div>
      <div style="margin-top:10px">
        <div class="cover-meta-label">Period</div>
        <div class="cover-meta-val">${monthLabel}${mtd}</div>
      </div>
      <div style="margin-top:10px">
        <div class="cover-meta-label">Delivered Orders</div>
        <div class="cover-meta-val">${metrics.ordCount} orders</div>
      </div>
    </div>
  </div>
  <div class="body">
    <div class="section">
      <div class="section-title">Performance Overview</div>
      <div class="kpi-grid">
        <div class="kpi green"><div class="kpi-label">Total Sales</div><div class="kpi-value">${fmtBDT(metrics.sales)}</div><div class="kpi-sub">${metrics.ordCount} delivered orders</div></div>
        <div class="kpi blue"><div class="kpi-label">Gross Profit I</div><div class="kpi-value">${fmtBDT(metrics.grossProfit1)}</div><div class="kpi-sub">After raw materials · ${pctStr(metrics.gpm1)}</div></div>
        <div class="kpi indigo"><div class="kpi-label">Gross Profit II</div><div class="kpi-value">${fmtBDT(metrics.grossProfit2)}</div><div class="kpi-sub">After raw mat + ads · ${pctStr(metrics.gpm2)}</div></div>
        <div class="kpi ${metrics.netProfit >= 0 ? 'green' : 'red'}"><div class="kpi-label">Net Profit</div><div class="kpi-value ${metrics.netProfit >= 0 ? 'profit' : 'loss'}">${fmtBDT(metrics.netProfit)}</div><div class="kpi-sub">Net margin · ${pctStr(metrics.npm)}</div></div>
      </div>
    </div>
    <div class="section two-col">
      <div class="card">
        <div class="card-title">📊 P&L Breakdown</div>
        <div class="pl-row"><span style="font-weight:700">Total Sales</span><span class="green" style="font-weight:800">${fmtBDT(metrics.sales)}</span></div>
        <div class="pl-section">Cost of Goods</div>
        <div class="pl-row sub"><span>🥩 Raw Materials</span><span class="red">−${fmtBDT(metrics.rawMat)}</span></div>
        <div class="pl-row sub" style="border-bottom:none;padding-bottom:0"><span style="font-weight:700">Gross Profit I</span><span style="font-weight:800;color:${metrics.grossProfit1 >= 0 ? '#059669' : '#ef4444'}">${fmtBDT(metrics.grossProfit1)} <span style="font-size:9px;color:#9ca3af">(${pctStr(metrics.gpm1)})</span></span></div>
        <div class="pl-section">Operating Expenses</div>
        <div class="pl-row sub"><span>📣 Ad Spend</span><span class="red">−${fmtBDT(metrics.adSpend)}</span></div>
        <div class="pl-row sub" style="border-bottom:none;padding-bottom:0"><span style="font-weight:700">Gross Profit II</span><span style="font-weight:800;color:${metrics.grossProfit2 >= 0 ? '#059669' : '#ef4444'}">${fmtBDT(metrics.grossProfit2)} <span style="font-size:9px;color:#9ca3af">(${pctStr(metrics.gpm2)})</span></span></div>
        <div class="pl-section">Other Expenses</div>
        <div class="pl-row sub"><span>👨‍🍳 Chef Salary</span><span class="red">−${fmtBDT(metrics.chefSalary)}</span></div>
        <div class="pl-row sub"><span>📦 Miscellaneous</span><span class="red">−${fmtBDT(metrics.misc)}</span></div>
        <div class="pl-row total"><span>Net Profit</span><span style="color:${metrics.netProfit >= 0 ? '#059669' : '#ef4444'}">${fmtBDT(metrics.netProfit)} <span style="font-size:9px;color:#9ca3af">(${pctStr(metrics.npm)})</span></span></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="card">
          <div class="card-title">📣 Ad Performance</div>
          <div class="ad-grid">
            <div class="ad-cell" style="background:#eff6ff"><div class="ad-val" style="color:#2563eb">${metrics.roas.toFixed(1)}x</div><div class="ad-lbl">ROAS</div></div>
            <div class="ad-cell" style="background:#fffbeb"><div class="ad-val" style="color:#d97706">${fmtBDT(metrics.adSpend)}</div><div class="ad-lbl">Ad Spend</div></div>
            <div class="ad-cell" style="background:#ecfdf5"><div class="ad-val" style="color:#059669">${fmtBDT(metrics.sales)}</div><div class="ad-lbl">Revenue</div></div>
            <div class="ad-cell" style="background:#f5f3ff"><div class="ad-val" style="color:#7c3aed">${fmtBDT(metrics.aov)}</div><div class="ad-lbl">Avg Order Value</div></div>
          </div>
          ${metrics.adSpend > 0 ? `<div class="ad-note">Every ৳1 on ads → <strong style="color:#111827">৳${metrics.roas.toFixed(2)}</strong> in revenue</div>` : ''}
        </div>
        <div class="card" style="flex:1">
          <div class="card-title">📐 Margin Overview</div>
          ${[
            { label: 'Gross Margin I', pct: metrics.gpm1, color: '#3b82f6' },
            { label: 'Gross Margin II', pct: metrics.gpm2, color: '#6366f1' },
            { label: 'Net Margin', pct: metrics.npm, color: metrics.npm >= 0 ? '#10b981' : '#ef4444' },
          ].map(m => `<div class="margin-row"><div class="margin-header"><span>${m.label}</span><span style="font-weight:800;color:${m.pct >= 0 ? '#374151' : '#ef4444'}">${pctStr(m.pct)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0, Math.min(100, m.pct))}%;background:${m.color}"></div></div></div>`).join('')}
        </div>
      </div>
    </div>
    <div class="section two-col">
      <div class="card">
        <div class="card-title">🏆 Top Items by Revenue</div>
        ${topItems.length === 0 ? `<p class="muted" style="font-size:10px;text-align:center;padding:12px 0">No item data for this period</p>` : topItems.map(([name, d], i) => `<div class="bar-row"><span class="rank-num ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${i+1}</span><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span class="bar-label">${name}</span><span class="bar-val">${fmtBDT(d.revenue)}</span></div><div class="bar-track bar-wrap"><div class="bar-fill" style="width:${((d.revenue/maxItemRev)*100).toFixed(1)}%;background:#6366f1"></div></div></div><span class="bar-sub" style="width:30px;text-align:right">×${d.qty}</span></div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title">👥 Top Customers by Revenue</div>
        ${topCustomers.length === 0 ? `<p class="muted" style="font-size:10px;text-align:center;padding:12px 0">No customer data for this period</p>` : topCustomers.map((c, i) => `<div class="bar-row"><span class="rank-num ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${i+1}</span><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span class="bar-label">${c.name}</span><span class="bar-val">${fmtBDT(c.revenue)}</span></div><div class="bar-track"><div class="bar-fill" style="width:${((c.revenue/maxCustRev)*100).toFixed(1)}%;background:#10b981"></div></div></div><span class="bar-sub" style="width:40px;text-align:right">${c.orders} ord</span></div>`).join('')}
      </div>
    </div>
    ${expenses.length > 0 ? `<div class="section"><div class="section-title">Expense Log — ${expenses.length} entries · Total ${fmtBDT(metrics.totalExpenses)}</div><div class="card" style="padding:0;overflow:hidden"><table><thead><tr><th style="padding-left:16px">Date</th><th>Category</th><th>Description</th><th class="right" style="padding-right:16px">Amount</th></tr></thead><tbody>${expenses.map((e, idx) => { const cat = EXPENSE_CATS.find(c => c.id === e.category) || { label: e.category, icon: '' }; return `<tr style="${idx % 2 === 0 ? '' : 'background:#fafafa'}"><td style="padding-left:16px;color:#9ca3af">${new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</td><td>${cat.icon} ${cat.label}</td><td class="muted">${e.description || '—'}</td><td class="red" style="padding-right:16px">−${fmtBDT(e.amount)}</td></tr>`; }).join('')}</tbody></table></div></div>` : ''}
    <div class="footer"><span>FoodPark Admin Panel · Confidential</span><span>${monthLabel}${mtd} · Generated ${generatedOn}</span></div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return Swal.fire('Blocked', 'Allow popups to generate the PDF', 'warning');
    win.document.write(html);
    win.document.close();
    win.onload = () => { setTimeout(() => win.print(), 300); };
  };

  return (
    <div className="space-y-5">
      {/* Period Selector */}
      <div className="bg-white rounded-2xl px-4 sm:px-5 py-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <FiCalendar size={15} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-700">Period</span>
            <select value={selMonth} onChange={e => setSelMonth(+e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={selYear} onChange={e => setSelYear(+e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {isCurrentMonth && (
              <span className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                MTD
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadFinanceReport({ metrics, expenses, deliveredOrders, selMonth, selYear, isCurrentMonth })}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              <FiDownload size={13} /> <span className="hidden sm:inline">Export</span> PDF
            </button>
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              <FiPlus size={13} /> <span className="hidden sm:inline">Log</span> Expense
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-9 h-9 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3" />
          Loading financials…
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Sales</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{fmtShort(metrics.sales)}</p>
              <p className="text-xs text-gray-400 mt-1">{metrics.ordCount} orders</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">GP I</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{fmtShort(metrics.grossProfit1)}</p>
              <p className="text-xs text-gray-400 mt-1">Sales − Raw Mat</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 border-l-4 border-l-indigo-500">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">GP II</p>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{fmtShort(metrics.grossProfit2)}</p>
              <p className="text-xs text-gray-400 mt-1">− Raw Mat − Ads</p>
            </div>
            <div className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 border-l-4 ${metrics.netProfit >= 0 ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Net Profit</p>
              <p className={`text-xl sm:text-2xl font-black ${metrics.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtShort(metrics.netProfit)}</p>
              <p className="text-xs text-gray-400 mt-1">Margin {metrics.npm.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* P&L Breakdown */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="font-black text-gray-900 mb-0.5">P&L Breakdown</h3>
              <p className="text-xs text-gray-400 mb-5">{MONTHS[selMonth]} {selYear}{isCurrentMonth ? ' (MTD)' : ''}</p>
              <MetricRow label="💰 Total Sales" value={metrics.sales} positive={true} bold />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-3 mb-1">Expenses</p>
              <MetricRow label="🥩 Raw Materials" value={-metrics.rawMat} positive={false} />
              <MetricRow label="👨‍🍳 Chef Salary" value={-metrics.chefSalary} positive={false} />
              <MetricRow label="📣 Ad Spend" value={-metrics.adSpend} positive={false} />
              <MetricRow label="📦 Miscellaneous" value={-metrics.misc} positive={false} />
              <div className="h-2" />
              <MetricRow label="Gross Profit I" value={metrics.grossProfit1} pct={metrics.gpm1} positive={metrics.grossProfit1 >= 0} bold />
              <MetricRow label="Gross Profit II" value={metrics.grossProfit2} pct={metrics.gpm2} positive={metrics.grossProfit2 >= 0} bold />
              <MetricRow label="Net Profit" value={metrics.netProfit} pct={metrics.npm} positive={metrics.netProfit >= 0} bold />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-5">
              {/* Ad Performance */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-900 mb-4">📣 Ad Performance</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'ROAS', value: `${metrics.roas.toFixed(1)}x`, bg: 'bg-blue-50', color: 'text-blue-600' },
                    { label: 'Ad Spend', value: fmt(metrics.adSpend), bg: 'bg-amber-50', color: 'text-amber-600' },
                    { label: 'Sales (Delivered)', value: fmt(metrics.sales), bg: 'bg-emerald-50', color: 'text-emerald-600' },
                    { label: 'Avg Order Value', value: fmt(metrics.aov), bg: 'bg-violet-50', color: 'text-violet-600' },
                  ].map(({ label, value, bg, color }) => (
                    <div key={label} className={`${bg} rounded-xl p-3 sm:p-3.5 text-center`}>
                      <p className={`text-lg sm:text-xl font-black ${color}`}>{value}</p>
                      <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
                {metrics.adSpend > 0 && (
                  <p className="text-xs text-gray-500 mt-3 text-center bg-gray-50 rounded-lg px-3 py-2">
                    Every ৳1 on ads → <strong className="text-gray-900">৳{metrics.roas.toFixed(2)}</strong> in sales
                  </p>
                )}
              </div>

              {/* Margins */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 flex-1">
                <h3 className="font-black text-gray-900 mb-4">Margin Overview</h3>
                {[
                  { label: 'Gross Margin I', pct: metrics.gpm1, color: 'bg-blue-500' },
                  { label: 'Gross Margin II', pct: metrics.gpm2, color: 'bg-indigo-500' },
                  { label: 'Net Margin', pct: metrics.npm, color: metrics.npm >= 0 ? 'bg-emerald-500' : 'bg-red-500' },
                ].map(({ label, pct, color }) => (
                  <div key={label} className="mb-3 last:mb-0">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className={`text-xs font-bold ${pct >= 0 ? 'text-gray-700' : 'text-red-500'}`}>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${color}`}
                        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-gray-900 text-sm sm:text-base">Expense Log — {MONTHS[selMonth]} {selYear}</h3>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">{expenses.length} entries</span>
            </div>

            {expenses.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <FiAlertCircle size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No expenses logged for this period</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-[420px] px-4 sm:px-0">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          {['Date', 'Category', 'Description', 'Amount', ''].map((h, i) => (
                            <th key={i} className={`pb-2.5 text-xs font-bold text-gray-400 uppercase tracking-widest ${h === 'Amount' ? 'text-right' : 'text-left'} px-2 sm:px-3 ${h === 'Description' ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <ExpenseRows expenses={pagedExpenses} apiUrl={apiUrl} onSave={fetchData} />
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination total={expenses.length} page={expPage} perPage={8} onChange={setExpPage} />
              </>
            )}
          </div>
        </>
      )}
      {showAddExpense && <AddExpenseModal onClose={() => setShowAddExpense(false)} onSave={fetchData} apiUrl={apiUrl} />}
    </div>
  );
};

// ─── Main Orders Component ────────────────────────────────────────────────────
const Orders = () => {
  const [mainTab, setMainTab] = useState('orders');
  const [activeStatus, setActiveStatus] = useState('placed');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingPrices, setEditingPrices] = useState({});
  const [newItem, setNewItem] = useState({ product_name: '', price: '', quantity: 1 });
  const [page, setPage] = useState(1);
  const [customerModal, setCustomerModal] = useState(null);
  const [repeatCustomers, setRepeatCustomers] = useState({});

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return orders.filter(o =>
      o.name?.toLowerCase().includes(q) ||
      o.id?.toString().includes(q) ||
      o.phone_number?.includes(q)
    );
  }, [orders, searchQuery]);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (mainTab === 'orders') fetchOrders(activeStatus);
    setSelectedOrders([]); setSelectAll(false); setPage(1);
  }, [activeStatus, mainTab]);

  const fetchOrders = async (status) => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/orders/?status=${status}`);
      const data = await res.json();
      const withItems = await Promise.all(
        data.map(async (order) => {
          const ir = await fetch(`${apiUrl}/order-items/?order=${order.id}`);
          const items = await ir.json();
          return { ...order, order_items: items };
        })
      );
      const sorted = withItems.sort((a, b) => new Date(b.order_time) - new Date(a.order_time));
      setOrders(sorted);
      const uniquePhones = [...new Set(sorted.map(o => o.phone_number))];
      const counts = {};
      await Promise.all(
        uniquePhones.map(async phone => {
          try {
            const r = await fetch(`${apiUrl}/customer-history/?phone=${phone}`);
            const d = await r.json();
            counts[phone] = d.count || 1;
          } catch { counts[phone] = 1; }
        })
      );
      setRepeatCustomers(counts);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pagedOrders = activeStatus === 'placed'
    ? filteredOrders
    : filteredOrders.slice((page - 1) * 10, page * 10);

  const orderSummary = useMemo(() => {
    const items = {};
    let total = 0;
    filteredOrders.forEach(o => {
      total += parseFloat(o.grandtotal || 0) - 100;
      (o.order_items || []).forEach(it => {
        const name = (it.product_name && it.product_name.trim()) ? it.product_name : `Product #${it.product}`;
        if (!items[name]) items[name] = { qty: 0, val: 0 };
        items[name].qty += it.quantity;
        items[name].val += (parseFloat(it.price) || 0) * it.quantity;
      });
    });
    return { total, count: filteredOrders.length, items };
  }, [filteredOrders]);

  const startEdit = (order) => {
    setEditingOrder(order.id);
    const p = {};
    (order.order_items || []).forEach(it => { p[it.id] = parseFloat(it.price) || 0; });
    setEditingPrices(p);
    setNewItem({ product_name: '', price: '', quantity: 1 });
  };
  const cancelEdit = () => { setEditingOrder(null); setEditingPrices({}); };
  const calcSubtotal = () => Object.values(editingPrices).reduce((s, p) => s + (p || 0), 0);
  const calcGrand = () => calcSubtotal() + 100;

  const saveEdit = async (order) => {
    try {
      await Promise.all(
        (order.order_items || []).map(it =>
          fetch(`${apiUrl}/order-items/${it.id}/`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: editingPrices[it.id] })
          })
        )
      );
      await fetch(`${apiUrl}/orders/${order.id}/`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtotal: calcSubtotal(), grandtotal: calcGrand() })
      });
      Swal.fire('Saved!', 'Order updated', 'success');
      fetchOrders(activeStatus); cancelEdit();
    } catch { Swal.fire('Error', 'Failed to update', 'error'); }
  };

  const addItem = async (order) => {
    if (!newItem.product_name || !newItem.price) return Swal.fire('Error', 'Fill all fields', 'error');
    try {
      await fetch(`${apiUrl}/order-items/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: order.id, product_name: newItem.product_name, price: newItem.price, quantity: newItem.quantity })
      });
      fetchOrders(activeStatus);
      setNewItem({ product_name: '', price: '', quantity: 1 });
    } catch { Swal.fire('Error', 'Failed to add item', 'error'); }
  };

  const removeItem = async (itemId) => {
    const ok = await Swal.fire({ title: 'Remove item?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Remove' });
    if (!ok.isConfirmed) return;
    await fetch(`${apiUrl}/order-items/${itemId}/`, { method: 'DELETE' });
    fetchOrders(activeStatus);
  };

  const updateStatus = async (orderId, ns) => {
    const ok = await Swal.fire({ title: `Mark as ${ns}?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Yes' });
    if (!ok.isConfirmed) return;
    await fetch(`${apiUrl}/orders/${orderId}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: ns }) });
    fetchOrders(activeStatus);
  };

  const bulkUpdate = async (ns) => {
    if (!selectedOrders.length) return;
    const ok = await Swal.fire({ title: `Update ${selectedOrders.length} orders to ${ns}?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Yes' });
    if (!ok.isConfirmed) return;
    await Promise.all(selectedOrders.map(id =>
      fetch(`${apiUrl}/orders/${id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: ns }) })
    ));
    fetchOrders(activeStatus); setSelectedOrders([]); setSelectAll(false);
  };

  const nextAction = (s) => {
    if (s === 'placed') return { label: 'Mark Checked Out', next: 'checkout' };
    if (s === 'checkout') return { label: 'Mark Shipped', next: 'shipped' };
    if (s === 'shipped') return { label: 'Mark Delivered', next: 'delivered' };
    return null;
  };

  const copyData = () => {
    const data = orders.filter(o => selectedOrders.includes(o.id));
    const txt = data.map((o, i) => {
      const items = (o.order_items || [])
        .map(it => `${it.product_name || `Product #${it.product}`} (x${it.quantity})`)
        .join(', ');
      const orderValue = parseFloat(o.grandtotal || 0);
      const totalBill = orderValue + 100;
      return [
        `${i + 1})`,
        `Customer Name: ${o.name}\n`,
        `Phone No: ${o.phone_number}\n`,
        `Address: ${o.shipping_address}\n`,
        `Order Items: ${items}\n`,
        `Order Value: BDT ${orderValue.toFixed(2)}\n`,
        `Delivery Charge: BDT 100\n`,
        `Total Bill: BDT ${totalBill.toFixed(2)}`,
      ].join('\n');
    }).join('\n\n');
    navigator.clipboard.writeText(txt).then(() => Swal.fire('Copied!', `${data.length} orders copied`, 'success'));
  };

  const toggleSel = (id) => setSelectedOrders(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => {
    if (selectAll) setSelectedOrders([]); else setSelectedOrders(filteredOrders.map(o => o.id));
    setSelectAll(!selectAll);
  };

  const activeTab = STATUS_TABS.find(t => t.id === activeStatus);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body, .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .order-row { animation: fadeUp .15s ease both; }
        input:focus, select:focus { outline: 2px solid #111 !important; outline-offset: 1px; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-7">

        {/* Header */}
        <div className="flex justify-between items-start sm:items-end flex-wrap gap-3 mb-5 sm:mb-7">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage orders and track your business</p>
          </div>
          <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
            {[
              { id: 'orders',    label: '📋', fullLabel: '📋 Orders' },
              { id: 'finance',   label: '💰', fullLabel: '💰 Finance' },
              { id: 'customers', label: '👥', fullLabel: '👥 Customers' },
            ].map(t => (
              <button key={t.id} onClick={() => setMainTab(t.id)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl font-bold text-sm transition-all duration-150 ${mainTab === t.id ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                <span className="sm:hidden">{t.label}</span>
                <span className="hidden sm:inline">{t.fullLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {mainTab === 'finance' ? (
          <FinanceTab apiUrl={apiUrl} />
        ) : mainTab === 'customers' ? (
          <TopCustomers apiUrl={apiUrl} />
        ) : (
          <>
            {/* Status Tabs */}
            <div className="flex gap-1.5 sm:gap-2 mb-5 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
              {STATUS_TABS.map(t => (
                <button key={t.id} onClick={() => { setActiveStatus(t.id); setPage(1); }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-150 flex-shrink-0 ${activeStatus === t.id ? t.activeClass + ' border-current' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                  {t.label}
                  {activeStatus === t.id && (
                    <span className="bg-current/20 text-current px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold">
                      {filteredOrders.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
              <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 hidden sm:block">{activeTab?.label} Orders</p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 sm:hidden">Orders</p>
                <p className="text-xl sm:text-2xl font-black text-gray-900">{orderSummary.count}</p>
                <p className="text-xs text-gray-400 mt-1 hidden sm:block">currently in this status</p>
              </div>
              <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Value</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600">{fmtShort(orderSummary.total)}</p>
                <p className="text-xs text-gray-400 mt-1 hidden sm:block">excl. delivery</p>
              </div>
              <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-sm border border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Avg</p>
                <p className="text-xl sm:text-2xl font-black text-violet-600">{fmtShort(orderSummary.count > 0 ? orderSummary.total / orderSummary.count : 0)}</p>
                <p className="text-xs text-gray-400 mt-1 hidden sm:block">excl. delivery</p>
              </div>
            </div>

            {/* Search + Actions */}
            <div className="bg-white rounded-2xl px-3 sm:px-4 py-3 mb-4 shadow-sm border border-gray-100 flex gap-2 flex-wrap items-center">
              <div className="flex-1 min-w-0 relative">
                <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search name, ID, phone…"
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <button onClick={() => fetchOrders(activeStatus)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
                <FiRefreshCw size={12} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button onClick={() => { const phones = filteredOrders.map(o => o.phone_number).join('\n'); navigator.clipboard.writeText(phones).then(() => Swal.fire('Copied!', `${filteredOrders.length} phones`, 'success')); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
                <FiCopy size={12} />
                <span className="hidden sm:inline">Copy Phones</span>
              </button>
            </div>

            {/* Bulk Actions */}
            <AnimatePresence>
              {selectedOrders.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="bg-gray-900 rounded-2xl px-3 sm:px-4 py-3 mb-4 flex items-center gap-2 flex-wrap">
                  <span className="text-white text-sm font-bold">{selectedOrders.length} selected</span>
                  <div className="flex gap-1.5 flex-wrap flex-1">
                    {[
                      { label: 'Checked Out', ns: 'checkout', cls: 'bg-blue-500 hover:bg-blue-600' },
                      { label: 'Shipped', ns: 'shipped', cls: 'bg-indigo-500 hover:bg-indigo-600' },
                      { label: 'Delivered', ns: 'delivered', cls: 'bg-emerald-500 hover:bg-emerald-600' },
                      { label: 'Cancelled', ns: 'cancelled', cls: 'bg-red-500 hover:bg-red-600' },
                    ].map(a => (
                      <button key={a.ns} onClick={() => bulkUpdate(a.ns)}
                        className={`px-2.5 py-1.5 rounded-lg text-white text-xs font-bold transition-colors ${a.cls}`}>
                        {a.label}
                      </button>
                    ))}
                    <button onClick={copyData}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-600 text-gray-300 text-xs font-semibold hover:border-gray-500 transition-colors">
                      Copy Data
                    </button>
                  </div>
                  <button onClick={() => { setSelectedOrders([]); setSelectAll(false); }}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-700 text-gray-400 text-xs hover:border-gray-600 transition-colors flex-shrink-0">
                    Clear
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products Summary */}
            {Object.keys(orderSummary.items).length > 0 && (
              <div className="bg-white rounded-2xl px-3 sm:px-4 py-4 mb-4 shadow-sm border border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">📦 Products in {activeTab?.label}</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(orderSummary.items).map(([name, d]) => (
                    <div key={name} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors">
                      <span className="text-sm font-semibold text-gray-900">{name}</span>
                      <span className="bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 text-xs font-bold">×{d.qty}</span>
                      <span className="text-xs text-gray-500 hidden sm:inline">{fmt(d.val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders List */}
            {loading ? (
              <div className="text-center py-20">
                <div className="w-9 h-9 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Loading orders…</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <FiPackage size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="font-bold text-gray-600 text-base">No {activeStatus} orders</p>
                <p className="text-gray-400 text-sm mt-1">Nothing to show here right now.</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="bg-white rounded-t-2xl px-3 sm:px-4 py-2.5 border-b border-gray-100 flex items-center gap-2.5 shadow-sm">
                  <input type="checkbox" checked={selectAll} onChange={toggleAll} className="w-4 h-4 cursor-pointer accent-gray-900 rounded" />
                  <span className="text-xs text-gray-400 font-medium">Select all {filteredOrders.length}</span>
                </div>

                <div className="bg-white rounded-b-2xl overflow-hidden shadow-sm border border-gray-100 border-t-0">
                  {pagedOrders.map((order, idx) => {
                    const isExp = expandedOrder === order.id;
                    const isEdit = editingOrder === order.id;
                    const isSel = selectedOrders.includes(order.id);
                    const repeatCount = repeatCustomers[order.phone_number] || 1;
                    const isRepeat = repeatCount > 1;
                    const na = nextAction(order.status);

                    return (
                      <div key={order.id} className={`order-row border-b border-gray-50 last:border-0 transition-colors duration-100 ${isSel ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50/50'}`}>

                        {/* Row Header */}
                        <div className="px-3 sm:px-4 py-3 sm:py-3.5 flex items-center gap-2 sm:gap-3">
                          <input type="checkbox" checked={isSel} onChange={() => toggleSel(order.id)}
                            onClick={e => e.stopPropagation()}
                            className="w-4 h-4 cursor-pointer accent-gray-900 flex-shrink-0" />

                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedOrder(isExp ? null : order.id)}>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-sm text-gray-900">#{order.id}</span>
                              <Badge status={order.status} />
                              {isRepeat && (
                                <button onClick={e => { e.stopPropagation(); setCustomerModal({ phone: order.phone_number, name: order.name }); }}
                                  className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2 py-0.5 rounded-full text-xs font-semibold hover:bg-amber-100 transition-colors">
                                  <FiRepeat size={9} /> ×{repeatCount}
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-sm font-semibold text-gray-700 truncate max-w-[120px] sm:max-w-none">{order.name}</span>
                              <span className="text-gray-300 hidden sm:inline">·</span>
                              <span className="text-xs text-gray-500 hidden sm:inline">{order.phone_number}</span>
                              <span className="text-gray-300 hidden sm:inline">·</span>
                              <span className="text-xs text-gray-400 hidden sm:inline">{new Date(order.order_time).toLocaleString()}</span>
                              <span className="text-xs text-gray-400 sm:hidden">{new Date(order.order_time).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            <div className="text-right cursor-pointer" onClick={() => setExpandedOrder(isExp ? null : order.id)}>
                              <p className="font-black text-sm text-gray-900">{fmt(order.grandtotal)}</p>
                              <p className="text-xs text-gray-400">{(order.order_items || []).length} items</p>
                            </div>

                            <button onClick={() => setExpandedOrder(isExp ? null : order.id)}
                              className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors flex-shrink-0">
                              {isExp ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                            </button>
                            {!isEdit && (
                              <button onClick={() => startEdit(order)}
                                className="w-7 h-7 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors flex-shrink-0">
                                <FiEdit2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded */}
                        <AnimatePresence>
                          {isExp && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                              className="border-t border-gray-100 overflow-hidden">
                              <div className="px-3 sm:px-4 py-4 sm:py-5 space-y-4">

                                {/* Order Summary */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Order Summary</p>
                                  <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-500">Items Total</span>
                                    <span className="text-sm font-semibold text-gray-700">{fmt(parseFloat(order.grandtotal) - 100)}</span>
                                  </div>
                                  <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-500">Delivery</span>
                                    <span className="text-sm font-semibold text-gray-700">{fmt(100)}</span>
                                  </div>
                                  <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                                    <span className="font-bold text-gray-900">Total Bill</span>
                                    <span className="font-black text-gray-900">{fmt(order.grandtotal)}</span>
                                  </div>
                                  {order.shipping_address && (
                                    <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200 flex items-start gap-1.5">
                                      <span className="flex-shrink-0">📍</span>
                                      <span>{order.shipping_address}</span>
                                    </p>
                                  )}
                                  {order.phone_number && (
                                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                                      <span>📞</span>
                                      <span>{order.phone_number}</span>
                                    </p>
                                  )}
                                </div>

                                {/* Items Table - scrollable on mobile */}
                                <div className="border border-gray-100 rounded-xl overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <table className="w-full min-w-[360px]">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          {['Product', 'Price', 'Qty', 'Total', ...(isEdit ? [''] : [])].map(h => (
                                            <th key={h} className={`px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-400 ${h === 'Product' ? 'text-left' : 'text-right'}`}>{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(order.order_items || []).map(it => {
                                          const price = isEdit ? (editingPrices[it.id] || 0) : parseFloat(it.price || 0);
                                          return (
                                            <tr key={it.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                                              <td className="px-3 py-2.5 text-sm text-gray-900">{it.product_name || `Product #${it.product}`}</td>
                                              <td className="px-3 py-2.5 text-right">
                                                {isEdit ? (
                                                  <input type="number" value={editingPrices[it.id] || ''} onChange={e => setEditingPrices(p => ({ ...p, [it.id]: parseFloat(e.target.value) || 0 }))}
                                                    className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-900" />
                                                ) : <span className="text-sm text-gray-700">{fmt(price)}</span>}
                                              </td>
                                              <td className="px-3 py-2.5 text-right text-sm text-gray-500">×{it.quantity}</td>
                                              <td className="px-3 py-2.5 text-right text-sm font-semibold text-gray-900">{fmt(price * it.quantity)}</td>
                                              {isEdit && (
                                                <td className="px-3 py-2.5 text-right">
                                                  <button onClick={() => removeItem(it.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                                                    <FiTrash2 size={12} />
                                                  </button>
                                                </td>
                                              )}
                                            </tr>
                                          );
                                        })}
                                        {isEdit && (
                                          <tr className="border-t border-gray-100 bg-gray-50/50">
                                            <td className="px-3 py-2">
                                              <input value={newItem.product_name} onChange={e => setNewItem(p => ({ ...p, product_name: e.target.value }))}
                                                placeholder="Product name" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900" />
                                            </td>
                                            <td className="px-3 py-2">
                                              <input type="number" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                                                placeholder="Price" className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-right focus:outline-none focus:ring-2 focus:ring-gray-900" />
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setNewItem(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                                                  className="w-5 h-5 rounded border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100 transition-colors">
                                                  <FiMinus size={9} />
                                                </button>
                                                <span className="w-5 text-center text-xs font-bold">{newItem.quantity}</span>
                                                <button onClick={() => setNewItem(p => ({ ...p, quantity: p.quantity + 1 }))}
                                                  className="w-5 h-5 rounded border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100 transition-colors">
                                                  <FiPlus size={9} />
                                                </button>
                                              </div>
                                            </td>
                                            <td className="px-3 py-2 text-right text-xs text-gray-500">{fmt(newItem.price * newItem.quantity)}</td>
                                            <td className="px-3 py-2 text-right">
                                              <button onClick={() => addItem(order)}
                                                className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors">
                                                Add
                                              </button>
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                      {isEdit && (
                                        <tfoot>
                                          <tr className="bg-emerald-50 border-t-2 border-emerald-100">
                                            <td colSpan={3} className="px-3 py-2.5 text-sm font-bold text-emerald-800">New Total</td>
                                            <td className="px-3 py-2.5 text-right font-black text-emerald-800">{fmt(calcGrand())}</td>
                                            <td />
                                          </tr>
                                        </tfoot>
                                      )}
                                    </table>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 flex-wrap">
                                  {isEdit ? (
                                    <>
                                      <button onClick={() => saveEdit(order)}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors text-center">
                                        Save Changes
                                      </button>
                                      <button onClick={cancelEdit}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors text-center">
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {na && (
                                        <button onClick={() => updateStatus(order.id, na.next)}
                                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                                          {na.label} <FiArrowRight size={12} />
                                        </button>
                                      )}
                                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                        <button onClick={() => updateStatus(order.id, 'cancelled')}
                                          className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-600 ring-1 ring-red-200 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors text-center">
                                          Cancel Order
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {activeStatus !== 'placed' && (
                  <Pagination total={filteredOrders.length} page={page} perPage={10} onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                )}
              </>
            )}
          </>
        )}
      </div>

      {customerModal && (
        <CustomerHistoryModal
          phone={customerModal.phone}
          name={customerModal.name}
          apiUrl={apiUrl}
          onClose={() => setCustomerModal(null)}
        />
      )}
    </div>
  );
};

export default Orders;