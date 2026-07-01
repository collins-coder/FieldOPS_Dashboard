import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const role = localStorage.getItem("role");

  const [open, setOpen] = useState({
    sales: true,
    ops: false,
    masters: false,
    admin: false,
    analytics: false
  });

  const toggle = (key) => {
    setOpen({ ...open, [key]: !open[key] });
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  const linkStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    padding: "11px 14px",
    marginBottom: "6px",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    color: isActive(path) ? "#ffffff" : "#cbd5e1",
    background: isActive(path) ? "#2563eb" : "transparent",
    transition: "0.3s"
  });

  const sectionTitle = {
    marginTop: "18px",
    marginBottom: "10px",
    cursor: "pointer",
    color: "#94a3b8",
    fontWeight: "700",
    fontSize: "12px",
    letterSpacing: "1px"
  };

  return (
    <div
      style={{
        width: "280px",
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: "22px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #1e293b"
      }}
    >

      {/* LOGO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "25px"
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg,#2563eb,#06b6d4)"
          }}
        />

        <div>
          <h3
            style={{
              margin: 0,
              fontWeight: "700",
              fontSize: "24px"
            }}
          >
            FieldOPS
          </h3>

          <small style={{ color: "#94a3b8" }}>
            Enterprise Platform
          </small>
        </div>
      </div>

      {/* USER */}
      <div
        style={{
          background: "#111827",
          padding: "14px",
          borderRadius: "12px",
          marginBottom: "20px"
        }}
      >
        <div style={{ fontWeight: "600" }}>
          {role?.toUpperCase()}
        </div>

        <small style={{ color: "#94a3b8" }}>
          Active Session
        </small>
      </div>

      {/* MAIN LINKS */}
      <Link to="/" style={linkStyle("/")}>
        Dashboard
      </Link>

      <Link to="/customers" style={linkStyle("/customers")}>
        Customers
      </Link>

      {/* SALES */}
      <div onClick={() => toggle("sales")} style={sectionTitle}>
        SALES MANAGEMENT
      </div>

      {open.sales && (
        <div style={{ marginLeft: "5px" }}>
          <Link to="/items" style={linkStyle("/items")}>
            Items
          </Link>

          <Link to="/sales-orders" style={linkStyle("/sales-orders")}>
            Sales Orders
          </Link>

          <Link to="/deliveries" style={linkStyle("/deliveries")}>
            Deliveries
          </Link>

          <Link to="/invoices" style={linkStyle("/invoices")}>
            Invoices
          </Link>

          <Link to="/payments" style={linkStyle("/payments")}>
            Payments
          </Link>
        </div>
      )}

      {/* OPERATIONS */}
      <div onClick={() => toggle("ops")} style={sectionTitle}>
        FIELD OPERATIONS
      </div>

      {open.ops && (
        <div style={{ marginLeft: "5px" }}>
          <Link to="/timesheet" style={linkStyle("/timesheet")}>
            Timesheet
          </Link>

          <Link to="/trips" style={linkStyle("/trips")}>
            Trips
          </Link>

          <Link to="/visits" style={linkStyle("/visits")}>
            Visits
          </Link>
        </div>
      )}

      {/* MASTERS */}
      {["admin", "developer"].includes(role) && (
        <>
          <div onClick={() => toggle("masters")} style={sectionTitle}>
            MASTER DATA
          </div>

          {open.masters && (
            <div style={{ marginLeft: "5px" }}>
              <Link to="/price-lists" style={linkStyle("/price-lists")}>
                Price Lists
              </Link>

              <Link to="/taxes" style={linkStyle("/taxes")}>
                Taxes
              </Link>

              <Link to="/currency" style={linkStyle("/currency")}>
                Currency
              </Link>

              <Link to="/payment-terms" style={linkStyle("/payment-terms")}>
                Payment Terms
              </Link>

              <Link to="/warehouses" style={linkStyle("/warehouses")}>
                Warehouses
              </Link>

              <Link to="/countries" style={linkStyle("/countries")}>
                Countries
              </Link>

              <Link to="/regions" style={linkStyle("/regions")}>
                Regions
              </Link>

              <Link to="/routes" style={linkStyle("/routes")}>
                Routes
              </Link>
            </div>
          )}
        </>
      )}

      {/* ADMIN */}
      {["admin", "developer"].includes(role) && (
        <>
          <div onClick={() => toggle("admin")} style={sectionTitle}>
            ADMINISTRATION
          </div>

          {open.admin && (
            <div style={{ marginLeft: "5px" }}>
              <Link to="/users" style={linkStyle("/users")}>
                Users
              </Link>
            </div>
          )}
        </>
      )}

      {/* ANALYTICS */}
      {["admin", "developer", "supervisor"].includes(role) && (
        <>
          <div onClick={() => toggle("analytics")} style={sectionTitle}>
            ANALYTICS
          </div>

          {open.analytics && (
            <div style={{ marginLeft: "5px" }}>
              <Link to="/reports" style={linkStyle("/reports")}>
                Reports
              </Link>
            </div>
          )}
        </>
      )}

      {/* SYSTEM LOGS */}
      {role === "developer" && (
        <>
          <div style={sectionTitle}>
            DEVELOPER
          </div>

          <Link to="/logs" style={linkStyle("/logs")}>
            System Logs
          </Link>
        </>
      )}
    </div>
  );
}

export default Sidebar;