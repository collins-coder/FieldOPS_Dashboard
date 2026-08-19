import React, { useEffect, useState } from "react";
import { Icon } from "../components/Icons";
import { PageHeader } from "../components/ui";

/* ============================================================
   There's no /api/settings (or similar) route on the backend yet
   — it wasn't in the `flask routes` output — so there's nowhere
   to persist these server-side. These preferences are stored in
   this browser's localStorage only: they follow this device, not
   the user's account, and won't sync to the mobile app or another
   computer. Once a real settings endpoint exists, swap the
   localStorage calls below for api.get/api.put and this page's
   UI doesn't need to change at all.
   ============================================================ */

const KEY = "goandroy_settings";

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function SettingRow({ title, description, children }) {
  return (
    <div className="d-flex justify-content-between align-items-center py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 520 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{description}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function GeneralSettings() {
  const [settings, setSettings] = useState(loadSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div>
      <PageHeader
        title="General Settings"
        subtitle="Device preferences — stored locally in this browser until the backend adds a settings endpoint."
      />

      {saved && <div className="alert alert-success py-2">Saved</div>}

      <div className="card p-4">
        <SettingRow
          title="Default currency symbol"
          description="Used as a fallback on the Dashboard if a payment record doesn't carry its own currency."
        >
          <input
            className="form-control"
            style={{ width: 140 }}
            placeholder="e.g. KES"
            value={settings.defaultCurrency || ""}
            onChange={(e) => update("defaultCurrency", e.target.value)}
          />
        </SettingRow>

        <SettingRow
          title="Date format"
          description="How dates are displayed across list pages."
        >
          <select
            className="form-select"
            style={{ width: 180 }}
            value={settings.dateFormat || "DD/MM/YYYY"}
            onChange={(e) => update("dateFormat", e.target.value)}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </SettingRow>

        <SettingRow
          title="Default rows per page"
          description="Starting page size on list/table pages (you can still change it per-page)."
        >
          <select
            className="form-select"
            style={{ width: 120 }}
            value={settings.rowsPerPage || "10"}
            onChange={(e) => update("rowsPerPage", e.target.value)}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </SettingRow>

        <SettingRow
          title="Compact table density"
          description="Reduces row height on data tables — useful on smaller screens."
        >
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={!!settings.compact}
              onChange={(e) => update("compact", e.target.checked)}
            />
          </div>
        </SettingRow>
      </div>

      <div className="card p-4 mt-3">
        <div className="d-flex align-items-start gap-3">
          <div
            style={{
              width: 36, height: 36, borderRadius: 10, background: "var(--neutral-bg)",
              color: "var(--brand-purple)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <Icon.Plug size={17} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Company profile, users, roles &amp; SAP sync</div>
            <p className="text-muted mb-0" style={{ fontSize: 13 }}>
              These need real backend endpoints and aren't wired up yet — they're the "Soon" items
              you'll see elsewhere in the sidebar (User Types, Permissions, SAP Sync Settings, etc.).
              This page will grow to cover them as those endpoints get built.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneralSettings;