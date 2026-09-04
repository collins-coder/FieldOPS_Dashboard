import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { PageHeader, DocSection, StatusPill } from "../components/ui";

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomer = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data);
    } catch (err) {
      console.error("FETCH CUSTOMER DETAIL ERROR:", err.response?.data || err.message);
      setError("Could not load this customer (" + (err.response?.status || "no response") + ").");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomer(); /* eslint-disable-next-line */ }, [id]);

  if (loading) return <p className="p-4">Loading customer...</p>;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;
  if (!customer) return null;

  return (
    <div>
      <button className="btn btn-light btn-sm mb-3" onClick={() => navigate("/customers")}>
        Back to Customers
      </button>

      <PageHeader
        title={customer.customer_name}
        subtitle={`${customer.customer_code} - ${customer.location || "No location on file"}`}
        actions={<StatusPill status={customer.status} />}
      />

      <div className="row">
        <div className="col-md-5">
          <DocSection title="Profile">
            <p className="mb-1"><b>Phone:</b> {customer.phone || "-"}</p>
            <p className="mb-1"><b>Email:</b> {customer.email || "-"}</p>
            <p className="mb-1"><b>Route:</b> {customer.route || "-"}</p>
            <p className="mb-0"><b>Credit Limit:</b> {Number(customer.credit_limit || 0).toLocaleString()}</p>
          </DocSection>

          <DocSection title="Masters (SAP B1 Business Partner style)">
            <p className="mb-1"><b>Price List:</b> {customer.price_list_name || "Not assigned"}</p>
            <p className="mb-0"><b>Payment Terms:</b> {customer.payment_terms_name || "Not assigned"}</p>
          </DocSection>
        </div>

        <div className="col-md-7">
          <DocSection title="Sales Orders">
            <RelationshipTable
              rows={customer.sales_orders}
              empty="No sales orders for this customer yet."
              columns={[
                { key: "order_number", label: "Order #" },
                { key: "order_date", label: "Date" },
                { key: "total_amount", label: "Total", money: true },
                { key: "status", label: "Status", pill: true },
                { key: "doc_status", label: "Doc Status", pill: true },
              ]}
              onRowClick={(r) => navigate(`/sales-orders/${r.id}`)}
            />
          </DocSection>

          <DocSection title="Invoices">
            <RelationshipTable
              rows={customer.invoices}
              empty="No invoices for this customer yet."
              columns={[
                { key: "invoice_number", label: "Invoice #" },
                { key: "invoice_amount", label: "Amount", money: true },
                { key: "due_date", label: "Due" },
                { key: "status", label: "Status", pill: true },
              ]}
              onRowClick={(r) => navigate(`/invoices/${r.id}`)}
            />
          </DocSection>

          <DocSection title="Payments">
            <RelationshipTable
              rows={customer.payments}
              empty="No payments recorded for this customer yet."
              columns={[
                { key: "payment_reference", label: "Reference" },
                { key: "invoice_number", label: "Invoice #" },
                { key: "amount_paid", label: "Amount", money: true },
                { key: "payment_date", label: "Date" },
                { key: "status", label: "Status", pill: true },
              ]}
              onRowClick={(r) => navigate(`/payments/${r.id}`)}
            />
          </DocSection>
        </div>
      </div>
    </div>
  );
}

function RelationshipTable({ rows, columns, empty, onRowClick }) {
  if (!rows || rows.length === 0) {
    return <p className="text-muted mb-0" style={{ fontSize: 13 }}>{empty}</p>;
  }
  return (
    <div className="table-wrap">
      <table className="table table-hover">
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i} style={{ cursor: "pointer" }} onClick={() => onRowClick(r)}>
              {columns.map((c) => (
                <td key={c.key}>
                  {c.pill ? <StatusPill status={r[c.key]} /> :
                    c.money ? Number(r[c.key] || 0).toLocaleString() :
                    r[c.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerDetail;
