import React, { useEffect, useState } from "react";
import axios from "axios";

function PriceLists() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    currency: "",
    status: "Active"
  });

  // ================= FETCH =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/price-lists");
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!form.code || !form.name) return;

    if (editing) {
      await axios.put(
        `http://localhost:5000/api/price-lists/${editing.id}`,
        form
      );
    } else {
      await axios.post("http://localhost:5000/api/price-lists", form);
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
    if (!window.confirm("Delete this price list?")) return;

    await axios.delete(`http://localhost:5000/api/price-lists/${id}`);
    fetchData();
  };

  // ================= RESET =================
  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      currency: "",
      status: "Active"
    });

    setEditing(null);
    setShowForm(false);
  };

  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Price Lists</h3>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setForm({
              code: "",
              name: "",
              currency: "",
              status: "Active"
            });
          }}
        >
          + Add Price List
        </button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm p-3">

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table table-hover align-middle">

            <thead className="table-dark">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>{item.currency}</td>
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

      {/* FORM (LIKE ITEMS.JS STYLE) */}
      {showForm && (
        <div className="card p-4 mt-4">

          <h5>{editing ? "Edit Price List" : "Add Price List"}</h5>

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
            name="currency"
            className="form-control mb-2"
            placeholder="Currency"
            value={form.currency}
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

          <button className="btn btn-success me-2" onClick={handleSave}>
            {editing ? "Update" : "Save"}
          </button>

          <button className="btn btn-secondary" onClick={resetForm}>
            Cancel
          </button>

        </div>
      )}

    </div>
  );
}

export default PriceLists;