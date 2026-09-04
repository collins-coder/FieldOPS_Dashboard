import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./Icons";

/* =========================================================
   PageHeader — consistent title + subtitle + action slot
   ========================================================= */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="d-flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

/* =========================================================
   StatusPill — maps a status string to a themed pill
   ========================================================= */
const STATUS_MAP = {
  approved: "pill-success",
  active: "pill-success",
  completed: "pill-success",
  paid: "pill-success",
  synced: "pill-success",
  delivered: "pill-success",
  pending: "pill-warning",
  draft: "pill-warning",
  partial: "pill-warning",
  "in progress": "pill-warning",
  "not synced": "pill-muted",
  rejected: "pill-danger",
  cancelled: "pill-danger",
  overdue: "pill-danger",
  inactive: "pill-danger",
  failed: "pill-danger",
  open: "pill-info",
  closed: "pill-muted",
};

export function StatusPill({ status }) {
  if (!status) return <span className="pill pill-muted">—</span>;
  const key = String(status).toLowerCase();
  const cls = STATUS_MAP[key] || "pill-neutral";
  return <span className={`pill ${cls}`}>{status}</span>;
}

/* =========================================================
   FilterBar — search input + Add Filter + Refresh + View
   Fully wired: onSearch fires on change, onRefresh + onAddFilter
   are optional callbacks. Renders any extra controls via `right`.
   ========================================================= */
export function FilterBar({
  searchValue,
  onSearchChange,
  placeholder = "Search...",
  onRefresh,
  onAddFilter,
  right,
}) {
  return (
    <div className="filter-bar">
      <div className="search-input-wrap">
        <span className="search-icon"><Icon.Search size={15} /></span>
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="actions">
        {onAddFilter && (
          <button className="btn btn-light" onClick={onAddFilter}>
            <Icon.Filter size={14} /> Add Filter
          </button>
        )}
        {onRefresh && (
          <button className="btn btn-light" onClick={onRefresh}>
            <Icon.Refresh size={14} /> Refresh
          </button>
        )}
        {right}
      </div>
    </div>
  );
}

/* =========================================================
   useTableControls — search + sort + pagination in one hook.
   Keeps every list page's filter/search/pagination behaviour
   consistent and actually functional.
   ========================================================= */
export function useTableControls(rows, { searchKeys = [], initialRowsPerPage = 10 } = {}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) =>
      (searchKeys.length ? searchKeys : Object.keys(row || {})).some((k) =>
        String(row?.[k] ?? "").toLowerCase().includes(q)
      )
    );
  }, [rows, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a?.[sortKey] ?? "";
      const bv = b?.[sortKey] ?? "";
      if (av === bv) return 0;
      const res = av > bv ? 1 : -1;
      return sortDir === "asc" ? res : -res;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const clampedPage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (clampedPage - 1) * rowsPerPage,
    clampedPage * rowsPerPage
  );

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  return {
    search,
    setSearch: (v) => { setSearch(v); setPage(1); },
    sortKey,
    sortDir,
    toggleSort,
    page: clampedPage,
    setPage,
    rowsPerPage,
    setRowsPerPage: (v) => { setRowsPerPage(v); setPage(1); },
    totalPages,
    totalRows: sorted.length,
    pageRows,
  };
}

/* =========================================================
   SortableTh — clickable column header with sort arrows
   ========================================================= */
export function SortableTh({ label, sortKey, activeKey, dir, onSort, ...rest }) {
  const active = activeKey === sortKey;
  return (
    <th className="sortable" onClick={() => onSort(sortKey)} {...rest}>
      {label}{" "}
      <span style={{ opacity: active ? 1 : 0.35 }}>
        {active && dir === "desc" ? "↓" : "↑"}
      </span>
    </th>
  );
}

/* =========================================================
   TableFooter — rows-per-page + record count + pager
   ========================================================= */
export function TableFooter({
  rowsPerPage,
  onRowsPerPageChange,
  totalRows,
  page,
  totalPages,
  onPageChange,
}) {
  const start = totalRows === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalRows);

  return (
    <div className="table-footer">
      <div className="rows-select">
        <span>Rows per page</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span className="records-count">
          Showing {start}–{end} of {totalRows} records
        </span>
      </div>

      <div className="pager">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ‹ Previous
        </button>
        <button className="page-num active">{page}</button>
        <span className="records-count">of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next ›
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   EmptyState
   ========================================================= */
export function EmptyState({ label = "No records found" }) {
  return <div className="table-empty">{label}</div>;
}

/* =========================================================
   Toast — lightweight inline alert replacing window.alert-ish msgs
   ========================================================= */
export function Toast({ message, type = "info" }) {
  if (!message) return null;
  return <div className={`alert alert-${type}`}>{message}</div>;
}

/* =========================================================
   downloadExport — triggers an .xlsx download from an export
   endpoint that returns a binary file (send_file on the backend),
   not JSON. `api` here must be an axios instance already carrying
   the auth header (the shared one from api/axiosConfig.js).
   ========================================================= */
export async function downloadExport(api, url, fallbackFilename = "export.xlsx") {
  const res = await api.get(url, { responseType: "blob" });

  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = blobUrl;

  // Try to honor the filename the backend sent (Content-Disposition),
  // otherwise fall back to the caller's suggested name.
  const disposition = res.headers?.["content-disposition"];
  const match = disposition && disposition.match(/filename="?([^"]+)"?/);
  link.download = match ? match[1] : fallbackFilename;

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

/* =========================================================
   ExportButton — drop-in button for any list page. Handles the
   loading state and error surfacing itself so every page doesn't
   have to re-implement the same try/catch.
   ========================================================= */
export function ExportButton({ api, url, filename, label = "Export" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");
    try {
      await downloadExport(api, url, filename);
    } catch (err) {
      console.error("EXPORT ERROR:", err);
      setError("Export failed — check you're logged in and try again.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn btn-light" onClick={handleClick} disabled={loading}>
        {loading ? "Exporting..." : label}
      </button>
      {error && (
        <span className="text-brand-red" style={{ fontSize: 12, marginLeft: 8 }}>
          {error}
        </span>
      )}
    </>
  );
}

/* =========================================================
   DocStatusExplainer — SAP B1 draws a hard line between a
   document's lifecycle (Open/Closed — has it been copied to
   something else yet) and its own status (Pending/Approved/Paid
   etc — progress on the document itself). Showing them side by
   side with a one-line explanation is what stops "why does it say
   Pending" confusion: Pending here means "no payment yet", not
   "not approved" or "not real yet".
   ========================================================= */
export function DocStatusExplainer({ status, statusLabel = "Status", docStatus, explain }) {
  return (
    <div className="d-flex flex-wrap gap-4 align-items-start">
      <div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>
          {statusLabel}
        </div>
        <StatusPill status={status} />
      </div>
      {docStatus && (
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>
            Document
          </div>
          <StatusPill status={docStatus} />
        </div>
      )}
      {explain && (
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", maxWidth: 360, paddingTop: 2 }}>
          {explain}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   RelatedDocLink — one row in a document's "related documents"
   trail (SAP B1's base-document / target-document chain).
   ========================================================= */
export function RelatedDocLink({ icon, label, number, sub, to, onClick }) {
  const content = (
    <div className="d-flex align-items-center justify-content-between" style={{ padding: "10px 2px", cursor: "pointer" }}>
      <div className="d-flex align-items-center gap-2">
        {icon}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{label}: {number}</div>
          {sub && <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{sub}</div>}
        </div>
      </div>
      <span className="table-link">View →</span>
    </div>
  );

  if (to) {
    return <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>{content}</Link>;
  }
  return <div onClick={onClick}>{content}</div>;
}

/* =========================================================
   DocSection — a bordered card block used to group parts of a
   document detail page (header, line items, related docs, etc).
   ========================================================= */
export function DocSection({ title, actions, children }) {
  return (
    <div className="card p-4 mb-3">
      {title && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ fontWeight: 700, margin: 0 }}>{title}</h5>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}