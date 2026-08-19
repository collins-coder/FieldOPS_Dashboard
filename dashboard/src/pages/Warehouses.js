import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { MASTERS_BASE } from "../api/mastersBase";

function Warehouses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "",
    status: "Active",
    in_stock: "",
    committed: "",
    available: ""
  });

  // ================= FETCH =================
  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await api.get(`${MASTERS_BASE}/warehouses`);
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
        `${MASTERS_BASE}/warehouses/${editing.id}`,
        form
      );
    } else {
      await api.post(
        `${MASTERS_BASE}/warehouses`,
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
    if (!window.confirm("Delete this warehouse?")) return;

    await api.delete(`${MASTERS_BASE}/warehouses/${id}`);
    fetchData();
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      type: "",
      status: "Active",
      in_stock: "",
      committed: "",
      available: ""
    });

    setEditing(null);
    setShowForm(false);
  };

  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Warehouses</h3>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setForm({
              code: "",
              name: "",
              type: "",
              status: "Active",
              in_stock: "",
              committed: "",
              available: ""
            });
          }}
        >
          + Add Warehouse
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
                <th>Type</th>
                <th>Status</th>
                <th>In Stock</th>
                <th>Committed</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>
                    {item.status === "Active" ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </td>
                  <td>{item.in_stock}</td>
                  <td>{item.committed}</td>
                  <td>{item.available}</td>

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

          <h5>{editing ? "Edit Warehouse" : "Add Warehouse"}</h5>

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

          <input
            name="type"
            className="form-control mb-2"
            placeholder="Type"
            value={form.type}
            onChange={handleChange}
          />

          <input
            name="in_stock"
            className="form-control mb-2"
            placeholder="In Stock"
            value={form.in_stock}
            onChange={handleChange}
          />

          <input
            name="committed"
            className="form-control mb-2"
            placeholder="Committed"
            value={form.committed}
            onChange={handleChange}
          />

          <input
            name="available"
            className="form-control mb-2"
            placeholder="Available"
            value={form.available}
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

export default Warehouses;