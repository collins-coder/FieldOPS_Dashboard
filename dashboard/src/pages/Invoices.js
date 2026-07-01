import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    invoice_number: "",
    customer_name: "",
    sales_order_id: "",
    invoice_amount: "",
    due_date: "",
    status: "Pending"
  });

  // ================= MESSAGE =================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // ================= FETCH INVOICES =================
  const fetchInvoices = async () => {
    setLoading(true);

    try {
      const res = await api.get("/admin/invoices");
      setInvoices(res.data || []);
    } catch (error) {
      console.error("FETCH INVOICES ERROR:", error.response?.data || error.message);
      showMessage("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH SALES ORDERS =================
  const fetchSalesOrders = async () => {
    try {
      const res = await api.get("/sales-orders");
      setSalesOrders(res.data || []);
    } catch (error) {
      console.error("FETCH SALES ORDERS ERROR:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchSalesOrders();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "sales_order_id") {
      const selectedOrder = salesOrders.find(
        (order) => String(order.id) === value
      );

      setFormData({
        ...formData,
        sales_order_id: value,
        customer_name: selectedOrder ? selectedOrder.customer_name : "",
        invoice_amount: selectedOrder ? selectedOrder.total_amount : ""
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      if (
        !formData.invoice_number ||
        !formData.sales_order_id ||
        !formData.due_date
      ) {
        showMessage("Invoice Number, Sales Order and Due Date are required");
        return;
      }

      const payload = {
        invoice_number: formData.invoice_number,
        customer_name: formData.customer_name,
        sales_order_id: Number(formData.sales_order_id),
        invoice_amount: Number(formData.invoice_amount || 0),
        due_date: formData.due_date,
        status: "Pending"
      };

      await api.post("/create-invoice", payload);

      showMessage("Invoice created successfully");
      resetForm();
      fetchInvoices();

    } catch (error) {
      console.error("SAVE ERROR:", error.response?.data || error.message);
      showMessage("Failed to create invoice");
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      invoice_number: "",
      customer_name: "",
      sales_order_id: "",
      invoice_amount: "",
      due_date: "",
      status: "Pending"
    });

    setShowForm(false);
  };

  // ================= STATUS BADGE =================
  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return <span className="badge bg-success">Paid</span>;

      case "Pending":
        return <span className="badge bg-warning text-dark">Pending</span>;

      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // ================= UI =================
  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Invoices</h3>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Create Invoice
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
          <p>Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="text-muted">No invoices found.</p>
        ) : (
          <table className="table table-hover align-middle">

            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.id}</td>
                  <td>{inv.invoice_number}</td>
                  <td>{inv.customer_name}</td>
                  <td>{inv.invoice_amount}</td>
                  <td>{inv.due_date}</td>
                  <td>{getStatusBadge(inv.status)}</td>
                  <td>{inv.created_at}</td>
                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

      {/* FORM */}
      {showForm && (
        <div className="card p-4 mt-4">
          <h5>Create Invoice</h5>

          <input
            name="invoice_number"
            className="form-control mb-2"
            placeholder="Invoice Number"
            value={formData.invoice_number}
            onChange={handleChange}
          />

          <select
            name="sales_order_id"
            className="form-control mb-2"
            value={formData.sales_order_id}
            onChange={handleChange}
          >
            <option value="">Select Sales Order</option>

            {salesOrders.map((order) => (
              <option
                key={order.id}
                value={order.id}
              >
                {order.order_number} - {order.customer_name}
              </option>
            ))}
          </select>

          <input
            name="customer_name"
            className="form-control mb-2"
            placeholder="Customer"
            value={formData.customer_name}
            readOnly
          />

          <input
            name="invoice_amount"
            className="form-control mb-2"
            placeholder="Invoice Amount"
            value={formData.invoice_amount}
            readOnly
          />

          <input
            type="date"
            name="due_date"
            className="form-control mb-3"
            value={formData.due_date}
            onChange={handleChange}
          />

          <button
            className="btn btn-success me-2"
            onClick={handleSave}
          >
            Save
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

export default Invoices;