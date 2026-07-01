import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    order_number: "",
    customer_name: "",
    item_name: "",
    quantity: "",
    unit_price: "",
    total_amount: "",
    status: "Pending",
    source: "Web Panel"
  });

  // ================= MESSAGE =================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // ================= FETCH SALES ORDERS =================
  const fetchOrders = async () => {
    setLoading(true);

    try {
      const res = await api.get("/sales-orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("FETCH ORDERS ERROR:", err.response?.data || err.message);
      showMessage("Failed to load sales orders");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data || []);
    } catch (err) {
      console.error("FETCH CUSTOMERS ERROR:", err);
    }
  };

  // ================= FETCH ITEMS =================
  const fetchItems = async () => {
    try {
      const res = await api.get("/items");
      setItems(res.data || []);
    } catch (err) {
      console.error("FETCH ITEMS ERROR:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchItems();
  }, []);

  // ================= AUTO TOTAL =================
  useEffect(() => {
    const qty = Number(formData.quantity || 0);
    const price = Number(formData.unit_price || 0);

    setFormData((prev) => ({
      ...prev,
      total_amount: qty * price
    }));
  }, [formData.quantity, formData.unit_price]);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "item_name") {
      const selectedItem = items.find(
        (item) => item.name === value
      );

      setFormData({
        ...formData,
        item_name: value,
        unit_price: selectedItem ? selectedItem.price : ""
      });

      return;
    }

    setFormData({
      ...formData,
      [name]:
        name === "quantity" || name === "unit_price"
          ? value.replace(/[^0-9.]/g, "")
          : value
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      if (
        !formData.order_number ||
        !formData.customer_name ||
        !formData.item_name
      ) {
        showMessage("Order No, Customer and Item are required");
        return;
      }

      const payload = {
        ...formData,
        quantity: Number(formData.quantity || 0),
        unit_price: Number(formData.unit_price || 0),
        total_amount: Number(formData.total_amount || 0)
      };

      if (editing) {
        await api.put(`/sales-orders/${editing.id}`, payload);
        showMessage("Sales order updated successfully");
      } else {
        await api.post("/sales-orders", payload);
        showMessage("Sales order created successfully");
      }

      resetForm();
      fetchOrders();

    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err.message);
      showMessage("Save failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (order) => {
    setEditing(order);
    setShowForm(true);

    setFormData({
      order_number: order.order_number || "",
      customer_name: order.customer_name || "",
      item_name: order.item_name || "",
      quantity: order.quantity || "",
      unit_price: order.unit_price || "",
      total_amount: order.total_amount || "",
      status: order.status || "Pending",
      source: order.source || "Web Panel"
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sales order?")) return;

    try {
      await api.delete(`/sales-orders/${id}`);
      showMessage("Sales order deleted successfully");
      fetchOrders();
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err.message);
      showMessage("Delete failed");
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      order_number: "",
      customer_name: "",
      item_name: "",
      quantity: "",
      unit_price: "",
      total_amount: "",
      status: "Pending",
      source: "Web Panel"
    });

    setEditing(null);
    setShowForm(false);
  };

  // ================= STATUS BADGE =================
  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return <span className="badge bg-success">Confirmed</span>;

      case "Pending":
        return <span className="badge bg-warning text-dark">Pending</span>;

      case "Cancelled":
        return <span className="badge bg-danger">Cancelled</span>;

      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // ================= UI =================
  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Sales Orders</h3>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
        >
          + Add Sales Order
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
                <th>Order No</th>
                <th>Customer</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.order_number}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.item_name}</td>
                  <td>{order.quantity}</td>
                  <td>{order.total_amount}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{order.source}</td>

                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => handleEdit(order)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(order.id)}
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
          <h5>
            {editing ? "Edit Sales Order" : "Add Sales Order"}
          </h5>

          <input
            name="order_number"
            className="form-control mb-2"
            placeholder="Order Number"
            value={formData.order_number}
            onChange={handleChange}
          />

          <select
            name="customer_name"
            className="form-control mb-2"
            value={formData.customer_name}
            onChange={handleChange}
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option
                key={customer.id}
                value={customer.customer_name}
              >
                {customer.customer_name}
              </option>
            ))}
          </select>

          <select
            name="item_name"
            className="form-control mb-2"
            value={formData.item_name}
            onChange={handleChange}
          >
            <option value="">Select Item</option>
            {items.map((item) => (
              <option
                key={item.id}
                value={item.name}
              >
                {item.name}
              </option>
            ))}
          </select>

          <input
            name="quantity"
            className="form-control mb-2"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
          />

          <input
            name="unit_price"
            className="form-control mb-2"
            placeholder="Unit Price"
            value={formData.unit_price}
            onChange={handleChange}
          />

          <input
            name="total_amount"
            className="form-control mb-2"
            placeholder="Total Amount"
            value={formData.total_amount}
            readOnly
          />

          <select
            name="status"
            className="form-control mb-2"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            name="source"
            className="form-control mb-3"
            value={formData.source}
            onChange={handleChange}
          >
            <option value="Web Panel">Web Panel</option>
            <option value="Mobile App">Mobile App</option>
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

export default SalesOrders;