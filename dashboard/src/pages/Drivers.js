import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { MASTERS_BASE } from "../api/mastersBase";
import { Icon } from "../components/Icons";
import { PageHeader, FilterBar, StatusPill, EmptyState, useTableControls, TableFooter } from "../components/ui";

function Drivers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const emptyForm = { driver_name: "", phone: "", vehicle_details: "", status: "Active" };
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${MASTERS_BASE}/drivers`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("FETCH DRIVERS ERROR:", err.response?.data || err.message);
      setError("Failed to load drivers (" + (err.response?.status || "no response") + ")");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const save = async () => {
    setError("");
    if (!form.driver_name) {
      setError("Driver name is required");
      return;
    }
    try {
      if (editing) {
        await api.put(`${MASTERS_BASE}/drivers/${editing.id}`, form);
      } else {
        await api.post(`${MASTERS_BASE}/drivers`, form);
      }
      reset();
      fetchData();
    } catch (err) {
      console.error("SAVE DRIVER ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Save failed");
    }
  };

  const edit = (item) => {
    setEditing(item);
    setForm({
      driver_name: item.driver_name || "",
      phone: item.phone || "",
      vehicle_details: item.vehicle_details || "",
      status: item.status || "Active",
    });
    setShowForm(true);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this driver?")) return;
    try {
      await api.delete(`${MASTERS_BASE}/drivers/${id}`);
      fetchData();
    } catch (err) {
      setError("Delete failed");
    }
  };

  const reset = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
  };

  const tc = useTableControls(data, { searchKeys: ["driver_code", "driver_name", "phone", "vehicle_details"] });

  return (
    <div>
      <PageHeader
        title="Drivers & Vehicles"
        subtitle="Driver codes are assigned automatically. Used when creating deliveries."
        actions={
          <button className="btn btn-primary" onClick={() => { reset(); setShowForm(true); }}>
            <Icon.Plus size={14} /> Add Driver
          </button>
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}

      <FilterBar
        searchValue={tc.search}
        onSearchChange={tc.setSearch}
        placeholder="Search code, name, phone, vehicle..."
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
                  <th>Driver Name</th>
                  <th>Phone</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tc.pageRows.length === 0 ? (
                  <tr><td colSpan="6"><EmptyState label="No drivers found." /></td></tr>
                ) : (
                  tc.pageRows.map((i) => (
                    <tr key={i.id}>
                      <td className="fw-semibold">{i.driver_code}</td>
                      <td>{i.driver_name}</td>
                      <td>{i.phone || "—"}</td>
                      <td>{i.vehicle_details || "—"}</td>
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
          <h5>{editing ? "Edit Driver" : "Add Driver"}</h5>

          <label>Driver Name</label>
          <input className="form-control mb-2" name="driver_name" value={form.driver_name} onChange={handleChange} placeholder="e.g. John Mwangi" />

          <label>Phone</label>
          <input className="form-control mb-2" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 0712345678" />

          <label>Vehicle Details</label>
          <input className="form-control mb-2" name="vehicle_details" value={form.vehicle_details} onChange={handleChange} placeholder="e.g. KDA 123X - Isuzu Truck" />

          <label>Status</label>
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

export default Drivers;
