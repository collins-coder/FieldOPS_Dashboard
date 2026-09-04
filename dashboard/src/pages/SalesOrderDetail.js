import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { Icon } from "../components/Icons";
import { PageHeader, DocSection, DocStatusExplainer, RelatedDocLink, StatusPill } from "../components/ui";

function SalesOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/admin/sales-orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error("FETCH ORDER DETAIL ERROR:", err.response?.data || err.message);
      setError("Could not load this order (" + (err.response?.status || "no response") + ").");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); /* eslint-disable-next-line */ }, [id]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/admin/sales-orders/${id}/status`, { status: newStatus });
      showMessage(`Order ${newStatus.toLowerCase()}`);
      fetchOrder();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <p className="p-4">Loading order...</p>;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;
  if (!order) return null;

  const isOpen = (order.doc_status || "Open") === "Open";

  return (
    <div>
      <button className="btn btn-light btn-sm mb-3" onClick={() => navigate("/sales-orders")}>
        ← Back to Sales Orders
      </button>

      <PageHeader
        title={`Sales Order ${order.order_number}`}
        subtitle={`Created by ${order.created_by || "—"} on ${order.created_at || "—"}`}
        actions={
          <>
            {order.status === "Pending" && (
              <>
                <button className="btn btn-primary" onClick={() => handleStatusChange("Approved")}>
                  <Icon.Check size={14} /> Approve
                </button>
                <button className="btn btn-outline-danger" onClick={() => handleStatusChange("Cancelled")}>
                  Cancel Order
                </button>
              </>
            )}
            {order.status === "Approved" && isOpen && (
              <>
                <button className="btn btn-purple" onClick={() => navigate("/invoices", { state: { copyFromOrder: order } })}>
                  Copy to Invoice
                </button>
                <button className="btn btn-outline-primary" onClick={() => navigate("/deliveries", { state: { copyFromOrder: order } })}>
                  Copy to Delivery
                </button>
              </>
            )}
          </>
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <DocSection title="Document Status">
        <DocStatusExplainer
          status={order.status}
          statusLabel="Approval Status"
          docStatus={order.doc_status || "Open"}
          explain={
            isOpen
              ? "This order hasn't been copied to an invoice or delivery yet — it's still available to copy from."
              : `Closed — already copied to ${order.closed_by_type || "another document"} ${order.closed_by_number || ""}. Cancel that document to re-open this order.`
          }
        />
      </DocSection>

      <div className="row">
        <div className="col-md-7">
          <DocSection title="Line Items">
            <div className="table-wrap">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Unit Price</th>
                    <th>Discount</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted py-3">No line items.</td></tr>
                  ) : (
                    order.items.map((it) => (
                      <tr key={it.id}>
                        <td>{it.item_name} <span className="text-muted">({it.item_code})</span></td>
                        <td>{it.quantity}</td>
                        <td>{it.unit}</td>
                        <td>{Number(it.unit_price || 0).toLocaleString()}</td>
                        <td>{Number(it.discount || 0).toLocaleString()}</td>
                        <td className="fw-semibold">{Number(it.total || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-end mt-3">
              <div style={{ minWidth: 260 }}>
                <div className="d-flex justify-content-between"><span className="text-muted">Subtotal</span><span>{Number(order.subtotal || 0).toLocaleString()}</span></div>
                <div className="d-flex justify-content-between"><span className="text-muted">Discount</span><span>-{Number(order.discount_total || 0).toLocaleString()}</span></div>
                <div className="d-flex justify-content-between fw-bold" style={{ fontSize: 16, borderTop: "1px solid var(--border)", marginTop: 6, paddingTop: 6 }}>
                  <span>Total</span><span>{Number(order.total_amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </DocSection>
        </div>

        <div className="col-md-5">
          <DocSection title="Customer">
            <p className="mb-1 fw-semibold">{order.customer_name}</p>
            <p className="mb-1 text-muted">{order.customer_code}</p>
            <p className="mb-1 text-muted">{order.customer_phone || "—"}</p>
            <p className="mb-0 text-muted">{order.customer_location || "—"}</p>
          </DocSection>

          <DocSection title="Order Details">
            <p className="mb-1"><b>Order Date:</b> {order.order_date || "—"}</p>
            <p className="mb-1"><b>Due Date:</b> {order.due_date || "—"}</p>
            <p className="mb-1"><b>Warehouse:</b> {order.warehouse_name || "N/A"}</p>
            <p className="mb-1"><b>Price List:</b> {order.price_list_name || "N/A"}</p>
            <p className="mb-0"><b>Sync Status:</b> <StatusPill status={order.sync_status || "Not Synced"} /></p>
          </DocSection>

          {!isOpen && order.closed_by_type && (
            <DocSection title="Related Documents">
              <RelatedDocLink
                icon={order.closed_by_type === "invoice" ? <Icon.FileText size={18} /> : <Icon.Truck size={18} />}
                label={order.closed_by_type === "invoice" ? "Invoice" : "Delivery"}
                number={order.closed_by_number}
                sub="Copied from this order"
                to={order.closed_by_type === "invoice" ? `/invoices/${order.closed_by_id}` : `/deliveries/${order.closed_by_id}`}
              />
            </DocSection>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesOrderDetail;
