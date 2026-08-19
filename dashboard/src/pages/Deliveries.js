import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axiosConfig";
import { Icon } from "../components/Icons";
import {
  PageHeader,
  FilterBar,
  StatusPill,
  SortableTh,
  TableFooter,
  EmptyState,
  useTableControls,
} from "../components/ui";

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Reference lookups (populated from real endpoints, not hardcoded)
  const [salesOrders, setSalesOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [referenceType, setReferenceType] = useState("sales_order");
  const [referenceId, setReferenceId] = useState("");

  // Line items pulled from the selected sales order (or the sales
  // order linked to a selected invoice), used to populate the item
  // dropdown instead of free-typing it.
  const [availableItems, setAvailableItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [formData, setFormData] = useState({
    item_name: "",
    quantity: "",
    driver_name: "",
    vehicle_details: "",
    agent: "",
    delivery_date: "",
    status: "Not Started",
    return_status: "No Return",
    return_reason: ""
  });

  // ================= MESSAGE =================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // ================= FETCH DELIVERIES =================
  const fetchDeliveries = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get("/deliveries");
      setDeliveries(res.data || []);
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
      showMessage("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  }, []);

  // ================= FETCH REFERENCE LOOKUPS =================
  // NOTE: these two calls are intentionally independent (allSettled, not
  // all) — if /admin/invoices fails for any reason, the Sales Order
  // dropdown must still populate, and vice versa. Previously this used
  // Promise.all, which meant ONE failing call silently emptied BOTH
  // dropdowns with no visible error.
  const [lookupError, setLookupError] = useState("");

  const fetchReferenceLookups = useCallback(async () => {
    setLookupError("");
    const [soRes, invRes] = await Promise.allSettled([
      api.get("/admin/sales-orders"),
      api.get("/admin/invoices"),
    ]);

    if (soRes.status === "fulfilled") {
      setSalesOrders(soRes.value.data || []);
    } else {
      console.error("SALES ORDER LOOKUP ERROR:", soRes.reason?.response?.data || soRes.reason?.message);
      setSalesOrders([]);
    }

    if (invRes.status === "fulfilled") {
      setInvoices(invRes.value.data || []);
    } else {
      console.error("INVOICE LOOKUP ERROR:", invRes.reason?.response?.data || invRes.reason?.message);
      setInvoices([]);
    }

    if (soRes.status === "rejected" && invRes.status === "rejected") {
      setLookupError("Could not load sales orders or invoices — check that you're logged in and the backend is reachable.");
    } else if (soRes.status === "rejected") {
      setLookupError("Could not load sales orders (" + (soRes.reason?.response?.status || "no response") + "). Invoices loaded fine, so this is likely specific to the sales orders endpoint.");
    } else if (invRes.status === "rejected") {
      setLookupError("Could not load invoices (" + (invRes.reason?.response?.status || "no response") + "). Sales orders loaded fine, so this is likely specific to the invoices endpoint.");
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
    fetchReferenceLookups();
  }, [fetchDeliveries, fetchReferenceLookups]);

  // ================= LOAD ITEMS FOR SELECTED REFERENCE =================
  // Sales orders carry their own line items. Invoices don't store line
  // items directly, but if an invoice was generated from a sales order
  // (invoice.sales_order_id), we pull that order's items instead so
  // the item dropdown still works.
  const loadAvailableItems = useCallback(
    async (salesOrderIdToLoad) => {
      if (!salesOrderIdToLoad) {
        setAvailableItems([]);
        return;
      }

      try {
        setLoadingItems(true);
        const res = await api.get(
          `/admin/sales-orders/${salesOrderIdToLoad}`
        );
        setAvailableItems(res.data.items || []);
      } catch (err) {
        console.error(
          "ORDER ITEMS ERROR:",
          err.response?.data || err.message
        );
        setAvailableItems([]);
      } finally {
        setLoadingItems(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!referenceId) {
      setAvailableItems([]);
      return;
    }

    if (referenceType === "sales_order") {
      loadAvailableItems(referenceId);
    } else {
      const invoice = invoices.find(
        (inv) => String(inv.id) === String(referenceId)
      );

      loadAvailableItems(invoice?.sales_order_id || null);
    }
  }, [referenceId, referenceType, invoices, loadAvailableItems]);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "quantity" ? value.replace(/[^0-9.]/g, "") : value
    });
  };

  const handleReferenceTypeChange = (e) => {
    setReferenceType(e.target.value);
    setReferenceId("");
    setAvailableItems([]);
  };

  const handleItemSelect = (e) => {
    const selectedName = e.target.value;

    const matchingLine = availableItems.find(
      (line) => line.item_name === selectedName
    );

    setFormData({
      ...formData,
      item_name: selectedName,
      quantity: matchingLine ? String(matchingLine.quantity) : formData.quantity
    });
  };

  // ================= SAVE (CREATE + UPDATE) =================
  const handleSave = async () => {
    if (!editing && !referenceId) {
      showMessage("Please select a sales order or invoice");
      return;
    }

    if (!formData.item_name || !formData.quantity) {
      showMessage("Item and quantity are required");
      return;
    }

    try {
      if (editing) {
        await api.put(`/deliveries/${editing.id}`, formData);
        showMessage("Delivery updated successfully");
      } else {
        await api.post("/deliveries", {
          reference_type: referenceType,
          reference_id: referenceId,
          ...formData
        });
        showMessage("Delivery created successfully");
      }

      resetForm();
      fetchDeliveries();

    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err.message);
      showMessage(err.response?.data?.message || "Save failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (d) => {
    setEditing(d);
    setShowForm(true);

    setReferenceType(d.reference_type);
    setReferenceId(d.sales_order_id || d.invoice_id || "");

    setFormData({
      item_name: d.item_name || "",
      quantity: d.quantity || "",
      driver_name: d.driver_name || "",
      vehicle_details: d.vehicle_details || "",
      agent: d.agent || "",
      delivery_date: d.delivery_date || "",
      status: d.status || "Not Started",
      return_status: d.return_status || "No Return",
      return_reason: d.return_reason || ""
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this delivery?")) return;

    try {
      await api.delete(`/deliveries/${id}`);
      showMessage("Delivery deleted successfully");
      fetchDeliveries();
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err.message);
      showMessage("Delete failed");
    }
  };

  // ================= PRINT =================
  const handlePrint = (d) => {
    const w = window.open("", "_blank");

    w.document.write(`
      <html>
        <head>
          <title>Delivery Note</title>
          <style>
            body { font-family: Arial; padding: 30px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td, th { border: 1px solid #ddd; padding: 10px; }
          </style>
        </head>
        <body>
          <h2>DELIVERY NOTE</h2>

          <table>
            <tr><th>Dispatch Code</th><td>${d.dispatch_code}</td></tr>
            <tr><th>Reference</th><td>${
              d.reference_type === "invoice" ? "Invoice" : "Sales Order"
            } - ${d.order_number || "-"}</td></tr>
            <tr><th>Customer</th><td>${d.customer_name || "-"}</td></tr>
            <tr><th>Address</th><td>${d.delivery_address || "-"}</td></tr>
            <tr><th>Item</th><td>${d.item_name}</td></tr>
            <tr><th>Quantity</th><td>${d.quantity}</td></tr>
            <tr><th>Driver</th><td>${d.driver_name || "-"}</td></tr>
            <tr><th>Vehicle</th><td>${d.vehicle_details || "-"}</td></tr>
            <tr><th>Status</th><td>${d.status}</td></tr>
            <tr><th>Return Status</th><td>${d.return_status}</td></tr>
            <tr><th>Return Reason</th><td>${d.return_reason || "-"}</td></tr>
          </table>

          <br><br>
          <p>Driver Signature: ____________________</p>
          <p>Customer Signature: __________________</p>
        </body>
      </html>
    `);

    w.document.close();
    w.print();
  };

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      item_name: "",
      quantity: "",
      driver_name: "",
      vehicle_details: "",
      agent: "",
      delivery_date: "",
      status: "Not Started",
      return_status: "No Return",
      return_reason: ""
    });

    setReferenceType("sales_order");
    setReferenceId("");
    setAvailableItems([]);
    setEditing(null);
    setShowForm(false);
  };

  // ================= UI =================
  const tc = useTableControls(deliveries, {
    searchKeys: ["dispatch_code", "order_number", "customer_name", "driver_name", "status"],
  });

  return (
    <div>

      <PageHeader
        title="Deliveries"
        subtitle="Create deliveries directly against approved sales orders or invoices."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true);
              setEditing(null);
            }}
          >
            <Icon.Plus size={14} /> Add Delivery
          </button>
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <FilterBar
        searchValue={tc.search}
        onSearchChange={tc.setSearch}
        placeholder="Search dispatch code, order #, customer, driver..."
        onAddFilter={() => showMessage("Custom filters coming soon")}
        onRefresh={fetchDeliveries}
      />

      {/* TABLE */}
      <div className="card p-0">
        <div className="table-wrap">
          {loading ? (
            <p className="p-4 mb-0">Loading...</p>
          ) : (
            <table className="table table-hover align-middle">

              <thead>
                <tr>
                  <SortableTh label="Dispatch" sortKey="dispatch_code" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Reference</th>
                  <th>Order/Invoice #</th>
                  <SortableTh label="Customer" sortKey="customer_name" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Return</th>
                  <SortableTh label="Date" sortKey="delivery_date" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tc.pageRows.length === 0 ? (
                  <tr><td colSpan="9"><EmptyState label="No deliveries found." /></td></tr>
                ) : (
                  tc.pageRows.map((d) => (
                    <tr key={d.id}>
                      <td className="fw-semibold">{d.dispatch_code}</td>
                      <td className="text-capitalize">
                        {d.reference_type === "invoice" ? "Invoice" : "Sales Order"}
                      </td>
                      <td>{d.order_number}</td>
                      <td>{d.customer_name}</td>
                      <td>{d.driver_name}</td>
                      <td><StatusPill status={d.status} /></td>
                      <td><StatusPill status={d.return_status} /></td>
                      <td>{d.delivery_date}</td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(d)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-light"
                            onClick={() => handlePrint(d)}
                          >
                            Print
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(d.id)}
                          >
                            Delete
                          </button>
                        </div>
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

      {/* FORM */}
      {showForm && (
        <div className="card p-4 mt-4">
          <h5>{editing ? "Edit Delivery" : "Add Delivery"}</h5>

          {/* Reference selection - only when creating. Editing keeps
              the original reference fixed; see update_delivery(). */}
          {!editing && (
            <>
              {lookupError && (
                <div className="alert alert-danger py-2">{lookupError}</div>
              )}

              <label className="form-label mb-1">Deliver Against</label>
              <select
                className="form-control mb-2"
                value={referenceType}
                onChange={handleReferenceTypeChange}
              >
                <option value="sales_order">Sales Order</option>
                <option value="invoice">Invoice</option>
              </select>

              <label className="form-label mb-1">
                {referenceType === "invoice" ? "Invoice" : "Sales Order"}
              </label>
              <select
                className="form-control mb-2"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
              >
                <option value="">-- Select --</option>
                {(referenceType === "invoice"
                  ? invoices
                  // Only approved orders should be deliverable — an
                  // un-approved order showing here would let someone
                  // dispatch stock against something that was never
                  // confirmed.
                  : salesOrders.filter((o) => !o.status || o.status === "Approved")
                ).map((ref) => (
                  <option key={ref.id} value={ref.id}>
                    {referenceType === "invoice"
                      ? ref.invoice_number
                      : ref.order_number}{" "}
                    - {ref.customer_name}
                  </option>
                ))}
              </select>

              {!lookupError &&
                (referenceType === "invoice" ? invoices : salesOrders).length === 0 && (
                  <div className="alert alert-warning py-2">
                    No {referenceType === "invoice" ? "invoices" : "approved sales orders"} found.
                    The API call succeeded but returned an empty list — either none exist yet,
                    or (if you know you've created some) this endpoint may be scoped to a
                    different branch/user than the one showing them on the{" "}
                    {referenceType === "invoice" ? "Invoices" : "Sales Orders"} page.
                  </div>
                )}
            </>
          )}

          {editing && (
            <div className="alert alert-secondary py-2">
              Linked to {editing.reference_type === "invoice"
                ? "Invoice"
                : "Sales Order"}{" "}
              <strong>{editing.order_number}</strong> for{" "}
              <strong>{editing.customer_name}</strong>. To deliver against a
              different order/invoice, create a new delivery instead.
            </div>
          )}

          {/* Item selection - pulled from the order's real line items
              when available, otherwise free text as a fallback. */}
          <label className="form-label mb-1">Item</label>
          {availableItems.length > 0 ? (
            <select
              className="form-control mb-2"
              value={formData.item_name}
              onChange={handleItemSelect}
              disabled={loadingItems}
            >
              <option value="">-- Select item --</option>
              {availableItems.map((line) => (
                <option key={line.id} value={line.item_name}>
                  {line.item_name} ({line.quantity} {line.unit || ""})
                </option>
              ))}
            </select>
          ) : (
            <input
              name="item_name"
              className="form-control mb-2"
              placeholder="Item name"
              value={formData.item_name}
              onChange={handleChange}
            />
          )}

          <input
            name="quantity"
            className="form-control mb-2"
            placeholder="Quantity to deliver"
            value={formData.quantity}
            onChange={handleChange}
          />

          <input
            name="driver_name"
            className="form-control mb-2"
            placeholder="Driver"
            value={formData.driver_name}
            onChange={handleChange}
          />

          <input
            name="vehicle_details"
            className="form-control mb-2"
            placeholder="Vehicle"
            value={formData.vehicle_details}
            onChange={handleChange}
          />

          <input
            name="agent"
            className="form-control mb-2"
            placeholder="Agent"
            value={formData.agent}
            onChange={handleChange}
          />

          <input
            type="date"
            name="delivery_date"
            className="form-control mb-2"
            value={formData.delivery_date}
            onChange={handleChange}
          />

          <select
            name="status"
            className="form-control mb-2"
            value={formData.status}
            onChange={handleChange}
          >
            <option>Not Started</option>
            <option>Pending</option>
            <option>Delivered</option>
          </select>

          <select
            name="return_status"
            className="form-control mb-2"
            value={formData.return_status}
            onChange={handleChange}
          >
            <option>No Return</option>
            <option>Returned</option>
            <option>Partially Returned</option>
          </select>

          <input
            name="return_reason"
            className="form-control mb-3"
            placeholder="Return Reason"
            value={formData.return_reason}
            onChange={handleChange}
          />

          <button className="btn btn-success me-2" onClick={handleSave}>
            {editing ? "Update" : "Save"}
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