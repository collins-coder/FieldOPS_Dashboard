import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Icon } from "../components/Icons";
import { PageHeader, StatusPill, ExportButton, EmptyState } from "../components/ui";

/* ============================================================
   REPORTS CENTER
   Two levels: a hub of category cards (Workforce / Sales), each
   listing individual reports. Picking one drills into a single
   filtered report — its own date range, its own export — instead
   of one giant combined page mixing every module's data together.
   Every report here reads from an endpoint that already exists on
   the backend (no new routes needed): the module list endpoints
   (/admin/sales-orders, /admin/invoices, /admin/payments, /customers,
   /timesheet, /visits) plus the purpose-built /api/reports/* ones.
   ============================================================ */

const REPORT_DEFS = {
  timesheets: {
    label: "Timesheets", url: "/timesheet", exportUrl: "/timesheet/export",
    columns: [
      { key: "user", label: "User" },
      { key: "date", label: "Date" },
      { key: "start_time", label: "Start" },
      { key: "end_time", label: "End" },
      { key: "status", label: "Status", pill: true },
      { key: "logged_hours", label: "Hours" },
    ],
  },
  visits: {
    label: "User Visits", url: "/visits", exportUrl: "/visits/export",
    columns: [
      { key: "user", label: "User" },
      { key: "customer", label: "Customer" },
      { key: "route_name", label: "Route" },
      { key: "time_in", label: "Time In" },
      { key: "time_out", label: "Time Out" },
      { key: "duration", label: "Duration" },
      { key: "status", label: "Status", pill: true },
      { key: "visit_date", label: "Date" },
    ],
  },
  "activity-timeline": {
    label: "User Activity Timeline", soon: true,
    note: "Needs a dedicated activity-log endpoint on the backend — not built yet.",
  },
  "new-customers": {
    label: "New Customers", url: "/api/reports/customers", exportUrl: "/api/reports/customers/export",
    columns: [
      { key: "customer_code", label: "Code" },
      { key: "customer_name", label: "Name" },
      { key: "location", label: "Location" },
      { key: "route", label: "Route" },
      { key: "status", label: "Status", pill: true },
      { key: "created_by", label: "Created By" },
      { key: "created_at", label: "Created" },
    ],
  },
  "sales-order-summary": {
    label: "Sales Order Summary", url: "/admin/sales-orders", exportUrl: "/admin/sales-orders/export",
    columns: [
      { key: "order_number", label: "Order #" },
      { key: "customer_name", label: "Customer" },
      { key: "order_date", label: "Date" },
      { key: "total_amount", label: "Total", money: true },
      { key: "status", label: "Status", pill: true },
      { key: "doc_status", label: "Doc Status", pill: true },
    ],
  },
  "sales-invoice": {
    label: "Sales Invoice Reports", url: "/admin/invoices", exportUrl: "/admin/invoices/export",
    columns: [
      { key: "invoice_number", label: "Invoice #" },
      { key: "customer_name", label: "Customer" },
      { key: "invoice_amount", label: "Amount", money: true },
      { key: "due_date", label: "Due Date" },
      { key: "status", label: "Status", pill: true },
      { key: "doc_status", label: "Doc Status", pill: true },
    ],
  },
  "payment-collections": {
    label: "Payment Collections", url: "/admin/payments", exportUrl: "/admin/payments/export",
    columns: [
      { key: "payment_reference", label: "Reference" },
      { key: "invoice_number", label: "Invoice #" },
      { key: "customer_name", label: "Customer" },
      { key: "amount_paid", label: "Amount", money: true },
      { key: "payment_method", label: "Method" },
      { key: "payment_date", label: "Date" },
      { key: "status", label: "Status", pill: true },
    ],
  },
  "route-performance": {
    label: "Route Performance", url: "/api/reports/route-performance",
    columns: [
      { key: "route_name", label: "Route" },
      { key: "invoices", label: "Invoices" },
      { key: "total_sales", label: "Total Sales", money: true },
    ],
  },
  "combined-sales": {
    label: "Combined Sales Report", url: "/api/reports/summary", summary: true,
  },
};

const CATEGORIES = [
  {
    title: "Workforce Reports",
    icon: <Icon.Users size={22} />,
    tint: { bg: "var(--neutral-bg)", fg: "var(--brand-purple)" },
    description: "Track employee attendance, field visits, and survey responses.",
    includes: "Attendance, Field Activity",
    reports: ["timesheets", "visits", "activity-timeline", "new-customers"],
  },
  {
    title: "Sales Reports",
    icon: <Icon.Cart size={22} />,
    tint: { bg: "#e0e7ff", fg: "var(--brand-blue)" },
    description: "Analyze sales performance, revenue, and customer trends.",
    includes: "Total Revenue, Daily Sales",
    reports: ["sales-order-summary", "sales-invoice", "payment-collections", "combined-sales", "route-performance"],
  },
];

/* ---------- Individual report view ---------- */
function ReportView({ reportKey, onBack }) {
  const def = REPORT_DEFS[reportKey];
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await api.get(def.url, { params });

      if (def.summary) {
        setSummary(res.data || {});
      } else {
        setRows(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error(`REPORT (${reportKey}) ERROR:`, err.response?.data || err.message);
      setError(
        "Could not load this report (" + (err.response?.status || "no response") + "). " +
        (err.response?.data?.message || "")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [reportKey]);

  if (!def) return null;

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <button className="btn btn-light btn-sm" onClick={onBack}>
          ← Back to Reports
        </button>
      </div>

      <PageHeader
        title={def.label}
        subtitle={def.note || "Filter by date range, then export if needed."}
        actions={
          def.exportUrl && !def.soon
            ? <ExportButton api={api} url={def.exportUrl} filename={`${reportKey}.xlsx`} />
            : null
        }
      />

      {def.soon ? (
        <div className="card p-4 text-center text-muted">
          This report isn't available yet — {def.note}
        </div>
      ) : (
        <>
          <div className="card p-3 mb-3">
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <label>Start Date</label>
                <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label>End Date</label>
                <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="col-md-3">
                <button className="btn btn-primary" onClick={fetchData}>
                  <Icon.Filter size={14} /> Apply Filter
                </button>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <p>Loading...</p>
          ) : def.summary ? (
            <SummaryCards data={summary} />
          ) : (
            <div className="card p-0">
              <div className="table-wrap">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      {def.columns.map((c) => <th key={c.key}>{c.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr><td colSpan={def.columns.length}><EmptyState label="No records for this range." /></td></tr>
                    ) : (
                      rows.map((row, i) => (
                        <tr key={row.id || i}>
                          {def.columns.map((c) => (
                            <td key={c.key}>
                              {c.pill ? (
                                <StatusPill status={row[c.key]} />
                              ) : c.money ? (
                                Number(row[c.key] || 0).toLocaleString()
                              ) : (
                                row[c.key] ?? "—"
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCards({ data }) {
  if (!data) return null;
  const cards = [
    { label: "Customers", value: data.total_customers },
    { label: "Sales Orders", value: data.total_orders },
    { label: "Order Value", value: Number(data.order_value || 0).toLocaleString() },
    { label: "Invoices", value: data.total_invoices },
    { label: "Invoice Value", value: Number(data.invoice_value || 0).toLocaleString() },
    { label: "Payments", value: data.total_payments },
    { label: "Paid Amount", value: Number(data.paid_amount || 0).toLocaleString() },
    { label: "Collection Rate", value: `${data.collection_rate || 0}%` },
  ];
  return (
    <div className="row g-3">
      {cards.map((c) => (
        <div className="col-md-3" key={c.label}>
          <div className="kpi-card">
            <div className="kpi-label">{c.label}</div>
            <div className="kpi-value">{c.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Hub ---------- */
function CategoryCard({ category, onSelect }) {
  return (
    <div className="card p-4 h-100">
      <div className="d-flex align-items-center gap-3 mb-2">
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: category.tint.bg,
          color: category.tint.fg, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {category.icon}
        </div>
        <h4 className="mb-0" style={{ fontWeight: 700 }}>{category.title}</h4>
      </div>

      <p className="text-muted" style={{ fontSize: 13.5 }}>{category.description}</p>

      <div style={{ fontSize: 12.5, color: "var(--brand-blue)", fontWeight: 600, marginBottom: 10 }}>
        <Icon.ArrowUp size={12} style={{ transform: "rotate(45deg)" }} /> Includes: {category.includes}
      </div>

      <div style={{ borderTop: "1px solid var(--border)" }}>
        {category.reports.map((key) => {
          const def = REPORT_DEFS[key];
          return (
            <div
              key={key}
              onClick={() => onSelect(key)}
              className="d-flex justify-content-between align-items-center"
              style={{ padding: "12px 2px", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
            >
              <span style={{ fontSize: 13.5, color: def.soon ? "var(--text-muted)" : "var(--text-primary)" }}>
                {def.label}
              </span>
              {def.soon ? (
                <span className="pill pill-muted">Soon</span>
              ) : (
                <Icon.ChevronRight size={14} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Reports() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return <ReportView reportKey={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      <PageHeader
        title="Reports Center"
        subtitle="Access detailed insights across your organization."
      />

      <div className="row g-3">
        {CATEGORIES.map((cat) => (
          <div className="col-md-6" key={cat.title}>
            <CategoryCard category={cat} onSelect={setSelected} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;