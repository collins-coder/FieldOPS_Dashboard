import React from "react";

/* Minimal inline-SVG icon set — avoids adding an icon library dependency.
   Usage: <Icon.Dashboard size={18} /> */

const base = (children, props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 18}
    height={props.size || 18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const Icon = {
  Dashboard: (p = {}) => base(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>, p),
  Cart: (p = {}) => base(<><circle cx="9" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6" /></>, p),
  Box: (p = {}) => base(<><path d="M21 8l-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>, p),
  Truck: (p = {}) => base(<><rect x="1" y="6" width="14" height="11" rx="1.5" /><path d="M15 10h4l3 3v4h-7z" /><circle cx="6" cy="19" r="1.7" /><circle cx="17.5" cy="19" r="1.7" /></>, p),
  FileText: (p = {}) => base(<><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h6M9 9h2" /></>, p),
  CreditCard: (p = {}) => base(<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>, p),
  BarChart: (p = {}) => base(<><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12" y="8" width="3" height="10" /><rect x="17" y="5" width="3" height="13" /></>, p),
  Layers: (p = {}) => base(<><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>, p),
  Route: (p = {}) => base(<><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.3 19H15a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4H8.7" /></>, p),
  MapPin: (p = {}) => base(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>, p),
  Shield: (p = {}) => base(<path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z" />, p),
  Users: (p = {}) => base(<><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17.5" cy="9" r="2.6" /><path d="M15 13.2A5.5 5.5 0 0 1 21.5 18" /></>, p),
  Check: (p = {}) => base(<><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.4 2.4 4.6-5.4" /></>, p),
  Bell: (p = {}) => base(<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>, p),
  Plug: (p = {}) => base(<><path d="M9 2v5M15 2v5" /><path d="M6 7h12v4a6 6 0 0 1-12 0V7Z" /><path d="M12 17v5" /></>, p),
  Settings: (p = {}) => base(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z" /></>, p),
  HelpCircle: (p = {}) => base(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .8-1 1.7" /><path d="M12 17.5h.01" /></>, p),
  ChevronDown: (p = {}) => base(<path d="m6 9 6 6 6-6" />, p),
  ChevronRight: (p = {}) => base(<path d="m9 6 6 6-6 6" />, p),
  Menu: (p = {}) => base(<><path d="M4 6h16M4 12h16M4 18h16" /></>, p),
  PanelLeft: (p = {}) => base(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></>, p),
  Search: (p = {}) => base(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>, p),
  Sun: (p = {}) => base(<><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" /></>, p),
  LogOut: (p = {}) => base(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>, p),
  Plus: (p = {}) => base(<path d="M12 5v14M5 12h14" />, p),
  Filter: (p = {}) => base(<path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z" />, p),
  Refresh: (p = {}) => base(<><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></>, p),
  Eye: (p = {}) => base(<><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="3" /></>, p),
  Building: (p = {}) => base(<><rect x="4" y="2" width="16" height="20" rx="1" /><path d="M9 22v-4h6v4M9 6h1M14 6h1M9 10h1M14 10h1M9 14h1M14 14h1" /></>, p),
  Clock: (p = {}) => base(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>, p),
  Wallet: (p = {}) => base(<><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3" /><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4a2 2 0 1 0 0 4h5" /></>, p),
  ArrowUp: (p = {}) => base(<path d="M12 19V5M5 12l7-7 7 7" />, p),
  ArrowDown: (p = {}) => base(<path d="M12 5v14M19 12l-7 7-7-7" />, p),
};

export default Icon;
