import React, { useState } from "react";
import { Icon } from "../components/Icons";
import { PageHeader, FilterBar } from "../components/ui";

const ARTICLES = [
  {
    category: "Sales Orders",
    q: "How do I approve a sales order?",
    a: "Go to Sales → Orders. Orders created from the field app arrive as Pending. Click View on a pending order, then Approve or Cancel. Only Approved orders can be turned into a delivery or invoice.",
  },
  {
    category: "Deliveries",
    q: "Why is the Sales Order dropdown empty when creating a delivery?",
    a: "Only Approved sales orders show up here. If you just created an order, approve it first on the Sales Orders page, then come back and it will appear in the list.",
  },
  {
    category: "Invoices",
    q: "How do I create an invoice?",
    a: "Go to Sales → Invoices → Create Invoice, pick the approved Sales Order it's billing, set the due date, and save. The invoice number is suggested automatically but can be edited.",
  },
  {
    category: "Payments",
    q: "What does \"Pay on account\" mean?",
    a: "It's for a customer paying before there's an invoice yet — pick Customer instead of Invoice/Order when recording the payment. It's saved as unallocated and can be matched to an invoice later, the same way SAP Business One's Incoming Payment screen works.",
  },
  {
    category: "Timesheet",
    q: "What happens if a rep forgets to stop their day?",
    a: "The system is designed to auto-close it at midnight so the timesheet doesn't stay open indefinitely. If a rep's start/stop times look wrong, back office can correct them from the Timesheet page.",
  },
  {
    category: "Visits",
    q: "A rep forgot to check out before checking in elsewhere — what do I do?",
    a: "Back office can force-close ( override ) a stuck check-in from the Visits page so the rep isn't blocked from checking into their next stop.",
  },
  {
    category: "Customers",
    q: "Why can't I type my own customer code?",
    a: "A code is suggested automatically to avoid two reps accidentally creating the same code while working offline. You can still edit the suggested value before saving if you need a specific format.",
  },
  {
    category: "Masters",
    q: "I added a Tax / Price List / Warehouse but it's not visible elsewhere in the app.",
    a: "Masters data (Taxes, Price Lists, Currencies, etc.) needs to be marked Active to show up in dropdowns on other pages. Double check the Status column on the Masters page you edited.",
  },
  {
    category: "Reports & Dashboard",
    q: "The numbers on Dashboard and Reports don't match what I see elsewhere.",
    a: "Both pages read from the same underlying data as the rest of the app, so they should always agree. If they don't, check for a red error banner at the top of the page — it means one of the underlying requests failed to load and the totals are incomplete.",
  },
  {
    category: "Account",
    q: "Does logging out stop my active day/timesheet session?",
    a: "No — logging out only clears your login on this device. Your start/stop day session keeps running on the server, so you can log back in later and pick up right where you left off.",
  },
];

function HelpCenter() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const filtered = ARTICLES.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.q.toLowerCase().includes(q) || a.a.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
  });

  const grouped = filtered.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Help Center"
        subtitle="Quick answers for common questions about Goandroy."
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search help articles..."
      />

      {Object.keys(grouped).length === 0 && (
        <div className="card p-4 text-center text-muted">No articles match "{search}".</div>
      )}

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-3">
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
            {category}
          </div>
          <div className="card p-0">
            {items.map((item, i) => {
              const key = category + i;
              const isOpen = openIndex === key;
              return (
                <div
                  key={key}
                  style={{ borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}
                  className="p-3"
                  onClick={() => setOpenIndex(isOpen ? null : key)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.q}</div>
                    <Icon.ChevronDown size={15} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "0.15s" }} />
                  </div>
                  {isOpen && (
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="card p-4 mt-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Still stuck?</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Use the thumbs-down / feedback option if something here is wrong, or reach your admin for account-specific issues.
          </div>
        </div>
        <Icon.HelpCircle size={28} />
      </div>
    </div>
  );
}

export default HelpCenter;