import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./Login";
import Sidebar from "./components/Sidebar";
import { Icon } from "./components/Icons";

/* DASHBOARD */
import DashboardHome from "./pages/DashboardHome";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";

/* SALES */
import Items from "./pages/Items";
import SalesOrders from "./pages/SalesOrders";
import SalesOrderDetail from "./pages/SalesOrderDetail";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import Payments from "./pages/Payments";
import PaymentDetail from "./pages/PaymentDetail";
import Deliveries from "./pages/Deliveries";
import DeliveryDetail from "./pages/DeliveryDetail";

/* OPERATIONS */
import Trips from "./pages/Trips";
import Visits from "./pages/Visits";
import Timesheet from "./pages/Timesheet";

/* MASTERS */
import PriceLists from "./pages/PriceLists";
import Regions from "./pages/Regions";
import RoutesPage from "./pages/RoutesPage";
import Taxes from "./pages/Taxes";
import Currency from "./pages/Currencies";
import PaymentTerms from "./pages/PaymentTerms";
import Warehouses from "./pages/Warehouses";
import Countries from "./pages/Countries";

/* ADMIN */
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
/* REPORTS / LOGS */
import Reports from "./pages/Reports";
import SystemLogs from "./pages/SystemLogs";
import GeneralSettings from "./pages/GeneralSettings";
import HelpCenter from "./pages/HelpCenter";

import "bootstrap/dist/css/bootstrap.min.css";

/* ================= PROTECTED ROUTE ================= */
function Protected({ allowed, children }) {
  const role = localStorage.getItem("role");

  if (!role || !allowed.includes(role)) {
    return (
      <div style={{ padding: 20 }}>
        <h4>Access Denied</h4>
        <p>You don't have permission to access this module.</p>
      </div>
    );
  }

  return children;
}

/* ================= APP ================= */
function App() {
  const [token, setToken] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("token");

    setToken(stored && stored !== "null" ? stored : null);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  return (
    <Router>

      <div className="app-shell">

        {/* SIDEBAR */}
        <Sidebar collapsed={sidebarCollapsed} />

        {/* MAIN CONTENT */}
        <div className="app-main">

          {/* TOP NAVBAR */}
          <div className="topbar">

            {/* LEFT: collapse toggle + workspace */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                className="topbar-btn"
                onClick={() => setSidebarCollapsed((v) => !v)}
                title="Toggle sidebar"
              >
                <Icon.PanelLeft size={17} />
              </div>

              <div className="workspace-pill">
                <Icon.Building size={15} />
                Head Office
                <Icon.ChevronDown size={13} />
              </div>
            </div>

            {/* SEARCH */}
            <div className="topbar-search">
              <Icon.Search size={15} />
              <input type="text" placeholder="Search customers, orders, invoices..." />
              <span className="kbd-hint">⌘K</span>
            </div>

            {/* RIGHT SIDE */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>

              <div className="topbar-icon-btn" title="Notifications">
                <Icon.Bell size={18} />
                <span className="notif-dot" />
              </div>

              <div className="topbar-icon-btn" title="Toggle theme">
                <Icon.Sun size={18} />
              </div>

              <div className="topbar-icon-btn" title="Settings">
                <Icon.Settings size={18} />
              </div>

              <div style={{ width: "1px", height: "26px", background: "var(--border)", margin: "0 6px" }} />

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="avatar-circle">{username?.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13.5px", color: "var(--text-primary)" }}>
                    {username}
                  </div>
                  <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>{role}</small>
                </div>
              </div>

              <button className="btn btn-danger btn-sm" style={{ marginLeft: "10px" }} onClick={handleLogout}>
                <Icon.LogOut size={14} /> Logout
              </button>

            </div>

          </div>

          {/* PAGE CONTENT */}
          <div className="app-content">

            <Routes>

              {/* DASHBOARD */}
              <Route path="/" element={<DashboardHome />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />

              {/* SALES */}
              <Route path="/items" element={<Items />} />
              <Route path="/sales-orders" element={<SalesOrders />} />
              <Route path="/sales-orders/:id" element={<SalesOrderDetail />} />
              <Route path="/deliveries" element={<Deliveries />} />
              <Route path="/deliveries/:id" element={<DeliveryDetail />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/payments/:id" element={<PaymentDetail />} />

              <Route
                path="/invoices"
                element={
                  <Protected allowed={["admin", "developer"]}>
                    <Invoices />
                  </Protected>
                }
              />
              <Route
                path="/invoices/:id"
                element={
                  <Protected allowed={["admin", "developer"]}>
                    <InvoiceDetail />
                  </Protected>
                }
              />

              {/* OPERATIONS */}
              <Route path="/timesheet" element={<Timesheet />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/visits" element={<Visits />} />

              {/* MASTERS */}
              <Route path="/price-lists" element={<PriceLists />} />
              <Route path="/regions" element={<Regions />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/taxes" element={<Taxes />} />
              <Route path="/currency" element={<Currency />} />
              <Route path="/payment-terms" element={<PaymentTerms />} />
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/countries" element={<Countries />} />

              {/* ADMIN */}
              <Route
                path="/users"
                element={
                  <Protected allowed={["admin", "developer"]}>
                    <Users />
                  </Protected>
                }
              />

              <Route
    path="/users/:id"
    element={
        <Protected allowed={["admin", "developer"]}>
            <UserDetails />
        </Protected>
    }
/>

              {/* REPORTS */}
              <Route path="/reports" element={<Reports />} />

              {/* LOGS */}
              <Route
                path="/logs"
                element={
                  <Protected allowed={["developer"]}>
                    <SystemLogs />
                  </Protected>
                }
              />

              {/* SETTINGS & HELP */}
              <Route path="/settings" element={<GeneralSettings />} />
              <Route path="/help" element={<HelpCenter />} />

              {/* FALLBACK */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>

          </div>

        </div>

      </div>

    </Router>
  );
}

export default App;