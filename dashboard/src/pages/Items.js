import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    item_code: "",
    name: "",
    category: "",
    price: "",
    stock: "",
    status: "Active"
  });

  // ================= MESSAGE =================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // ================= FETCH ITEMS =================
  const fetchItems = async () => {
    setLoading(true);

    try {
      const res = await api.get("/items");
      setItems(res.data || []);
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
      showMessage("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "stock"
          ? value.replace(/[^0-9.]/g, "")
          : value
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      if (!formData.item_code || !formData.name) {
        showMessage("Item Code and Name are required");
        return;
      }

      const payload = {
        ...formData,
        price: Number(formData.price || 0),
        stock: Number(formData.stock || 0)
      };

      if (editing) {
        await api.put(`/items/${editing.id}`, payload);
        showMessage("Item updated successfully");
      } else {
        await api.post("/items", payload);
        showMessage("Item created successfully");
      }

      resetForm();
      fetchItems();

    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err.message);
      showMessage("Save failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditing(item);
    setShowForm(true);

    setFormData({
      item_code: item.item_code || "",
      name: item.name || "",
      category: item.category || "",
      price: item.price || "",
      stock: item.stock || "",
      status: item.status || "Active"
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await api.delete(`/items/${id}`);
      showMessage("Item deleted successfully");
      fetchItems();
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err.message);
      showMessage("Delete failed");
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      item_code: "",
      name: "",
      category: "",
      price: "",
      stock: "",
      status: "Active"
    });

    setEditing(null);
    setShowForm(false);
  };

  // ================= STATUS BADGE =================
  const getStatusBadge = (status) => {
    return status === "Active" ? (
      <span className="badge bg-success">Active</span>
    ) : (
      <span className="badge bg-secondary">Inactive</span>
    );
  };

  // ================= UI =================
  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Items Master</h3>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
        >
          + Add Item
        </button>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="alert alert-info">
          {message}
        </div>
      )}

      {/* TABLE */}
      <div className="card shadow-sm p-3">

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table table-hover align-middle">

            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Item Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.item_code}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.price}</td>
                  <td>{item.stock}</td>
                  <td>{getStatusBadge(item.status)}</td>

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
          <h5>{editing ? "Edit Item" : "Add Item"}</h5>

          <input
            name="item_code"
            className="form-control mb-2"
            placeholder="Item Code"
            value={formData.item_code}
            onChange={handleChange}
          />

          <input
            name="name"
            className="form-control mb-2"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            name="category"
            className="form-control mb-2"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
          />

          <input
            name="price"
            className="form-control mb-2"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
          />

          <input
            name="stock"
            className="form-control mb-2"
            placeholder="Stock Quantity"
            value={formData.stock}
            onChange={handleChange}
          />

          <select
            name="status"
            className="form-control mb-3"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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

export default Items;