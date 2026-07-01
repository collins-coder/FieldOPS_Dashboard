import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    payment_reference: "",
    invoice_id: "",
    amount_paid: "",
    payment_method: "",
    payment_date: "",
    status: "Pending"
  });

  // ================= MESSAGE =================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // ================= FETCH PAYMENTS =================
  const fetchPayments = async () => {
    setLoading(true);

    try {
      const res = await api.get("/admin/payments");
      setPayments(res.data || []);
    } catch (error) {
      console.error(
        "FETCH PAYMENTS ERROR:",
        error.response?.data || error.message
      );
      showMessage("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH INVOICES =================
  const fetchInvoices = async () => {
    try {
      const res = await api.get("/admin/invoices");
      setInvoices(res.data || []);
    } catch (error) {
      console.error(
        "FETCH INVOICES ERROR:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "invoice_id") {
      const selectedInvoice = invoices.find(
        (inv) => String(inv.id) === value
      );

      setFormData({
        ...formData,
        invoice_id: value,
        amount_paid: selectedInvoice
          ? selectedInvoice.invoice_amount
          : ""
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
        !formData.payment_reference ||
        !formData.invoice_id ||
        !formData.payment_method ||
        !formData.payment_date
      ) {
        showMessage("Please fill all required fields");
        return;
      }

      const payload = {
        payment_reference: formData.payment_reference,
        invoice_id: Number(formData.invoice_id),
        amount_paid: Number(formData.amount_paid || 0),
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
        status: "Completed"
      };

      await api.post("/create-payment", payload);

      showMessage("Payment created successfully");
      resetForm();
      fetchPayments();

    } catch (error) {
      console.error(
        "SAVE PAYMENT ERROR:",
        error.response?.data || error.message
      );
      showMessage("Failed to save payment");
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      payment_reference: "",
      invoice_id: "",
      amount_paid: "",
      payment_method: "",
      payment_date: "",
      status: "Pending"
    });

    setShowForm(false);
  };

  // ================= STATUS BADGE =================
  const getStatusBadge = (status) => {
    if (status === "Completed") {
      return (
        <span className="badge bg-success">
          Completed
        </span>
      );
    }

    if (status === "Pending") {
      return (
        <span className="badge bg-warning text-dark">
          Pending
        </span>
      );
    }

    return (
      <span className="badge bg-secondary">
        {status}
      </span>
    );
  };

  // ================= UI =================
  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Payments</h3>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add Payment
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
          <p>Loading payments...</p>
        ) : payments.length === 0 ? (
          <p className="text-muted">
            No payments found.
          </p>
        ) : (
          <table className="table table-hover align-middle">

            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Reference</th>
                <th>Invoice ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.payment_reference}</td>
                  <td>{p.invoice_id}</td>
                  <td>{p.amount_paid}</td>
                  <td>{p.payment_method}</td>
                  <td>{p.payment_date}</td>
                  <td>{getStatusBadge(p.status)}</td>
                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

      {/* FORM */}
      {showForm && (
        <div className="card p-4 mt-4">
          <h5>Add Payment</h5>

          <input
            name="payment_reference"
            className="form-control mb-2"
            placeholder="Payment Reference"
            value={formData.payment_reference}
            onChange={handleChange}
          />

          <select
            name="invoice_id"
            className="form-control mb-2"
            value={formData.invoice_id}
            onChange={handleChange}
          >
            <option value="">
              Select Invoice
            </option>

            {invoices.map((inv) => (
              <option
                key={inv.id}
                value={inv.id}
              >
                {inv.invoice_number} - {inv.customer_name}
              </option>
            ))}
          </select>

          <input
            name="amount_paid"
            className="form-control mb-2"
            placeholder="Amount Paid"
            value={formData.amount_paid}
            readOnly
          />

          <select
            name="payment_method"
            className="form-control mb-2"
            value={formData.payment_method}
            onChange={handleChange}
          >
            <option value="">
              Select Payment Method
            </option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">
              Bank Transfer
            </option>
            <option value="M-Pesa">M-Pesa</option>
            <option value="Cheque">Cheque</option>
          </select>

          <input
            type="date"
            name="payment_date"
            className="form-control mb-3"
            value={formData.payment_date}
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

export default Payments;