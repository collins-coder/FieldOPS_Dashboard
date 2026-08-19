import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "./Icons";
import logo from "../logo.jpeg"; // adjust path if needed

function Sidebar({ collapsed, onNavigate }) {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username") || "User";

  const isAdmin = ["admin", "developer"].includes(role);
  const isAnalyst = ["admin", "developer", "supervisor"].includes(role);

  const [open, setOpen] = useState({
    sales: true,
    ops: true,
    masters: false,
    tripsRoutes: false,
    iam: false,
    other: false,
  });

  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const NavLink = ({ to, icon, children }) => (
    <Link to={to} className={`sidebar-link ${isActive(to) ? "active" : ""}`} onClick={onNavigate}>
      <span className="icon">{icon}</span>
      {!collapsed && <span>{children}</span>}
    </Link>
  );

  const GroupToggle = ({ id, icon, label }) => (
    <div className="sidebar-group-toggle" onClick={() => toggle(id)}>
      <span className="left">
        <span className="icon">{icon}</span>
        {!collapsed && <span>{label}</span>}
      </span>
      {!collapsed && (
        <span className="icon">
          {open[id] ? <Icon.ChevronDown size={14} /> : <Icon.ChevronRight size={14} />}
        </span>
      )}
    </div>
  );

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-inner scroll-thin">

        {/* LOGO */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark" style={{ background: "transparent", padding: 0 }}>
            <img
              src={logo}
              alt="Immortrix Logo"
              style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }}
            />
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <h1>Immortrix</h1>
              <small>Field Sales Platform</small>
            </div>
          )}
        </div>

        {/* GENERAL */}
        {!collapsed && <div className="sidebar-section-label">General</div>}
        <NavLink to="/" icon={<Icon.Dashboard size={17} />}>Dashboard</NavLink>
        <NavLink to="/customers" icon={<Icon.Building size={17} />}>Customers</NavLink>

        {/* SALES */}
        <GroupToggle id="sales" icon={<Icon.Cart size={17} />} label="Sales" />
        {open.sales && (
          <div className="sidebar-group-children">
            <NavLink to="/items" icon={<Icon.Box size={16} />}>Items</NavLink>
            <NavLink to="/sales-orders" icon={<Icon.FileText size={16} />}>Orders</NavLink>
            <NavLink to="/deliveries" icon={<Icon.Truck size={16} />}>Deliveries</NavLink>
            {isAdmin && (
              <NavLink to="/invoices" icon={<Icon.FileText size={16} />}>Invoices</NavLink>
            )}
            <NavLink to="/payments" icon={<Icon.Wallet size={16} />}>Payments</NavLink>
          </div>
        )}

        {/* REPORTS */}
        {isAnalyst && (
          <NavLink to="/reports" icon={<Icon.BarChart size={17} />}>Reports</NavLink>
        )}

        {/* MASTERS */}
        {isAdmin && (
          <>
            <GroupToggle id="masters" icon={<Icon.Layers size={17} />} label="Masters" />
            {open.masters && (
              <div className="sidebar-group-children">
                <NavLink to="/price-lists" icon={<Icon.CreditCard size={16} />}>Price Lists</NavLink>
                <NavLink to="/taxes" icon={<Icon.FileText size={16} />}>Taxes</NavLink>
                <NavLink to="/currency" icon={<Icon.Wallet size={16} />}>Currency</NavLink>
                <NavLink to="/payment-terms" icon={<Icon.FileText size={16} />}>Payment Terms</NavLink>
                <NavLink to="/warehouses" icon={<Icon.Box size={16} />}>Warehouses</NavLink>
                <NavLink to="/countries" icon={<Icon.MapPin size={16} />}>Countries</NavLink>
                <NavLink to="/regions" icon={<Icon.MapPin size={16} />}>Regions</NavLink>
              </div>
            )}
          </>
        )}

        {/* TRIPS AND ROUTES */}
        <GroupToggle id="tripsRoutes" icon={<Icon.Route size={17} />} label="Trips and Routes" />
        {open.tripsRoutes && (
          <div className="sidebar-group-children">
            <NavLink to="/trips" icon={<Icon.Truck size={16} />}>Trips</NavLink>
            <NavLink to="/routes" icon={<Icon.Route size={16} />}>Routes</NavLink>
          </div>
        )}

        {/* TRACKING */}
        <GroupToggle id="ops" icon={<Icon.MapPin size={17} />} label="Tracking" />
        {open.ops && (
          <div className="sidebar-group-children">
            <NavLink to="/visits" icon={<Icon.MapPin size={16} />}>Visits</NavLink>
            <NavLink to="/timesheet" icon={<Icon.Clock size={16} />}>Timesheet</NavLink>
          </div>
        )}

        {/* IAM */}
        {isAdmin && (
          <>
            <GroupToggle id="iam" icon={<Icon.Shield size={17} />} label="IAM" />
            {open.iam && (
              <div className="sidebar-group-children">
                <NavLink to="/users" icon={<Icon.Users size={16} />}>Users</NavLink>
              </div>
            )}
          </>
        )}

        <NavLink to="#" icon={<Icon.Bell size={17} />}>Notifications</NavLink>

        {/* OTHER */}
        {!collapsed && <div className="sidebar-section-label">Other</div>}
        <GroupToggle id="other" icon={<Icon.Settings size={17} />} label="Settings" />
        {open.other && (
          <div className="sidebar-group-children">
            <NavLink to="/settings" icon={<Icon.Settings size={16} />}>General Settings</NavLink>
            {role === "developer" && (
              <NavLink to="/logs" icon={<Icon.FileText size={16} />}>System Logs</NavLink>
            )}
          </div>
        )}
        <NavLink to="/help" icon={<Icon.HelpCircle size={17} />}>Help Center</NavLink>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <div className="avatar-circle">{username.charAt(0).toUpperCase()}</div>
          {!collapsed && (
            <div className="sidebar-footer-text">
              <div className="name">{username}</div>
              <div className="email">{role}</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Sidebar;