import React, { useEffect, useState } from "react";
import axios from "axios";

function Reports() {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [custRes, invRes, payRes] = await Promise.all([
        axios.get("http://127.0.0.1:5000/customers", authHeaders),
        axios.get("http://127.0.0.1:5000/admin/invoices", authHeaders),
        axios.get("http://127.0.0.1:5000/admin/payments", authHeaders)
      ]);

      setCustomers(custRes.data || []);
      setInvoices(invRes.data || []);
      setPayments(payRes.data || []);
    } catch (error) {
      console.error("Reports load error:", error);
      showMessage("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SAFE KPI CALCULATIONS
  // =========================
  const totalInvoiceAmount = invoices.reduce(
    (sum, inv) => sum + Number(inv.invoice_amount || 0),
    0
  );

  const totalPaidAmount = payments.reduce(
    (sum, p) => sum + Number(p.amount_paid || 0),
    0
  );

  const pendingInvoices = invoices.filter(
    (inv) => (inv.status || "").toLowerCase() === "pending"
  ).length;

  const activeCustomers = customers.filter(
    (c) => (c.status || "").toLowerCase() === "active"
  ).length;

  const paymentRate =
    totalInvoiceAmount > 0
      ? ((totalPaidAmount / totalInvoiceAmount) * 100).toFixed(2)
      : 0;

  return (
    <div>

      {message && (
        <div className="alert alert-info py-2">
          {message}
        </div>
      )}

      <div className="mb-4">
        <h3>Reports & Analytics</h3>
        <p className="text-muted">
          Business overview, performance tracking and financial insights
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="row">

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3">
            <h6>Total Customers</h6>
            <h3>{customers.length}</h3>
            <small className="text-muted">
              Active: {activeCustomers}
            </small>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3">
            <h6>Total Invoices</h6>
            <h3>{invoices.length}</h3>
            <small className="text-muted">
              Pending: {pendingInvoices}
            </small>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3">
            <h6>Total Invoice Value</h6>
            <h3>{totalInvoiceAmount.toFixed(2)}</h3>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm p-3">
            <h6>Total Paid</h6>
            <h3>{totalPaidAmount.toFixed(2)}</h3>
          </div>
        </div>

      </div>

      {/* INSIGHTS */}
      <div className="card p-4 shadow-sm mt-3">

        <h5>Business Insights</h5>

        {loading ? (
          <p>Loading analytics...</p>
        ) : (
          <ul className="mb-0">
            <li>
              Pending Invoices: <strong>{pendingInvoices}</strong>
            </li>

            <li>
              Payment Collection Rate:{" "}
              <strong>{paymentRate}%</strong>
            </li>

            <li>
              Active Customers:{" "}
              <strong>{activeCustomers}</strong>
            </li>
          </ul>
        )}

      </div>

    </div>
  );
}

export default Reports;