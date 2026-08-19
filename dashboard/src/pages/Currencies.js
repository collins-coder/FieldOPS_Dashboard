import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { MASTERS_BASE } from "../api/mastersBase";

function Currency() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    status: "Active"
  });

  // ================= FETCH =================
  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await api.get(`${MASTERS_BASE}/currencies`);

      console.log("RAW:", res.data);

      const raw = res.data;

      const list = Array.isArray(raw)
        ? raw
        : raw.data
        ? raw.data
        : raw.result
        ? raw.result
        : [];

      // ✅ NORMALIZE FIELDS (THIS IS THE FIX)
      const cleaned = list.map((i) => ({
        id: i.id,
        code: i.code || i.currency_code || i.currencyCode || "",
        name: i.name || i.currency_name || i.currencyName || "",
        status: i.status || "Active"
      }));

      setData(cleaned);
    } catch (err) {
      console.log("FETCH ERROR:", err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!form.code || !form.name) return;

    if (editing) {
      await api.put(
        `${MASTERS_BASE}/currencies/${editing.id}`,
        form
      );
    } else {
      await api.post(
        `${MASTERS_BASE}/currencies`,
        form
      );
    }

    reset();
    fetchData();
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditing(item);
    setForm(item);
    setShowForm(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    await api.delete(`${MASTERS_BASE}/currencies/${id}`);
    fetchData();
  };

  // ================= RESET =================
  const reset = () => {
    setForm({
      code: "",
      name: "",
      status: "Active"
    });
    setEditing(null);
    setShowForm(false);
  };

  // ================= UI =================
  return (
    <div>

      <div className="d-flex justify-content-between mb-3">
        <h3>Currencies</h3>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
        >
          + Add
        </button>
      </div>

      <div className="card p-3">

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table table-hover">

            <thead >
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((i) => (
                  <tr key={i.id}>
                    <td>{i.code}</td>
                    <td>{i.name}</td>
                    <td>{i.status}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary me-2"
                        onClick={() => handleEdit(i)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(i.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        )}

      </div>

      {/* FORM */}
      {showForm && (
        <div className="card p-3 mt-3">

          <input
            className="form-control mb-2"
            name="code"
            placeholder="Code"
            value={form.code}
            onChange={handleChange}
          />

          <input
            className="form-control mb-2"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />

          <select
            className="form-control mb-3"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button className="btn btn-success me-2" onClick={handleSave}>
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

export default Currency;