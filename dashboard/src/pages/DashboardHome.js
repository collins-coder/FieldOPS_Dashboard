import React, { useEffect, useState } from "react";
import api, { unwrapList } from "../api/axiosConfig";
import { Icon } from "../components/Icons";
import { PageHeader, StatusPill } from "../components/ui";

/* ============================================================
   NOTE ON KPI DATA (see conversation notes / API_NOTES.md):
   Right now these numbers are computed client-side from list
   lengths (customers.length, invoices.length, etc). That's fine
   for small datasets but doesn't scale and won't reflect
   same-day mobile-app activity in real time. The real fix is a
   dedicated `/admin/dashboard/summary` endpoint the backend
   maintains (or recomputes on a schedule) — see the API
   contract notes shared alongside this change for the exact
   shape expected here.
   ============================================================ */

function KpiCard({ icon, label, value, tint, delta, deltaDir }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: tint.bg, color: tint.fg }}>
        {icon}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {delta && (
        <div className={`kpi-delta ${deltaDir}`}>
          {deltaDir === "up" ? <Icon.ArrowUp size={12} /> : <Icon.ArrowDown size={12} />} {delta}
        </div>
      )}
    </div>
  );
}

function ActivityCard({ title, icon, children, footer }) {
  return (
    <div className="card h-100">
      <div className="p-3 pb-0 d-flex justify-content-between align-items-center">
        <h5 style={{ fontWeight: 700, fontSize: "15px", margin: 0 }}>{title}</h5>
        {icon}
      </div>
      <div className="p-3">{children}</div>
      {footer && <div className="px-3 pb-3">{footer}</div>}
    </div>
  );
}

function DashboardHome() {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const [loadErrors, setLoadErrors] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setLoadErrors([]);
    try {
      const results = await Promise.allSettled([
        api.get("/customers"),
        api.get("/admin/invoices"),
        api.get("/admin/payments"),
        api.get("/admin/sales-orders"),
        api.get("/deliveries"),
      ]);

      const [custRes, invRes, payRes, ordRes, delRes] = results;
      const labels = ["customers", "invoices", "payments", "sales orders", "deliveries"];
      const errors = [];

      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`Dashboard load error (${labels[i]}):`, r.reason?.response?.data || r.reason?.message);
          errors.push(`${labels[i]} (${r.reason?.response?.status || "no response"})`);
        } else if (!Array.isArray(r.value.data) && unwrapList(r.value.data).length === 0 && r.value.data) {
          // Request succeeded but the shape wasn't a plain array and we
          // couldn't find a nested list either — log the raw shape so
          // it's easy to see in devtools what the backend actually sent.
          console.warn(`Dashboard: /${labels[i]} responded but wasn't a recognizable list shape:`, r.value.data);
        }
      });

      setCustomers(custRes.status === "fulfilled" ? unwrapList(custRes.value.data) : []);
      setInvoices(invRes.status === "fulfilled" ? unwrapList(invRes.value.data) : []);
      setPayments(payRes.status === "fulfilled" ? unwrapList(payRes.value.data) : []);
      setOrders(ordRes.status === "fulfilled" ? unwrapList(ordRes.value.data) : []);
      setDeliveries(delRes.status === "fulfilled" ? unwrapList(delRes.value.data) : []);

      if (errors.length) setLoadErrors(errors);
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  // Currency is read from the payment records themselves (each payment's
  // own `currency` field, as set by your Currencies master) rather than
  // hardcoded — falls back to blank if payments don't carry a currency
  // field yet, so you can see immediately if that field is missing.
  const revenueCurrency = payments.find((p) => p.currency)?.currency || "";

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of Goandroy sales, deliveries and field activity"
        actions={
          <>
            <button className="btn btn-light" onClick={fetchData}>
              <Icon.Refresh size={14} /> Refresh
            </button>
            <button className="btn btn-primary">
              <Icon.Plus size={14} /> Quick Action
            </button>
          </>
        }
      />

      {loadErrors.length > 0 && (
        <div className="alert alert-danger">
          Some dashboard data failed to load: {loadErrors.join(", ")}. Numbers below only
          reflect what loaded successfully — open browser DevTools → Network tab, click
          the failing request, and check the Response tab for the exact reason (401 = not
          logged in / token issue, 404 = wrong endpoint path, 500 = backend error).
        </div>
      )}

      {/* KPI CARDS */}
      <div className="row g-3">
        <div className="col-md-4 col-lg-2-4" style={{ flex: "1 1 220px" }}>
          <KpiCard
            icon={<Icon.Building size={18} />}
            label="Customers"
            value={loading ? "…" : customers.length}
            tint={{ bg: "var(--neutral-bg)", fg: "var(--brand-purple)" }}
          />
        </div>
        <div className="col-md-4" style={{ flex: "1 1 220px" }}>
          <KpiCard
            icon={<Icon.FileText size={18} />}
            label="Sales Orders"
            value={loading ? "…" : orders.length}
            tint={{ bg: "#e0e7ff", fg: "var(--brand-blue)" }}
            delta={pendingOrders ? `${pendingOrders} pending approval` : null}
            deltaDir="down"
          />
        </div>
        <div className="col-md-4" style={{ flex: "1 1 220px" }}>
          <KpiCard
            icon={<Icon.Truck size={18} />}
            label="Deliveries"
            value={loading ? "…" : deliveries.length}
            tint={{ bg: "#fef3c7", fg: "var(--warning)" }}
          />
        </div>
        <div className="col-md-4" style={{ flex: "1 1 220px" }}>
          <KpiCard
            icon={<Icon.CreditCard size={18} />}
            label="Invoices"
            value={loading ? "…" : invoices.length}
            tint={{ bg: "var(--success-bg)", fg: "var(--success)" }}
          />
        </div>
        <div className="col-md-4" style={{ flex: "1 1 220px" }}>
          <KpiCard
            icon={<Icon.Wallet size={18} />}
            label="Revenue Collected"
            value={loading ? "…" : `${revenueCurrency} ${totalRevenue.toLocaleString()}`.trim()}
            tint={{ bg: "#fee2e2", fg: "var(--brand-red)" }}
          />
        </div>
      </div>

      {/* SECOND ROW — RECENT ACTIVITY */}
      <div className="row g-3 mt-1">
        <div className="col-md-4">
          <ActivityCard title="Recent Customers" icon={<Icon.Building size={16} />}>
            {customers.length === 0 ? (
              <p className="text-muted mb-0" style={{ fontSize: 13.5 }}>No customers yet.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {customers.slice(0, 5).map((c, i) => (
                  <li key={i} className="list-group-item border-0 px-0 py-2">
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.customer_name}</div>
                    <small className="text-muted">{c.customer_code || "Customer profile"}</small>
                  </li>
                ))}
              </ul>
            )}
          </ActivityCard>
        </div>

        <div className="col-md-4">
          <ActivityCard title="Recent Invoices" icon={<Icon.FileText size={16} />}>
            {invoices.length === 0 ? (
              <p className="text-muted mb-0" style={{ fontSize: 13.5 }}>No invoices yet.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {invoices.slice(0, 5).map((inv, i) => (
                  <li key={i} className="list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center">
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{inv.invoice_number}</div>
                    <StatusPill status={inv.status} />
                  </li>
                ))}
              </ul>
            )}
          </ActivityCard>
        </div>

        <div className="col-md-4">
          <ActivityCard title="Recent Payments" icon={<Icon.Wallet size={16} />}>
            {payments.length === 0 ? (
              <p className="text-muted mb-0" style={{ fontSize: 13.5 }}>No payments yet.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {payments.slice(0, 5).map((p, i) => (
                  <li key={i} className="list-group-item border-0 px-0 py-2">
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.payment_reference || `Payment #${i + 1}`}</div>
                    <small className="text-muted">Amount: {Number(p.amount_paid || 0).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            )}
          </ActivityCard>
        </div>
      </div>

      {/* SYSTEM STATUS */}
      <div className="card mt-3">
        <div className="p-3 d-flex align-items-start gap-3">
          <div
            style={{
              width: 36, height: 36, borderRadius: 10, background: "var(--success-bg)",
              color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <Icon.Check size={18} />
          </div>
          <div>
            <h5 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>System Status</h5>
            <p className="text-muted mb-0" style={{ fontSize: 13.5 }}>
              All Immortrix services are operational. 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;