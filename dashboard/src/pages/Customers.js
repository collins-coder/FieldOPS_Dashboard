import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    customer_code: "",
    customer_name: "",
    phone: "",
    email: "",
    location: "",
    route: "",
    credit_limit: "",
    status: "Active",
  });

  // ================= MESSAGE =================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // ================= FETCH =================
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers");
      setCustomers(res.data || []);
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
      showMessage("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "credit_limit"
          ? value.replace(/[^0-9.]/g, "")
          : value,
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      if (!formData.customer_code || !formData.customer_name) {
        showMessage("Code and Name required");
        return;
      }

      const payload = {
        ...formData,
        credit_limit: Number(formData.credit_limit || 0),
      };

      if (editing) {
        await api.put(`/customers/${editing.id}`, payload);
        showMessage("Customer updated");
      } else {
        await api.post("/customers", payload);
        showMessage("Customer created");
      }

      resetForm();
      fetchCustomers();

    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err.message);
      showMessage(err.response?.data?.message || "Save failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (c) => {
    setEditing(c);
    setViewing(null);
    setShowForm(true);

    setFormData({
      customer_code: c.customer_code || "",
      customer_name: c.customer_name || "",
      phone: c.phone || "",
      email: c.email || "",
      location: c.location || "",
      route: c.route || "",
      credit_limit: c.credit_limit || "",
      status: c.status || "Active",
    });
  };

  // ================= VIEW =================
  const handleView = (c) => {
    setViewing(c);
    setShowForm(false);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete customer?")) return;

    try {
      await api.delete(`/customers/${id}`);
      showMessage("Deleted successfully");
      fetchCustomers();
    } catch (err) {
      console.error(err);
      showMessage("Delete failed");
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      customer_code: "",
      customer_name: "",
      phone: "",
      email: "",
      location: "",
      route: "",
      credit_limit: "",
      status: "Active",
    });

    setEditing(null);
    setShowForm(false);
    setViewing(null);
  };

  // ================= UI =================
  return (
    <div className="container mt-3">

      <div className="d-flex justify-content-between mb-3">
        <h3>Customers</h3>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setViewing(null);

            setFormData({
              customer_code: "",
              customer_name: "",
              phone: "",
              email: "",
              location: "",
              route: "",
              credit_limit: "",
              status: "Active",
            });
          }}
        >
          + Add Customer
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {/* TABLE */}
      <div className="card p-3">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Location</th>
                <th>Route</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.customer_code}</td>
                  <td>{c.customer_name}</td>
                  <td>{c.phone}</td>
                  <td>{c.email}</td>
                  <td>{c.location}</td>
                  <td>{c.route}</td>

                  <td>
                    <button
                      onClick={() => handleView(c)}
                      className="btn btn-sm btn-outline-primary me-1"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleEdit(c)}
                      className="btn btn-sm btn-outline-secondary me-1"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(c.id)}
                      className="btn btn-sm btn-outline-danger"
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

      {/* VIEW */}
      {viewing && (
        <div className="card p-3 mt-3">
          <h5>Customer Details</h5>
          <p><b>Name:</b> {viewing.customer_name}</p>
          <p><b>Email:</b> {viewing.email}</p>
          <p><b>Phone:</b> {viewing.phone}</p>
          <p><b>Location:</b> {viewing.location}</p>
          <p><b>Route:</b> {viewing.route}</p>
          <p><b>Credit:</b> {viewing.credit_limit}</p>

          <button className="btn btn-secondary btn-sm" onClick={() => setViewing(null)}>
            Close
          </button>
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <div className="card p-4 mt-3">
          <h5>{editing ? "Edit Customer" : "Add Customer"}</h5>

          <input name="customer_code" className="form-control mb-2" placeholder="Code" value={formData.customer_code} onChange={handleChange} />
          <input name="customer_name" className="form-control mb-2" placeholder="Name" value={formData.customer_name} onChange={handleChange} />
          <input name="phone" className="form-control mb-2" placeholder="Phone" value={formData.phone} onChange={handleChange} />
          <input name="email" className="form-control mb-2" placeholder="Email" value={formData.email} onChange={handleChange} />
          <input name="location" className="form-control mb-2" placeholder="Location" value={formData.location} onChange={handleChange} />
          <input name="route" className="form-control mb-2" placeholder="Route" value={formData.route} onChange={handleChange} />
          <input name="credit_limit" className="form-control mb-2" placeholder="Credit Limit" value={formData.credit_limit} onChange={handleChange} />

          <select name="status" className="form-control mb-2" value={formData.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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