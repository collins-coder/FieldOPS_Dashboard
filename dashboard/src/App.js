import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./Login";
import Sidebar from "./components/Sidebar";

/* DASHBOARD */
import DashboardHome from "./pages/DashboardHome";
import Customers from "./pages/Customers";

/* SALES */
import Items from "./pages/Items";
import SalesOrders from "./pages/SalesOrders";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Deliveries from "./pages/Deliveries";

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

/* REPORTS / LOGS */
import Reports from "./pages/Reports";
import SystemLogs from "./pages/SystemLogs";

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

      <div
        style={{
          display: "flex",
          background: "#f1f5f9"
        }}
      >

        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh"
          }}
        >

          {/* TOP NAVBAR */}
          <div
            style={{
              height: "75px",
              background: "#ffffff",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 30px",
              position: "sticky",
              top: 0,
              zIndex: 1000
            }}
          >

            {/* SEARCH */}
            <div
              style={{
                width: "320px"
              }}
            >
              <input
                type="text"
                placeholder="Search customers, invoices..."
                className="form-control"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  padding: "10px 15px"
                }}
              />
            </div>

            {/* RIGHT SIDE */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px"
              }}
            >

              {/* NOTIFICATION */}
              <div
                style={{
                  fontSize: "20px",
                  cursor: "pointer"
                }}
              >
                🔔
              </div>

              {/* USER */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
              >

                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "#2563eb",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700"
                  }}
                >
                  {username?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#0f172a"
                    }}
                  >
                    {username}
                  </div>

                  <small
                    style={{
                      color: "#64748b"
                    }}
                  >
                    {role}
                  </small>
                </div>

              </div>

              {/* LOGOUT */}
              <button
                className="btn btn-danger"
                style={{
                  borderRadius: "10px",
                  padding: "10px 18px"
                }}
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>

          </div>

          {/* PAGE CONTENT */}
          <div
            style={{
              padding: "25px"
            }}
          >

            <Routes>

              {/* DASHBOARD */}
              <Route path="/" element={<DashboardHome />} />
              <Route path="/customers" element={<Customers />} />

              {/* SALES */}
              <Route path="/items" element={<Items />} />
              <Route path="/sales-orders" element={<SalesOrders />} />
              <Route path="/deliveries" element={<Deliveries />} />
              <Route path="/payments" element={<Payments />} />

              <Route
                path="/invoices"
                element={
                  <Protected allowed={["admin", "developer"]}>
                    <Invoices />
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