import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { MASTERS_BASE } from "../api/mastersBase";

function Countries() {
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
      const res = await api.get(`${MASTERS_BASE}/countries`);
      setData(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!form.code || !form.name) return;

    if (editing) {
      await api.put(
        `${MASTERS_BASE}/countries/${editing.id}`,
        form
      );
    } else {
      await api.post(
        `${MASTERS_BASE}/countries`,
        form
      );
    }

    resetForm();
    fetchData();
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditing(item);
    setShowForm(true);
    setForm(item);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this country?")) return;

    await api.delete(`${MASTERS_BASE}/countries/${id}`);
    fetchData();
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      status: "Active"
    });

    setEditing(null);
    setShowForm(false);
  };

  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Countries</h3>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setForm({
              code: "",
              name: "",
              status: "Active"
            });
          }}
        >
          + Add Country
        </button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm p-3">

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table table-hover align-middle">

            <thead >
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>
                    {item.status === "Active" ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </td>

                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

      {/* FORM */}
      {showForm && (
        <div className="card p-4 mt-4">

          <h5>{editing ? "Edit Country" : "Add Country"}</h5>

          <input
            name="code"
            className="form-control mb-2"
            placeholder="Code"
            value={form.code}
            onChange={handleChange}
          />

          <input
            name="name"
            className="form-control mb-2"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />

          <select
            name="status"
            className="form-control mb-3"
            value={form.status}
            onChange={handleChange}
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button
            className="btn btn-success me-2"
            onClick={handleSave}
          >
            {editing ? "Update" : "Save"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={resetForm}
          >
            Cancel
          </button>

        </div>
      )}

    </div>
  );
}

export default Countries;