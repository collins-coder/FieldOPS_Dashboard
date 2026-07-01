import React, { useEffect, useState } from "react";
import axios from "axios";

function DashboardHome() {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const token = localStorage.getItem("token");

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, invRes, payRes] = await Promise.all([
        axios.get("http://127.0.0.1:5000/customers", headers),
        axios.get("http://127.0.0.1:5000/admin/invoices", headers),
        axios.get("http://127.0.0.1:5000/admin/payments", headers)
      ]);

      setCustomers(custRes.data || []);
      setInvoices(invRes.data || []);
      setPayments(payRes.data || []);

    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  };

  const StatCard = ({ title, value, color }) => (
    <div
      className="card border-0 shadow-sm"
      style={{
        borderRadius: "18px",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          height: "6px",
          background: color
        }}
      />

      <div className="card-body">
        <p
          style={{
            color: "#64748b",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: "500"
          }}
        >
          {title}
        </p>

        <h2
          style={{
            fontWeight: "700",
            color: "#0f172a"
          }}
        >
          {value}
        </h2>
      </div>
    </div>
  );

  const ActivityCard = ({ title, children }) => (
    <div
      className="card border-0 shadow-sm h-100"
      style={{
        borderRadius: "18px"
      }}
    >
      <div className="card-body">
        <h5
          style={{
            fontWeight: "600",
            marginBottom: "18px"
          }}
        >
          {title}
        </h5>

        {children}
      </div>
    </div>
  );

  return (
    <div
      style={{
        background: "#f1f5f9",
        minHeight: "100vh",
        padding: "25px"
      }}
    >

      {/* PAGE HEADER */}
      <div
        className="d-flex justify-content-between align-items-center mb-4"
      >
        <div>
          <h2
            style={{
              fontWeight: "700",
              marginBottom: "5px"
            }}
          >
            Dashboard
          </h2>

          <p
            style={{
              color: "#64748b",
              margin: 0
            }}
          >
            Overview of FieldOPS performance and activities
          </p>
        </div>

        <div>
          <button className="btn btn-primary">
            + Quick Action
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="row g-4">

        <div className="col-md-4">
          <StatCard
            title="Total Customers"
            value={customers.length}
            color="#2563eb"
          />
        </div>

        <div className="col-md-4">
          <StatCard
            title="Invoices"
            value={invoices.length}
            color="#16a34a"
          />
        </div>

        <div className="col-md-4">
          <StatCard
            title="Payments"
            value={payments.length}
            color="#f59e0b"
          />
        </div>

      </div>

      {/* SECOND ROW */}
      <div className="row g-4 mt-1">

        {/* CUSTOMERS */}
        <div className="col-md-4">
          <ActivityCard title="Recent Customers">

            <ul className="list-group list-group-flush">
              {customers.slice(0, 5).map((c, index) => (
                <li
                  key={index}
                  className="list-group-item border-0 px-0"
                >
                  <div style={{ fontWeight: "500" }}>
                    {c.customer_name}
                  </div>

                  <small style={{ color: "#64748b" }}>
                    Customer Profile
                  </small>
                </li>
              ))}
            </ul>

          </ActivityCard>
        </div>

        {/* INVOICES */}
        <div className="col-md-4">
          <ActivityCard title="Recent Invoices">

            <ul className="list-group list-group-flush">
              {invoices.slice(0, 5).map((i, index) => (
                <li
                  key={index}
                  className="list-group-item border-0 px-0"
                >
                  <div style={{ fontWeight: "500" }}>
                    {i.invoice_number}
                  </div>

                  <small
                    style={{
                      color:
                        i.status === "Paid"
                          ? "#16a34a"
                          : "#f59e0b"
                    }}
                  >
                    {i.status}
                  </small>
                </li>
              ))}
            </ul>

          </ActivityCard>
        </div>

        {/* PAYMENTS */}
        <div className="col-md-4">
          <ActivityCard title="Recent Payments">

            <ul className="list-group list-group-flush">
              {payments.slice(0, 5).map((p, index) => (
                <li
                  key={index}
                  className="list-group-item border-0 px-0"
                >
                  <div style={{ fontWeight: "500" }}>
                    {p.payment_reference}
                  </div>

                  <small style={{ color: "#64748b" }}>
                    Amount: {p.amount_paid}
                  </small>
                </li>
              ))}
            </ul>

          </ActivityCard>
        </div>

      </div>

      {/* SYSTEM STATUS */}
      <div
        className="card border-0 shadow-sm mt-4"
        style={{
          borderRadius: "18px"
        }}
      >
        <div className="card-body">

          <h5 style={{ fontWeight: "600" }}>
            System Status
          </h5>

          <p
            style={{
              color: "#64748b",
              marginBottom: 0
            }}
          >
            All FieldOPS services are operational.
            APIs, database connections, invoices,
            payments and synchronization engines
            are running normally.
          </p>

        </div>
      </div>

    </div>
  );
}

export default DashboardHome;