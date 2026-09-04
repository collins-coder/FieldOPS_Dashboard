import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { Icon } from "../components/Icons";
import { PageHeader, DocSection, DocStatusExplainer, RelatedDocLink } from "../components/ui";

function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchPayment = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/admin/payments/${id}`);
      setPayment(res.data);
    } catch (err) {
      console.error("FETCH PAYMENT DETAIL ERROR:", err.response?.data || err.message);
      setError("Could not load this payment (" + (err.response?.status || "no response") + ").");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayment(); /* eslint-disable-next-line */ }, [id]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this payment? The linked invoice's balance will be recalculated.")) return;
    try {
      await api.patch(`/admin/payments/${id}/cancel`);
      showMessage("Payment cancelled — invoice balance recalculated");
      fetchPayment();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to cancel payment");
    }
  };

  if (loading) return <p className="p-4">Loading payment...</p>;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;
  if (!payment) return null;

  const isCancelled = payment.status === "Cancelled";

  return (
    <div>
      <button className="btn btn-light btn-sm mb-3" onClick={() => navigate("/payments")}>
        ← Back to Payments
      </button>

      <PageHeader
        title={`Payment ${payment.payment_reference}`}
        subtitle={`${payment.customer_name || "Unknown customer"} — ${payment.payment_method}`}
        actions={
          !isCancelled && (
            <button className="btn btn-outline-danger" onClick={handleCancel}>
              Cancel Payment
            </button>
          )
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <DocSection title="Document Status">
        <DocStatusExplainer
          status={payment.status}
          statusLabel="Payment Status"
          explain={
            isCancelled
              ? "This payment was cancelled — the linked invoice's balance no longer includes it."
              : "This payment has been applied to the invoice below."
          }
        />
      </DocSection>

      <div className="row">
        <div className="col-md-6">
          <DocSection title="Payment Details">
            <p className="mb-1"><b>Amount:</b> {Number(payment.amount_paid || 0).toLocaleString()}</p>
            <p className="mb-1"><b>Method:</b> {payment.payment_method}</p>
            <p className="mb-1"><b>Date:</b> {payment.payment_date}</p>
            <p className="mb-0"><b>Recorded:</b> {payment.created_at || "—"}</p>
          </DocSection>
        </div>

        <div className="col-md-6">
          <DocSection title="Related Documents">
            {payment.invoice_id ? (
              <RelatedDocLink
                icon={<Icon.FileText size={18} />}
                label="Invoice"
                number={payment.invoice_number}
                sub={`${payment.customer_name} — invoice total ${Number(payment.invoice_amount || 0).toLocaleString()}, currently ${payment.invoice_status}`}
                to={`/invoices/${payment.invoice_id}`}
              />
            ) : (
              <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                Not linked to an invoice (on-account payment).
              </p>
            )}
          </DocSection>
        </div>
      </div>
    </div>
  );
}

export default PaymentDetail;
