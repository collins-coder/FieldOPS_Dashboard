import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { Icon } from "../components/Icons";
import { PageHeader, DocSection, DocStatusExplainer, RelatedDocLink, StatusPill } from "../components/ui";

function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // { [item_id]: quantityString } — how much of each line the user
  // wants to return right now, for a partial return.
  const [returnQty, setReturnQty] = useState({});
  const [returnReason, setReturnReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchDelivery = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/deliveries/${id}`);
      setDelivery(res.data);
    } catch (err) {
      console.error("FETCH DELIVERY DETAIL ERROR:", err.response?.data || err.message);
      setError("Could not load this delivery (" + (err.response?.status || "no response") + ").");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDelivery(); /* eslint-disable-next-line */ }, [id]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 5000);
  };

  const remainingFor = (item) => Number(item.quantity || 0) - Number(item.returned_quantity || 0);

  const handleFullReturn = async () => {
    if (!window.confirm("Return ALL remaining quantity on this delivery back to stock?")) return;
    setProcessing(true);
    try {
      const res = await api.put(`/deliveries/${id}`, {
        driver_id: delivery.driver_id,
        delivery_date: delivery.delivery_date,
        status: delivery.status,
        return_status: "Returned",
        return_reason: returnReason || "Full return",
      });
      showMessage(
        `Return processed — stock restored for ${(res.data.restored_items || []).length} item(s).`
      );
      fetchDelivery();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to process return");
    } finally {
      setProcessing(false);
    }
  };

  const handlePartialReturn = async () => {
    const return_items = Object.entries(returnQty)
      .map(([item_id, qty]) => ({ item_id: Number(item_id), quantity: Number(qty) }))
      .filter((r) => r.quantity > 0);

    if (return_items.length === 0) {
      showMessage("Enter a return quantity for at least one item");
      return;
    }
    if (!returnReason) {
      showMessage("A return reason is required");
      return;
    }

    setProcessing(true);
    try {
      const res = await api.put(`/deliveries/${id}`, {
        driver_id: delivery.driver_id,
        delivery_date: delivery.delivery_date,
        status: delivery.status,
        return_status: "Partially Returned",
        return_reason: returnReason,
        return_items,
      });
      showMessage(
        `Return processed — stock restored for ${(res.data.restored_items || []).length} item(s).`
      );
      setReturnQty({});
      fetchDelivery();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to process return");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p className="p-4">Loading delivery...</p>;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;
  if (!delivery) return null;

  const items = delivery.items || [];
  const hasReturnableStock = items.some((it) => remainingFor(it) > 0);
  const alreadyFullyReturned = items.length > 0 && !hasReturnableStock;

  return (
    <div>
      <button className="btn btn-light btn-sm mb-3" onClick={() => navigate("/deliveries")}>
        ← Back to Deliveries
      </button>

      <PageHeader
        title={`Delivery ${delivery.dispatch_code}`}
        subtitle={`For ${delivery.customer_name} — dispatched ${delivery.delivery_date || "—"}`}
      />

      {message && <div className="alert alert-info">{message}</div>}

      <DocSection title="Document Status">
        <DocStatusExplainer
          status={delivery.status}
          statusLabel="Delivery Status"
          docStatus={delivery.return_status || "No Return"}
          explain={
            alreadyFullyReturned
              ? "Every item on this delivery has already been fully returned — stock has been restored."
              : "Posting this delivery already deducted stock for every item below (SAP B1's Goods Issue). Use the Returns section to put stock back if any of it comes back."
          }
        />
      </DocSection>

      <div className="row">
        <div className="col-md-7">
          <DocSection title="Pick List">
            <div className="table-wrap">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Delivered Qty</th>
                    <th>Unit</th>
                    <th>Already Returned</th>
                    <th>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted py-3">No items on this delivery.</td></tr>
                  ) : (
                    items.map((it) => (
                      <tr key={it.id}>
                        <td>{it.item_name} <span className="text-muted">({it.item_code})</span></td>
                        <td>{it.quantity}</td>
                        <td>{it.unit}</td>
                        <td>{it.returned_quantity || 0}</td>
                        <td className="fw-semibold">{remainingFor(it)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-muted mb-0 mt-2" style={{ fontSize: 12.5 }}>
              Total quantity dispatched: {delivery.total_quantity} across {delivery.total_line_items} line(s).
            </p>
          </DocSection>

          {!alreadyFullyReturned && (
            <DocSection title="Process a Return">
              <label>Return Reason</label>
              <input
                className="form-control mb-3"
                placeholder="e.g. Damaged goods, wrong item, customer refused"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              />

              <div className="table-wrap mb-3">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Remaining</th>
                      <th style={{ width: 160 }}>Return Qty Now</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter((it) => remainingFor(it) > 0).map((it) => (
                      <tr key={it.id}>
                        <td>{it.item_name}</td>
                        <td>{remainingFor(it)}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={remainingFor(it)}
                            className="form-control form-control-sm"
                            value={returnQty[it.item_id] || ""}
                            onChange={(e) =>
                              setReturnQty((q) => ({ ...q, [it.item_id]: e.target.value }))
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary" disabled={processing} onClick={handlePartialReturn}>
                  Return Selected Quantities
                </button>
                <button className="btn btn-outline-danger" disabled={processing} onClick={handleFullReturn}>
                  Return Everything Remaining
                </button>
              </div>
            </DocSection>
          )}
        </div>

        <div className="col-md-5">
          <DocSection title="Customer">
            <p className="mb-0 fw-semibold">{delivery.customer_name}</p>
          </DocSection>

          <DocSection title="Driver">
            <p className="mb-1"><b>Driver:</b> {delivery.driver_name || "—"}</p>
            <p className="mb-1"><b>Vehicle:</b> {delivery.vehicle_details || "—"}</p>
            <p className="mb-0"><b>Phone:</b> {delivery.driver_phone || "—"}</p>
          </DocSection>

          <DocSection title="Related Documents (Base Documents)">
            {(delivery.references || []).length === 0 ? (
              <p className="text-muted mb-0" style={{ fontSize: 13 }}>No linked orders or invoices.</p>
            ) : (
              delivery.references.map((ref) => (
                <RelatedDocLink
                  key={ref.id}
                  icon={<Icon.FileText size={18} />}
                  label={ref.reference_type === "invoice" ? "Invoice" : "Sales Order"}
                  number={ref.order_number}
                  sub={ref.customer_name}
                  to={ref.reference_type === "invoice" ? `/invoices/${ref.reference_id}` : `/sales-orders/${ref.reference_id}`}
                />
              ))
            )}
          </DocSection>
        </div>
      </div>
    </div>
  );
}

export default DeliveryDetail;
