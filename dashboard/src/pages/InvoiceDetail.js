import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { Icon } from "../components/Icons";
import { PageHeader, DocSection, DocStatusExplainer, RelatedDocLink, StatusPill } from "../components/ui";

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchInvoice = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/admin/invoices/${id}`);
      setInvoice(res.data);
    } catch (err) {
      console.error("FETCH INVOICE DETAIL ERROR:", err.response?.data || err.message);
      setError("Could not load this invoice (" + (err.response?.status || "no response") + ").");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoice(); /* eslint-disable-next-line */ }, [id]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this invoice? Its base sales order will re-open.")) return;
    try {
      await api.patch(`/create-invoice/${id}/cancel`);
      showMessage("Invoice cancelled — base sales order re-opened");
      fetchInvoice();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to cancel invoice");
    }
  };

  if (loading) return <p className="p-4">Loading invoice...</p>;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;
  if (!invoice) return null;

  const isOpen = (invoice.doc_status || "Open") === "Open";
  const isCancelled = invoice.status === "Cancelled";

  return (
    <div>
      <button className="btn btn-light btn-sm mb-3" onClick={() => navigate("/invoices")}>
        ← Back to Invoices
      </button>

      <PageHeader
        title={`Invoice ${invoice.invoice_number}`}
        subtitle={`For ${invoice.customer_name} — due ${invoice.due_date || "—"}`}
        actions={
          <>
            {!isCancelled && isOpen && (
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate("/deliveries", { state: { copyFromInvoice: invoice } })}
              >
                Copy to Delivery
              </button>
            )}
            {!isCancelled && (
              <button className="btn btn-outline-danger" onClick={handleCancel}>
                Cancel Invoice
              </button>
            )}
          </>
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <DocSection title="Document Status">
        <DocStatusExplainer
          status={invoice.status}
          statusLabel="Payment Status"
          docStatus={invoice.doc_status || "Open"}
          explain={
            isCancelled
              ? "This invoice was cancelled — its base sales order has been re-opened."
              : invoice.balance_remaining > 0
              ? `${invoice.status} — ${invoice.balance_remaining.toLocaleString()} of ${Number(invoice.invoice_amount || 0).toLocaleString()} still owed. Payment status updates automatically as payments are recorded.`
              : `Fully paid — ${invoice.total_paid.toLocaleString()} received against ${Number(invoice.invoice_amount || 0).toLocaleString()}.`
          }
        />
      </DocSection>

      <div className="row">
        <div className="col-md-7">
          {invoice.base_order && (
            <DocSection title="Items Invoiced (from base Sales Order)">
              <div className="table-wrap">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoice.items || []).length === 0 ? (
                      <tr><td colSpan="5" className="text-center text-muted py-3">No line items on the base order.</td></tr>
                    ) : (
                      invoice.items.map((it, i) => (
                        <tr key={i}>
                          <td>{it.item_name} <span className="text-muted">({it.item_code})</span></td>
                          <td>{it.quantity}</td>
                          <td>{it.unit}</td>
                          <td>{Number(it.unit_price || 0).toLocaleString()}</td>
                          <td className="fw-semibold">{Number(it.total || 0).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </DocSection>
          )}

          <DocSection title="Payment History">
            {(invoice.payments || []).length === 0 ? (
              <p className="text-muted mb-0">No payments recorded against this invoice yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-semibold">{p.payment_reference}</td>
                        <td>{Number(p.amount_paid || 0).toLocaleString()}</td>
                        <td>{p.payment_method}</td>
                        <td>{p.payment_date}</td>
                        <td><StatusPill status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="d-flex justify-content-end mt-3">
              <div style={{ minWidth: 260 }}>
                <div className="d-flex justify-content-between"><span className="text-muted">Invoice Total</span><span>{Number(invoice.invoice_amount || 0).toLocaleString()}</span></div>
                <div className="d-flex justify-content-between"><span className="text-muted">Total Paid</span><span>{invoice.total_paid.toLocaleString()}</span></div>
                <div className="d-flex justify-content-between fw-bold" style={{ fontSize: 16, borderTop: "1px solid var(--border)", marginTop: 6, paddingTop: 6 }}>
                  <span>Balance</span><span>{invoice.balance_remaining.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </DocSection>
        </div>

        <div className="col-md-5">
          <DocSection title="Customer">
            <p className="mb-1 fw-semibold">{invoice.customer_name}</p>
            <p className="mb-0 text-muted">{invoice.base_order?.customer_code || ""}</p>
          </DocSection>

          <DocSection title="Related Documents">
            {invoice.base_order && (
              <RelatedDocLink
                icon={<Icon.FileText size={18} />}
                label="Sales Order"
                number={invoice.base_order.order_number}
                sub="Base document — this invoice was copied from it"
                to={`/sales-orders/${invoice.base_order.id}`}
              />
            )}
            {!isOpen && invoice.closed_by_type === "delivery" && (
              <RelatedDocLink
                icon={<Icon.Truck size={18} />}
                label="Delivery"
                number={invoice.closed_by_number}
                sub="Copied from this invoice"
                to={`/deliveries/${invoice.closed_by_id}`}
              />
            )}
            {!invoice.base_order && isOpen && (
              <p className="text-muted mb-0" style={{ fontSize: 13 }}>No related documents yet.</p>
            )}
          </DocSection>
        </div>
      </div>
    </div>
  );
}

export default InvoiceDetail;
