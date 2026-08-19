import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { MASTERS_BASE } from "../api/mastersBase";
import { Icon } from "../components/Icons";
import { PageHeader, FilterBar, StatusPill, EmptyState, useTableControls, TableFooter } from "../components/ui";

// Turns "Nairobi West" into "NAI-WES" — a short, readable, mostly-unique
// suggested code. Still fully editable by the user before saving.
function suggestCode(name) {
  return name
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .map((word) => word.slice(0, 3))
    .join("-")
    .slice(0, 12);
}

function Regions() {
  const [data, setData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countriesError, setCountriesError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [codeTouched, setCodeTouched] = useState(false);

  const emptyForm = { code: "", name: "", country_id: "", status: "Active" };
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${MASTERS_BASE}/regions`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("FETCH REGIONS ERROR:", err.response?.data || err.message);
      setError("Failed to load regions (" + (err.response?.status || "no response") + ")");
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    setCountriesError("");
    try {
      const res = await api.get(`${MASTERS_BASE}/countries`);
      setCountries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("FETCH COUNTRIES ERROR:", err.response?.data || err.message);
      setCountriesError("Could not load countries for the dropdown (" + (err.response?.status || "no response") + ") — add a Country first on the Countries page.");
      setCountries([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCountries();
  }, []);

  // Look up a region's country name for the table — countries loaded
  // separately from regions, so we join them client-side here rather
  // than relying on the backend to have already embedded the name.
  const countryName = (region) => {
    if (region.country_name) return region.country_name;
    const match = countries.find((c) => String(c.id) === String(region.country_id));
    return match ? match.name : "—";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => {
      const next = { ...f, [name]: value };
      // Auto-suggest a code from the name, unless the user has already
      // typed their own code by hand.
      if (name === "name" && !codeTouched) {
        next.code = suggestCode(value);
      }
      return next;
    });
    if (name === "code") setCodeTouched(true);
  };

  const handleSave = async () => {
    setError("");

    if (!form.code || !form.name || !form.country_id) {
      setError("Code, Name and Country are all required");
      return;
    }

    const payload = {
      code: form.code,
      name: form.name,
      country_id: Number(form.country_id),
      status: form.status,
    };

    try {
      if (editing) {
        await api.put(`${MASTERS_BASE}/regions/${editing.id}`, payload);
      } else {
        await api.post(`${MASTERS_BASE}/regions`, payload);
      }
      reset();
      fetchData();
    } catch (err) {
      console.error("SAVE REGION ERROR:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.data ? JSON.stringify(err.response.data) : "Save failed")
      );
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setCodeTouched(true); // don't overwrite an existing code while editing
    setForm({
      code: item.code || "",
      name: item.name || "",
      country_id: item.country_id || "",
      status: item.status || "Active",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this region?")) return;
    try {
      await api.delete(`${MASTERS_BASE}/regions/${id}`);
      fetchData();
    } catch (err) {
      console.error("DELETE REGION ERROR:", err.response?.data || err.message);
      setError("Delete failed");
    }
  };

  const reset = () => {
    setForm(emptyForm);
    setEditing(null);
    setCodeTouched(false);
    setShowForm(false);
  };

  const tc = useTableControls(data, { searchKeys: ["code", "name", "status"] });

  return (
    <div>
      <PageHeader
        title="Regions"
        subtitle="Region codes are suggested automatically from the name."
        actions={
          <button className="btn btn-primary" onClick={() => { reset(); setShowForm(true); }}>
            <Icon.Plus size={14} /> Add Region
          </button>
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <FilterBar
        searchValue={tc.search}
        onSearchChange={tc.setSearch}
        placeholder="Search code, name..."
        onRefresh={fetchData}
      />

      <div className="card p-0">
        <div className="table-wrap">
          {loading ? (
            <p className="p-4 mb-0">Loading...</p>
          ) : (
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Country</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tc.pageRows.length === 0 ? (
                  <tr><td colSpan="5"><EmptyState label="No regions found." /></td></tr>
                ) : (
                  tc.pageRows.map((i, index) => (
                    <tr key={i.id || index}>
                      <td className="fw-semibold">{i.code || "—"}</td>
                      <td>{i.name || "—"}</td>
                      <td>{countryName(i)}</td>
                      <td><StatusPill status={i.status} /></td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(i)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(i.id)}>Delete</button>
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
          <h5>{editing ? "Edit Region" : "Add Region"}</h5>

          <label>Name</label>
          <input className="form-control mb-2" name="name" placeholder="e.g. Nairobi" value={form.name} onChange={handleChange} />

          <label>Code</label>
          <input
            className="form-control mb-2"
            name="code"
            placeholder="Suggested from name"
            value={form.code}
            onChange={handleChange}
            title="Auto-suggested from the name above — edit freely"
          />

          <label>Country</label>
          {countriesError && <div className="alert alert-warning py-2">{countriesError}</div>}
          <select className="form-control mb-2" name="country_id" value={form.country_id} onChange={handleChange}>
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label>Status</label>
          <select className="form-control mb-3" name="status" value={form.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button className="btn btn-success me-2" onClick={handleSave}>{editing ? "Update" : "Save"}</button>
          <button className="btn btn-secondary" onClick={reset}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default Regions;