import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { MASTERS_BASE } from "../api/mastersBase";

function RoutesPage() {
  const [data, setData] = useState([]);
  const [regions, setRegions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);


  const [form, setForm] = useState({
    route_name: "",
    region_id: "",
    country_id: "",
    status: "Active"
  });

  // ================= FETCH ROUTES =================
  const fetchData = async () => {
    try {
      const res = await api.get(`${MASTERS_BASE}/routes`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("ROUTES FETCH ERROR:", err.message);
      setData([]);
    }
  };

  // ================= FETCH REGIONS =================
  const fetchRegions = async () => {
    try {
      const res = await api.get(`${MASTERS_BASE}/regions`);
      setRegions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setRegions([]);
    }
  };

  // ================= FETCH COUNTRIES =================
  const fetchCountries = async () => {
    try {
      const res = await api.get(`${MASTERS_BASE}/countries`);
      setCountries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setCountries([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchRegions();
    fetchCountries();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SAVE =================
  const save = async () => {
    if (!form.route_name || !form.region_id || !form.country_id) return;

    try {
      if (editing) {
        await api.put(`${MASTERS_BASE}/routes/${editing.id}`, form);
      } else {
        await api.post(`${MASTERS_BASE}/routes`, form);
      }

      reset();
      fetchData();
    } catch (err) {
      console.log("SAVE ERROR:", err.message);
    }
  };

  // ================= EDIT =================
  const edit = (i) => {
    setEditing(i);
    setForm({
      route_name: i.route_name || "",
      region_id: i.region_id || "",
      country_id: i.country_id || "",
      status: i.status || "Active"
    });
    setShowForm(true);
  };

  // ================= DELETE =================
  const remove = async (id) => {
    try {
      await api.delete(`${MASTERS_BASE}/routes/${id}`);
      fetchData();
    } catch (err) {
      console.log("DELETE ERROR:", err.message);
    }
  };

  // ================= RESET =================
  const reset = () => {
    setForm({
      route_name: "",
      region_id: "",
      country_id: "",
      status: "Active"
    });
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div>

      <div className="d-flex justify-content-between mb-3">
        <h3>Routes</h3>

        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Route
        </button>
      </div>

      <div className="card p-3">

        <table className="table table-hover align-middle">

          <thead >
            <tr>
              <th>Route</th>
              <th>Region</th>
              <th>Country</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((i, index) => (
              <tr key={i.id || index}>
                <td>{i.route_name || "-"}</td>
                <td>{i.region_name || i.region_id || "-"}</td>
                <td>{i.country_name || i.country_id || "-"}</td>
                <td>{i.status || "-"}</td>

                <td>
                  <button className="btn btn-sm btn-secondary me-2" onClick={() => edit(i)}>
                    Edit
                  </button>

                  <button className="btn btn-sm btn-danger" onClick={() => remove(i.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {showForm && (
        <div className="card p-3 mt-3">

          <input
            className="form-control mb-2"
            name="route_name"
            placeholder="Route Name"
            value={form.route_name}
            onChange={handleChange}
          />

          <select
            className="form-control mb-2"
            name="region_id"
            value={form.region_id}
            onChange={handleChange}
          >
            <option value="">Select Region</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            className="form-control mb-2"
            name="country_id"
            value={form.country_id}
            onChange={handleChange}
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="form-control mb-3"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button className="btn btn-success me-2" onClick={save}>
            Save
          </button>

          <button className="btn btn-secondary" onClick={reset}>
            Cancel
          </button>

        </div>
      )}

    </div>
  );
}

export default RoutesPage;