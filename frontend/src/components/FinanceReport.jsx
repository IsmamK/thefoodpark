import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Font, pdf
} from '@react-pdf/renderer';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const EXPENSE_CATS = [
  { id: 'raw_materials', label: 'Raw Materials', icon: 'Raw Mat.' },
  { id: 'chef_salary',   label: "Chef's Salary", icon: 'Chef' },
  { id: 'ads',           label: 'Ad Spend',      icon: 'Ads' },
  { id: 'miscellaneous', label: 'Miscellaneous', icon: 'Misc.' },
];

const fmtBDT = (n) => `BDT ${Math.round(n || 0).toLocaleString('en-US')}`;
const pctStr = (n) => `${(n || 0).toFixed(1)}%`;

const C = {
  black:   '#111827',
  gray900: '#111827',
  gray600: '#4b5563',
  gray400: '#9ca3af',
  gray200: '#e5e7eb',
  gray100: '#f3f4f6',
  gray50:  '#f9fafb',
  green:   '#059669',
  red:     '#ef4444',
  blue:    '#2563eb',
  indigo:  '#6366f1',
  violet:  '#7c3aed',
  amber:   '#d97706',
  white:   '#ffffff',
};

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: C.white, paddingBottom: 40 },

  // Cover
  cover: { backgroundColor: C.black, padding: '28 40 22 40', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  coverLeft: { flex: 1 },
  coverBadge: { backgroundColor: C.white, borderRadius: 6, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  coverBadgeTxt: { fontSize: 14 },
  coverBrand: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 6 },
  coverTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: C.white, letterSpacing: -0.3 },
  coverSub: { fontSize: 10, color: C.gray400, marginTop: 3 },
  coverRight: { alignItems: 'flex-end' },
  coverMetaLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  coverMetaVal: { fontSize: 9, color: '#d1d5db', marginBottom: 8 },

  body: { padding: '24 40 0 40' },

  // Section
  sectionTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray400, textTransform: 'uppercase', letterSpacing: 1, borderBottomWidth: 1, borderBottomColor: C.gray100, paddingBottom: 5, marginBottom: 12, marginTop: 20 },

  // KPI grid
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 0 },
  kpi: { flex: 1, borderWidth: 1, borderColor: C.gray200, borderRadius: 8, padding: '10 12', position: 'relative' },
  kpiBar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, borderRadius: 2 },
  kpiLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  kpiValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.black, marginBottom: 2 },
  kpiSub: { fontSize: 7.5, color: C.gray400 },

  // Two col
  twoCol: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },

  // Card
  card: { borderWidth: 1, borderColor: C.gray200, borderRadius: 8, padding: '13 15', marginBottom: 12 },
  cardTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.black, marginBottom: 10 },

  // P&L
  plRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.gray50 },
  plLabel: { fontSize: 9.5, color: C.gray600 },
  plLabelBold: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.black },
  plValue: { fontSize: 9.5, fontFamily: 'Helvetica-Bold' },
  plSectionLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: 0.7, paddingTop: 8, paddingBottom: 2 },
  plTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 7, marginTop: 3, borderTopWidth: 1.5, borderTopColor: C.gray200 },
  plSub: { paddingLeft: 8 },

  // Margin bar
  marginRow: { marginBottom: 8 },
  marginHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  marginLabel: { fontSize: 8.5, color: C.gray600 },
  marginPct: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.black },
  barTrack: { backgroundColor: C.gray100, borderRadius: 99, height: 4, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 99 },

  // Ad grid
  adGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 8 },
  adCell: { width: '47%', borderRadius: 6, padding: '7 8', alignItems: 'center' },
  adVal: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  adLbl: { fontSize: 7.5, color: C.gray600 },
  adNote: { fontSize: 7.5, color: C.gray600, backgroundColor: C.gray50, borderRadius: 5, padding: '4 7', textAlign: 'center' },

  // Rank bars
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  rankBadge: { width: 16, height: 16, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
  rankNum: { fontSize: 7.5, fontFamily: 'Helvetica-Bold' },
  rankContent: { flex: 1 },
  rankHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  rankName: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.black, flex: 1 },
  rankVal: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.black },
  rankSub: { fontSize: 7.5, color: C.gray400 },

  // Table
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: C.gray200, paddingBottom: 5, marginBottom: 2 },
  tableHeaderCell: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray400, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.gray50 },
  tableCell: { fontSize: 8.5, color: C.gray600 },

  footer: { borderTopWidth: 1, borderTopColor: C.gray100, marginTop: 24, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 40 },
  footerTxt: { fontSize: 7.5, color: '#d1d5db' },
});

// ── Sub-components ──────────────────────────────────────────────────────────

const KPICard = ({ label, value, sub, barColor, valueColor }) => (
  <View style={s.kpi}>
    <View style={[s.kpiBar, { backgroundColor: barColor }]} />
    <Text style={s.kpiLabel}>{label}</Text>
    <Text style={[s.kpiValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    <Text style={s.kpiSub}>{sub}</Text>
  </View>
);

const PLRow = ({ label, value, bold, color, indent, noBorder }) => (
  <View style={[s.plRow, noBorder && { borderBottomWidth: 0 }, indent && s.plSub]}>
    <Text style={bold ? s.plLabelBold : s.plLabel}>{label}</Text>
    <Text style={[s.plValue, { color: color || C.black }]}>{value}</Text>
  </View>
);

const MarginBar = ({ label, pct, color }) => (
  <View style={s.marginRow}>
    <View style={s.marginHeader}>
      <Text style={s.marginLabel}>{label}</Text>
      <Text style={[s.marginPct, { color: pct >= 0 ? C.black : C.red }]}>{pctStr(pct)}</Text>
    </View>
    <View style={s.barTrack}>
      <View style={[s.barFill, { width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color }]} />
    </View>
  </View>
);

const RankRow = ({ rank, name, value, sub, barWidth, barColor }) => {
  const badgeBg = rank === 1 ? '#fef3c7' : rank === 2 ? C.gray100 : rank === 3 ? '#fef3c7' : C.gray50;
  const badgeTxt = rank === 1 ? C.amber : rank === 2 ? C.gray600 : rank === 3 ? '#b45309' : C.gray400;
  return (
    <View style={s.rankRow}>
      <View style={[s.rankBadge, { backgroundColor: badgeBg }]}>
        <Text style={[s.rankNum, { color: badgeTxt }]}>{rank}</Text>
      </View>
      <View style={s.rankContent}>
        <View style={s.rankHeader}>
          <Text style={s.rankName} numberOfLines={1}>{name}</Text>
          <Text style={s.rankVal}>{value}</Text>
        </View>
        <View style={s.barTrack}>
          <View style={[s.barFill, { width: `${barWidth}%`, backgroundColor: barColor }]} />
        </View>
      </View>
      <Text style={s.rankSub}>{sub}</Text>
    </View>
  );
};

// ── Main PDF Document ────────────────────────────────────────────────────────

const FinanceReportPDF = ({ metrics, expenses, deliveredOrders, selMonth, selYear, isCurrentMonth }) => {
  const monthLabel = `${MONTHS[selMonth]} ${selYear}`;
  const mtd = isCurrentMonth ? ' (MTD)' : '';
  const generatedOn = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  // Build item summary
  const itemMap = {};
  deliveredOrders.forEach(o => {
    (o.order_items || []).forEach(it => {
      const name = it.product_name?.trim() || `Product #${it.product}`;
      if (!itemMap[name]) itemMap[name] = { qty: 0, revenue: 0 };
      itemMap[name].qty += it.quantity;
      itemMap[name].revenue += (parseFloat(it.price) || 0) * it.quantity;
    });
  });
  const topItems = Object.entries(itemMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 7);
  const maxItemRev = topItems[0]?.[1].revenue || 1;

  // Build customer summary
  const custMap = {};
  deliveredOrders.forEach(o => {
    const key = o.phone_number;
    if (!custMap[key]) custMap[key] = { name: o.name, orders: 0, revenue: 0 };
    custMap[key].orders += 1;
    custMap[key].revenue += parseFloat(o.grandtotal || 0) - 100;
  });
  const topCustomers = Object.values(custMap).sort((a, b) => b.revenue - a.revenue).slice(0, 7);
  const maxCustRev = topCustomers[0]?.revenue || 1;

  return (
    <Document title={`FoodPark Report — ${monthLabel}`}>
      <Page size="A4" style={s.page}>

        {/* ── Cover ── */}
        <View style={s.cover}>
          <View style={s.coverLeft}>
            <Text style={s.coverBrand}>🛍 FoodPark</Text>
            <Text style={s.coverTitle}>Financial Report</Text>
            <Text style={s.coverSub}>{monthLabel}{mtd}</Text>
          </View>
          <View style={s.coverRight}>
            <Text style={s.coverMetaLabel}>Generated on</Text>
            <Text style={s.coverMetaVal}>{generatedOn}</Text>
            <Text style={s.coverMetaLabel}>Delivered Orders</Text>
            <Text style={s.coverMetaVal}>{metrics.ordCount} orders</Text>
            <Text style={s.coverMetaLabel}>Avg Order Value</Text>
            <Text style={s.coverMetaVal}>{fmtBDT(metrics.aov)}</Text>
          </View>
        </View>

        <View style={s.body}>

          {/* ── KPIs ── */}
          <Text style={s.sectionTitle}>Performance Overview</Text>
          <View style={s.kpiRow}>
            <KPICard label="Total Sales" value={fmtBDT(metrics.sales)} sub={`${metrics.ordCount} delivered orders`} barColor={C.green} />
            <KPICard label="Gross Profit I" value={fmtBDT(metrics.grossProfit1)} sub={`After raw materials · ${pctStr(metrics.gpm1)}`} barColor={C.blue} />
            <KPICard label="Gross Profit II" value={fmtBDT(metrics.grossProfit2)} sub={`After raw mat + ads · ${pctStr(metrics.gpm2)}`} barColor={C.indigo} />
            <KPICard
              label="Net Profit"
              value={fmtBDT(metrics.netProfit)}
              sub={`Net margin · ${pctStr(metrics.npm)}`}
              barColor={metrics.netProfit >= 0 ? C.green : C.red}
              valueColor={metrics.netProfit >= 0 ? C.green : C.red}
            />
          </View>

          {/* ── P&L + Ad Performance ── */}
          <Text style={s.sectionTitle}>Profit & Loss</Text>
          <View style={s.twoCol}>

            {/* P&L */}
            <View style={[s.card, { flex: 1 }]}>
              <Text style={s.cardTitle}>P&L Breakdown</Text>
              <PLRow label="Total Sales" value={fmtBDT(metrics.sales)} bold color={C.green} />
              <Text style={s.plSectionLabel}>Cost of Goods</Text>
              <PLRow label="Raw Materials" value={`-${fmtBDT(metrics.rawMat)}`} color={C.red} indent />
              <PLRow label="Gross Profit I" value={`${fmtBDT(metrics.grossProfit1)} (${pctStr(metrics.gpm1)})`} bold color={metrics.grossProfit1 >= 0 ? C.green : C.red} noBorder indent />
              <Text style={s.plSectionLabel}>Operating</Text>
              <PLRow label="Ad Spend" value={`-${fmtBDT(metrics.adSpend)}`} color={C.red} indent />
              <PLRow label="Gross Profit II" value={`${fmtBDT(metrics.grossProfit2)} (${pctStr(metrics.gpm2)})`} bold color={metrics.grossProfit2 >= 0 ? C.green : C.red} noBorder indent />
              <Text style={s.plSectionLabel}>Other</Text>
              <PLRow label="Chef Salary" value={`-${fmtBDT(metrics.chefSalary)}`} color={C.red} indent />
              <PLRow label="Miscellaneous" value={`-${fmtBDT(metrics.misc)}`} color={C.red} indent />
              <View style={s.plTotalRow}>
                <Text style={s.plLabelBold}>Net Profit</Text>
                <Text style={[s.plValue, { color: metrics.netProfit >= 0 ? C.green : C.red }]}>
                  {fmtBDT(metrics.netProfit)} ({pctStr(metrics.npm)})
                </Text>
              </View>
            </View>

            {/* Right col */}
            <View style={{ flex: 1, gap: 10 }}>
              {/* Ad Performance */}
              <View style={s.card}>
                <Text style={s.cardTitle}>Ad Performance</Text>
                <View style={s.adGrid}>
                  <View style={[s.adCell, { backgroundColor: '#eff6ff' }]}>
                    <Text style={[s.adVal, { color: C.blue }]}>{metrics.roas.toFixed(1)}x</Text>
                    <Text style={s.adLbl}>ROAS</Text>
                  </View>
                  <View style={[s.adCell, { backgroundColor: '#fffbeb' }]}>
                    <Text style={[s.adVal, { color: C.amber }]}>{fmtBDT(metrics.adSpend)}</Text>
                    <Text style={s.adLbl}>Ad Spend</Text>
                  </View>
                  <View style={[s.adCell, { backgroundColor: '#ecfdf5' }]}>
                    <Text style={[s.adVal, { color: C.green }]}>{fmtBDT(metrics.sales)}</Text>
                    <Text style={s.adLbl}>Revenue</Text>
                  </View>
                  <View style={[s.adCell, { backgroundColor: '#f5f3ff' }]}>
                    <Text style={[s.adVal, { color: C.violet }]}>{fmtBDT(metrics.aov)}</Text>
                    <Text style={s.adLbl}>Avg Order</Text>
                  </View>
                </View>
                {metrics.adSpend > 0 && (
                  <Text style={s.adNote}>
                    Every BDT 1 on ads → BDT {metrics.roas.toFixed(2)} in revenue
                  </Text>
                )}
              </View>

              {/* Margins */}
              <View style={s.card}>
                <Text style={s.cardTitle}>Margin Overview</Text>
                <MarginBar label="Gross Margin I"  pct={metrics.gpm1} color={C.blue} />
                <MarginBar label="Gross Margin II" pct={metrics.gpm2} color={C.indigo} />
                <MarginBar label="Net Margin"      pct={metrics.npm}  color={metrics.npm >= 0 ? C.green : C.red} />
              </View>
            </View>
          </View>

          {/* ── Top Items + Top Customers ── */}
          <Text style={s.sectionTitle}>Rankings</Text>
          <View style={s.twoCol}>

            <View style={s.card}>
              <Text style={s.cardTitle}>Top Items by Revenue</Text>
              {topItems.length === 0 ? (
                <Text style={{ fontSize: 8.5, color: C.gray400, textAlign: 'center', paddingVertical: 10 }}>
                  No item data — order items may not be linked
                </Text>
              ) : (
                topItems.map(([name, d], i) => (
                  <RankRow
                    key={name}
                    rank={i + 1}
                    name={name}
                    value={fmtBDT(d.revenue)}
                    sub={`×${d.qty}`}
                    barWidth={((d.revenue / maxItemRev) * 100).toFixed(1)}
                    barColor={C.indigo}
                  />
                ))
              )}
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Top Customers by Revenue</Text>
              {topCustomers.length === 0 ? (
                <Text style={{ fontSize: 8.5, color: C.gray400, textAlign: 'center', paddingVertical: 10 }}>
                  No customer data for this period
                </Text>
              ) : (
                topCustomers.map((c, i) => (
                  <RankRow
                    key={c.name + i}
                    rank={i + 1}
                    name={c.name}
                    value={fmtBDT(c.revenue)}
                    sub={`${c.orders} orders`}
                    barWidth={((c.revenue / maxCustRev) * 100).toFixed(1)}
                    barColor={C.green}
                  />
                ))
              )}
            </View>
          </View>

          {/* ── Expense Log ── */}
          {expenses.length > 0 && (
            <>
              <Text style={s.sectionTitle}>
                Expense Log — {expenses.length} entries · Total {fmtBDT(metrics.totalExpenses)}
              </Text>
              <View style={[s.card, { padding: '10 14' }]}>
                {/* Header */}
                <View style={s.tableHeader}>
                  <Text style={[s.tableHeaderCell, { flex: 0.8 }]}>Date</Text>
                  <Text style={[s.tableHeaderCell, { flex: 1.2 }]}>Category</Text>
                  <Text style={[s.tableHeaderCell, { flex: 2 }]}>Description</Text>
                  <Text style={[s.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                </View>
                {expenses.map((e, idx) => {
                  const cat = EXPENSE_CATS.find(c => c.id === e.category) || { label: e.category };
                  return (
                    <View key={e.id} style={[s.tableRow, { backgroundColor: idx % 2 === 1 ? C.gray50 : C.white }]}>
                      <Text style={[s.tableCell, { flex: 0.8, color: C.gray400 }]}>
                        {new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </Text>
                      <Text style={[s.tableCell, { flex: 1.2 }]}>{cat.label}</Text>
                      <Text style={[s.tableCell, { flex: 2, color: C.gray400 }]}>{e.description || '—'}</Text>
                      <Text style={[s.tableCell, { flex: 1, textAlign: 'right', color: C.red, fontFamily: 'Helvetica-Bold' }]}>
                        -{fmtBDT(e.amount)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerTxt}>FoodPark Admin · Confidential</Text>
          <Text style={s.footerTxt}>{monthLabel}{mtd} · Generated {generatedOn}</Text>
        </View>

      </Page>
    </Document>
  );
};

// ── Export function (call this instead of generatePDFReport) ─────────────────
export const downloadFinanceReport = async ({ metrics, expenses, deliveredOrders, selMonth, selYear, isCurrentMonth }) => {
  const blob = await pdf(
    <FinanceReportPDF
      metrics={metrics}
      expenses={expenses}
      deliveredOrders={deliveredOrders}
      selMonth={selMonth}
      selYear={selYear}
      isCurrentMonth={isCurrentMonth}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FoodPark_${MONTHS[selMonth]}_${selYear}_Report.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

export default FinanceReportPDF;