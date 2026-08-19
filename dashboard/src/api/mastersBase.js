// Base path prefix used by every "Masters" page (Price Lists, Taxes,
// Currencies, Countries, Payment Terms, Warehouses, Regions, Routes).
//
// CONFIRMED from `flask routes` output (2026-08-08) — your backend's real
// routes are:
//   GET/POST   /api/countries        GET/PUT/DELETE /api/countries/<id>
//   GET/POST   /api/currencies       GET/PUT/DELETE /api/currencies/<id>
//   GET/POST   /api/payment-terms    GET/PUT/DELETE /api/payment-terms/<id>
//   GET/POST   /api/price-lists      GET/PUT/DELETE /api/price-lists/<id>
//   GET/POST   /api/regions          GET/PUT/DELETE /api/regions/<id>
//   GET/POST   /api/routes           GET/PUT/DELETE /api/routes/<id>
//   GET/POST   /api/taxes            GET/PUT/DELETE /api/taxes/<id>
//   GET/POST   /api/warehouses       GET/PUT/DELETE /api/warehouses/<id>
//
// The earlier "/admin" guess was wrong — turns out the ORIGINAL code (before
// any of these fixes) had the right path prefix all along ("/api"); the only
// real bug there was the missing auth header, which is fixed in
// api/axiosConfig.js. Sorry for the churn — this is now confirmed, not a
// guess, so it shouldn't need to change again unless your backend routes do.
export const MASTERS_BASE = "/api";