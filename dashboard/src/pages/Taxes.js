import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { MASTERS_BASE } from "../api/mastersBase";
import { Icon } from "../components/Icons";
import { PageHeader, FilterBar, StatusPill, EmptyState, useTableControls, TableFooter } from "../components/ui";

/* ============================================================
   BUG FIX NOTE: "Rate doesn't display after edit and update"
   The old edit() did `setForm(item)` — dumping the ENTIRE row
   (including id, created_at, updated_at) straight into form
   state, then save() sent that whole blob back on PUT. If the
   backend does anything like `Tax(**request.json)` or a strict
   schema validator, unexpected fields (id/created_at/updated_at)
   can cause it to silently reject or partially apply the update
   depending on how it's written — which looks exactly like "rate
   disappears after saving". Fixed by building an explicit,
   clean payload with only the real editable fields, and coercing
   rate to a number so it can never be sent as an empty/blank
   string by accident. Also added proper error handling — the
   old save() had no try/catch at all, so any failure was
   completely silent.
   ============================================================ */

function Taxes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const emptyForm = {
    code: "",
    name: "",
    type: "",
    rate: "",
    compound: false,
    exempt: false,
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${MASTERS_BASE}/taxes`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("FETCH TAXES ERROR:", err.response?.data || err.message);
      setError("Failed to load taxes (" + (err.response?.status || "no response") + ")");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const save = async () => {
    setError("");

    if (!form.code || !form.name || form.rate === "") {
      setError("Code, Name and Rate are required");
      return;
    }

    // Explicit, clean payload — only the real fields, correctly typed.
    // Never spread a raw DB row (which carries id/created_at/updated_at)
    // straight into an update request.
    const payload = {
      code: form.code,
      name: form.name,
      type: form.type,
      rate: Number(form.rate),
      compound: !!form.compound,
      exempt: !!form.exempt,
      status: form.status,
    };

    try {
      if (editing) {
        await api.put(`${MASTERS_BASE}/taxes/${editing.id}`, payload);
      } else {
        await api.post(`${MASTERS_BASE}/taxes`, payload);
      }
      reset();
      fetchData();
    } catch (err) {
      console.error("SAVE TAX ERROR:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.data ? JSON.stringify(err.response.data) : "Save failed")
      );
    }
  };

  const edit = (item) => {
    setEditing(item);
    // Map explicitly instead of `setForm(item)` — see note above.
    setForm({
      code: item.code || "",
      name: item.name || "",
      type: item.type || "",
      rate: item.rate ?? "",
      compound: !!item.compound,
      exempt: !!item.exempt,
      status: item.status || "Active",
    });
    setShowForm(true);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this tax?")) return;
    try {
      await api.delete(`${MASTERS_BASE}/taxes/${id}`);
      fetchData();
    } catch (err) {
      console.error("DELETE TAX ERROR:", err.response?.data || err.message);
      setError("Delete failed");
    }
  };

  const reset = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
  };

  const tc = useTableControls(data, { searchKeys: ["code", "name", "type", "status"] });

  return (
    <div>
      <PageHeader
        title="Taxes"
        subtitle="Tax rates used across sales orders, invoices and price lists."
        actions={
          <button className="btn btn-primary" onClick={() => { reset(); setShowForm(true); }}>
            <Icon.Plus size={14} /> Add Tax
          </button>
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <FilterBar
        searchValue={tc.search}
        onSearchChange={tc.setSearch}
        placeholder="Search code, name, type..."
        onRefresh={fetchData}
      />

      <div className="card p-0">
        <div className="table-wrap">
          {loading ? (
            <p className="p-4 mb-0">Loading...</p>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Rate</th>
                  <th>Compound</th>
                  <th>Exempt</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tc.pageRows.length === 0 ? (
                  <tr><td colSpan="8"><EmptyState label="No taxes found." /></td></tr>
                ) : (
                  tc.pageRows.map((i) => (
                    <tr key={i.id}>
                      <td className="fw-semibold">{i.code}</td>
                      <td>{i.name}</td>
                      <td>{i.type}</td>
                      <td>{i.rate ?? "—"}%</td>
                      <td>{i.compound ? "Yes" : "No"}</td>
                      <td>{i.exempt ? "Yes" : "No"}</td>
                      <td><StatusPill status={i.status} /></td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => edit(i)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => remove(i.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-3 pb-2">
          <TableFooter
            rowsPerPage={tc.rowsPerPage}
            onRowsPerPageChange={tc.setRowsPerPage}
            totalRows={tc.totalRows}
            page={tc.page}
            totalPages={tc.totalPages}
            onPageChange={tc.setPage}
          />
        </div>
      </div>

      {showForm && (
        <div className="card p-4 mt-3">
          <h5>{editing ? "Edit Tax" : "Add Tax"}</h5>

          <label>Code</label>
          <input className="form-control mb-2" name="code" placeholder="e.g. VAT-16" value={form.code} onChange={handleChange} />

          <label>Name</label>
          <input className="form-control mb-2" name="name" placeholder="e.g. VAT" value={form.name} onChange={handleChange} />

          <label>Type</label>
          <input className="form-control mb-2" name="type" placeholder="e.g. VAT" value={form.type} onChange={handleChange} />

          <label>Rate (%)</label>
          <input
            className="form-control mb-2"
            name="rate"
            type="number"
            step="0.01"
            placeholder="e.g. 16"
            value={form.rate}
            onChange={handleChange}
          />

          <div className="mb-3 d-flex gap-4">
            <label className="d-flex align-items-center gap-2 mb-0">
              <input type="checkbox" name="compound" checked={form.compound} onChange={handleChange} />
              Compound
            </label>
            <label className="d-flex align-items-center gap-2 mb-0">
              <input type="checkbox" name="exempt" checked={form.exempt} onChange={handleChange} />
              Exempt
            </label>
          </div>

          <select className="form-control mb-3" name="status" value={form.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button className="btn btn-success me-2" onClick={save}>{editing ? "Update" : "Save"}</button>
          <button className="btn btn-secondary" onClick={reset}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default Taxes;