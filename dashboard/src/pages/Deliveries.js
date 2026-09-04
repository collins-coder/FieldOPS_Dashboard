import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { MASTERS_BASE } from "../api/mastersBase";
import { Icon } from "../components/Icons";
import {
  PageHeader,
  FilterBar,
  StatusPill,
  SortableTh,
  TableFooter,
  EmptyState,
  ExportButton,
  useTableControls,
} from "../components/ui";

/* ============================================================
   Matches the backend exactly: POST /deliveries takes
   { references: [{reference_type, reference_id}, ...], driver_id,
   delivery_date } — no items. Items are pulled automatically server-
   side from each referenced order's line items. This form is a
   "cart": pick Sales Orders or Invoices from a tab, check as many as
   needed, switch tabs and add more — the cart holds the mixed
   selection until you save.
   ============================================================ */

function Deliveries() {
  const location = useLocation();
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [salesOrders, setSalesOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [lookupError, setLookupError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [refTab, setRefTab] = useState("sales_order"); // which list is showing in the cart-builder
  const [cart, setCart] = useState([]); // [{reference_type, reference_id, order_number, customer_name}]
  const [driverId, setDriverId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 5000);
  };

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/deliveries");
      setDeliveries(res.data || []);
    } catch (err) {
      console.error("FETCH DELIVERIES ERROR:", err.response?.data || err.message);
      showMessage("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    setLookupError("");
    const [soRes, invRes, drvRes] = await Promise.allSettled([
      api.get("/admin/sales-orders"),
      api.get("/admin/invoices"),
      api.get(`${MASTERS_BASE}/drivers`),
    ]);

    if (soRes.status === "fulfilled") {
      setSalesOrders(
        (soRes.value.data || []).filter(
          (o) => (!o.status || o.status === "Approved") && (o.doc_status || "Open") === "Open"
        )
      );
    } else {
      setSalesOrders([]);
    }

    if (invRes.status === "fulfilled") {
      setInvoices((invRes.value.data || []).filter((i) => (i.doc_status || "Open") === "Open"));
    } else {
      setInvoices([]);
    }

    if (drvRes.status === "fulfilled") {
      setDrivers(drvRes.value.data || []);
    } else {
      setDrivers([]);
    }

    if (soRes.status === "rejected" && invRes.status === "rejected") {
      setLookupError("Could not load sales orders or invoices to pick from.");
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchLookups();
  }, []);

  // Arrived via "Copy to Delivery" from a Sales Order or Invoice detail page.
  useEffect(() => {
    const orderSource = location.state?.copyFromOrder;
    const invoiceSource = location.state?.copyFromInvoice;

    if (orderSource) {
      setCart([{
        reference_type: "sales_order",
        reference_id: orderSource.id,
        order_number: orderSource.order_number,
        customer_name: orderSource.customer_name,
      }]);
      setShowForm(true);
      window.history.replaceState({}, document.title);
    } else if (invoiceSource) {
      setCart([{
        reference_type: "invoice",
        reference_id: invoiceSource.id,
        order_number: invoiceSource.invoice_number,
        customer_name: invoiceSource.customer_name,
      }]);
      setShowForm(true);
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const isInCart = (type, id) => cart.some((c) => c.reference_type === type && c.reference_id === id);

  const toggleCartItem = (type, item) => {
    const id = item.id;
    if (isInCart(type, id)) {
      setCart((c) => c.filter((r) => !(r.reference_type === type && r.reference_id === id)));
    } else {
      setCart((c) => [
        ...c,
        {
          reference_type: type,
          reference_id: id,
          order_number: type === "invoice" ? item.invoice_number : item.order_number,
          customer_name: item.customer_name,
        },
      ]);
    }
  };

  const handleSave = async () => {
    setSaveError("");

    if (cart.length === 0) {
      showMessage("Pick at least one sales order or invoice to deliver");
      return;
    }
    if (!driverId) {
      showMessage("Please select a driver");
      return;
    }
    if (!deliveryDate) {
      showMessage("Please set a delivery date");
      return;
    }

    setSaving(true);
    try {
      const res = await api.post("/deliveries", {
        references: cart.map((c) => ({ reference_type: c.reference_type, reference_id: c.reference_id })),
        driver_id: Number(driverId),
        delivery_date: deliveryDate,
      });

      let successMsg = `Delivery ${res.data.dispatch_code} created with ${res.data.item_count} item line(s).`;
      if ((res.data.negative_stock_items || []).length > 0) {
        successMsg += ` ⚠ Stock went negative for: ${res.data.negative_stock_items.map((i) => i.item_code).join(", ")}.`;
      }
      showMessage(successMsg);

      resetForm();
      fetchDeliveries();
      fetchLookups();
    } catch (err) {
      console.error("SAVE DELIVERY ERROR:", err.response?.data || err.message);
      setSaveError(err.response?.data?.message || "Failed to create delivery");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setCart([]);
    setDriverId("");
    setDeliveryDate("");
    setSaveError("");
    setShowForm(false);
    setRefTab("sales_order");
  };

  const tc = useTableControls(deliveries, {
    searchKeys: ["dispatch_code", "customer_name", "driver_name", "status"],
  });

  const listForTab = refTab === "sales_order" ? salesOrders : invoices;

  return (
    <div>
      <PageHeader
        title="Deliveries"
        subtitle="Pick one or more approved orders or invoices — items, quantities and the agent are pulled in automatically."
        actions={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Icon.Plus size={14} /> Add Delivery
          </button>
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <FilterBar
        searchValue={tc.search}
        onSearchChange={tc.setSearch}
        placeholder="Search dispatch code, customer, driver..."
        onAddFilter={() => showMessage("Custom filters coming soon")}
        onRefresh={fetchDeliveries}
        right={<ExportButton api={api} url="/deliveries/export" filename="deliveries.xlsx" />}
      />

      <div className="card p-0">
        <div className="table-wrap">
          {loading ? (
            <p className="p-4 mb-0">Loading...</p>
          ) : (
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <SortableTh label="Dispatch" sortKey="dispatch_code" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <SortableTh label="Customer" sortKey="customer_name" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Agent</th>
                  <th>Driver</th>
                  <SortableTh label="Date" sortKey="delivery_date" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Status</th>
                  <th>Return</th>
                  <th>References</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tc.pageRows.length === 0 ? (
                  <tr><td colSpan="9"><EmptyState label="No deliveries found." /></td></tr>
                ) : (
                  tc.pageRows.map((d) => (
                    <tr key={d.id}>
                      <td className="fw-semibold">
                        <span className="table-link" onClick={() => navigate(`/deliveries/${d.id}`)}>
                          {d.dispatch_code}
                        </span>
                      </td>
                      <td>{d.customer_name}</td>
                      <td>{d.agent || "—"}</td>
                      <td>{d.driver_name || "—"}</td>
                      <td>{d.delivery_date}</td>
                      <td><StatusPill status={d.status} /></td>
                      <td><StatusPill status={d.return_status || "No Return"} /></td>
                      <td>{d.reference_count} doc(s), {d.item_count} item(s)</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/deliveries/${d.id}`)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-3 pb-2">
          <TableFooter
            rowsPerPage={tc.rowsPerPage}
            onRowsPerPageChange={tc.setRowsPerPage}
            totalRows={tc.totalRows}
            page={tc.page}
            totalPages={tc.totalPages}
            onPageChange={tc.setPage}
          />
        </div>
      </div>

      {showForm && (
        <div className="card p-4 mt-4">
          <h5>Add Delivery</h5>

          {saveError && <div className="alert alert-danger py-2">{saveError}</div>}
          {lookupError && <div className="alert alert-warning py-2">{lookupError}</div>}

          <label className="mb-1">Pick documents to deliver</label>
          <div className="btn-group w-100 mb-2" role="group">
            <button
              type="button"
              className={`btn ${refTab === "sales_order" ? "btn-primary" : "btn-light"}`}
              onClick={() => setRefTab("sales_order")}
            >
              Sales Orders ({salesOrders.length} open)
            </button>
            <button
              type="button"
              className={`btn ${refTab === "invoice" ? "btn-primary" : "btn-light"}`}
              onClick={() => setRefTab("invoice")}
            >
              Invoices ({invoices.length} open)
            </button>
          </div>

          <div className="table-wrap mb-3" style={{ maxHeight: 240, overflowY: "auto" }}>
            <table className="table table-sm table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: 36 }}></th>
                  <th>{refTab === "invoice" ? "Invoice #" : "Order #"}</th>
                  <th>Customer</th>
                </tr>
              </thead>
              <tbody>
                {listForTab.length === 0 ? (
                  <tr><td colSpan="3" className="text-center text-muted py-3">
                    Nothing available to pick here.
                  </td></tr>
                ) : (
                  listForTab.map((item) => (
                    <tr
                      key={item.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleCartItem(refTab, item)}
                    >
                      <td>
                        <input type="checkbox" checked={isInCart(refTab, item.id)} onChange={() => {}} />
                      </td>
                      <td>{refTab === "invoice" ? item.invoice_number : item.order_number}</td>
                      <td>{item.customer_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {cart.length > 0 && (
            <div className="mb-3">
              <label className="mb-1">Selected ({cart.length})</label>
              <div className="d-flex flex-wrap gap-2">
                {cart.map((c) => (
                  <span key={`${c.reference_type}-${c.reference_id}`} className="pill pill-info">
                    {c.order_number} ({c.reference_type === "invoice" ? "Invoice" : "Order"})
                    <span
                      style={{ marginLeft: 6, cursor: "pointer", fontWeight: 700 }}
                      onClick={() => toggleCartItem(c.reference_type, { id: c.reference_id })}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <label>Driver</label>
          <select className="form-control mb-2" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            <option value="">-- Select Driver --</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.driver_name} {d.vehicle_details ? `(${d.vehicle_details})` : ""}
              </option>
            ))}
          </select>
          {drivers.length === 0 && (
            <div className="alert alert-warning py-2">
              No drivers found — add one on the Drivers page first.
            </div>
          )}

          <label>Delivery Date</label>
          <input
            type="date"
            className="form-control mb-3"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />

          <div className="alert alert-info py-2">
            The agent, items, and quantities are pulled in automatically from whatever
            you selected above — nothing else to fill in here.
          </div>

          <button className="btn btn-success me-2" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="btn btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default Deliveries;
