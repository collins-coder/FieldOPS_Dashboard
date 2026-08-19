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

function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [viewing, setViewing] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selected, setSelected] = useState([]);

  const tc = useTableControls(orders, {
    searchKeys: ["order_number", "customer_name", "created_by_name", "status"],
  });

  // ================= MESSAGE =================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // ================= FETCH SALES ORDERS =================
  const fetchOrders = useCallback(async () => {
    setLoading(true);

    try {
      // NOTE: the real endpoint lives under /admin/sales-orders.
      // Orders are created from the field (mobile app) with full
      // line-item detail - this page is for viewing and
      // approving/cancelling, not manual flat-field creation.
      const res = await api.get("/admin/sales-orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("FETCH ORDERS ERROR:", err.response?.data || err.message);
      showMessage("Failed to load sales orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ================= VIEW DETAIL =================
  const handleView = async (order) => {
    setLoadingDetail(true);

    try {
      const res = await api.get(`/admin/sales-orders/${order.id}`);
      setViewing(res.data);
    } catch (err) {
      console.error("FETCH DETAIL ERROR:", err.response?.data || err.message);
      showMessage("Failed to load order detail");
    } finally {
      setLoadingDetail(false);
    }
  };

  // ================= STATUS CHANGE =================
  const handleStatusChange = async (order, newStatus) => {
    try {
      await api.patch(`/admin/sales-orders/${order.id}/status`, {
        status: newStatus
      });

      showMessage(`Order marked as ${newStatus}`);
      fetchOrders();

      if (viewing && viewing.id === order.id) {
        setViewing({ ...viewing, status: newStatus });
      }

    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err.response?.data || err.message);
      showMessage(err.response?.data?.message || "Failed to update status");
    }
  };

  // ================= PRINT =================
  const handlePrint = (order) => {
    const w = window.open("", "_blank");

    const itemRows = (order.items || [])
      .map(
        (item) => `
          <tr>
            <td>${item.item_name || ""}<br/><small>${item.item_code || ""}</small></td>
            <td>${item.quantity} ${item.unit || ""}</td>
            <td>${Number(item.unit_price).toLocaleString()}</td>
            <td>${Number(item.discount).toLocaleString()}</td>
            <td>${Number(item.total).toLocaleString()}</td>
          </tr>
        `
      )
      .join("");

    w.document.write(`
      <html>
        <head>
          <title>Sales Order ${order.order_number}</title>
          <style>
            body { font-family: Arial; padding: 30px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h2>SALES ORDER #${order.order_number}</h2>
          <p><strong>Customer:</strong> ${order.customer_name || "-"}</p>
          <p><strong>Order Date:</strong> ${order.order_date || "-"}</p>
          <p><strong>Due Date:</strong> ${order.due_date || "-"}</p>
          <p><strong>Status:</strong> ${order.status}</p>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <p style="text-align:right; margin-top:20px;">
            <strong>Subtotal:</strong> ${Number(order.subtotal).toLocaleString()}<br/>
            <strong>Discount:</strong> ${Number(order.discount_total).toLocaleString()}<br/>
            <strong>Grand Total:</strong> ${Number(order.total_amount).toLocaleString()}
          </p>
        </body>
      </html>
    `);

    w.document.close();
    w.print();
  };

  // ================= SELECTION =================
  const toggleRow = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const toggleAll = () => {
    if (selected.length === tc.pageRows.length) {
      setSelected([]);
    } else {
      setSelected(tc.pageRows.map((o) => o.id));
    }
  };

  // ================= UI =================
  return (
    <div>

      <PageHeader
        title="Sales Orders"
        subtitle="Orders are created from the field app during a visit. Review, approve, or cancel them here."
      />

      {/* MESSAGE */}
      {message && <div className="alert alert-info">{message}</div>}

      <FilterBar
        searchValue={tc.search}
        onSearchChange={tc.setSearch}
        placeholder="Search order #, customer, sales rep..."
        onAddFilter={() => showMessage("Custom filters coming soon")}
        onRefresh={fetchOrders}
        right={
          <button className="btn btn-light" onClick={() => showMessage("Column visibility coming soon")}>
            <Icon.Eye size={14} /> View
          </button>
        }
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
                  <th style={{ width: 36 }}>
                    <input
                      type="checkbox"
                      checked={tc.pageRows.length > 0 && selected.length === tc.pageRows.length}
                      onChange={toggleAll}
                    />
                  </th>
                  <SortableTh label="Order #" sortKey="order_number" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <SortableTh label="Date" sortKey="order_date" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <SortableTh label="Customer" sortKey="customer_name" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <SortableTh label="Created By" sortKey="created_by_name" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <SortableTh label="Status" sortKey="status" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Sync Status</th>
                  <SortableTh label="Total" sortKey="total_amount" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tc.pageRows.length === 0 ? (
                  <tr>
                    <td colSpan="9"><EmptyState label="No sales orders found." /></td>
                  </tr>
                ) : (
                  tc.pageRows.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(order.id)}
                          onChange={() => toggleRow(order.id)}
                        />
                      </td>
                      <td>
                        <span className="table-link" onClick={() => handleView(order)}>
                          {order.order_number}
                        </span>
                      </td>
                      <td>{order.order_date}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.created_by_name || order.created_by || "—"}</td>
                      <td><StatusPill status={order.status} /></td>
                      <td><StatusPill status={order.sync_status || "Not Synced"} /></td>
                      <td>{Number(order.total_amount || 0).toLocaleString()}</td>

                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleView(order)}
                          >
                            View
                          </button>

                          {order.status === "Pending" && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                  handleStatusChange(order, "Approved")
                                }
                              >
                                Approve
                              </button>

                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleStatusChange(order, "Cancelled")
                                }
                              >
                                Cancel
                              </button>
                            </>
                          )}
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

      {/* DETAIL MODAL */}
      {viewing && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">
                  Sales Order #{viewing.order_number}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewing(null)}
                ></button>
              </div>

              <div className="modal-body">

                {loadingDetail ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <h6>Customer</h6>
                        <p className="mb-1">{viewing.customer_name}</p>
                        <p className="text-muted mb-0">
                          {viewing.customer_location || "—"}
                        </p>
                      </div>

                      <div className="col-md-6">
                        <h6>Order Details</h6>
                        <p className="mb-1">
                          Order Date: {viewing.order_date || "—"}
                        </p>
                        <p className="mb-1">
                          Due Date: {viewing.due_date || "—"}
                        </p>
                        <p className="mb-1">
                          Warehouse: {viewing.warehouse_name || "N/A"}
                        </p>
                        <p className="mb-0">
                          Sync Status: <StatusPill status={viewing.sync_status || "Not Synced"} />
                        </p>
                      </div>
                    </div>

                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Discount</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(viewing.items || []).map((item) => (
                          <tr key={item.id}>
                            <td>
                              {item.item_name}
                              <br />
                              <small className="text-muted">
                                {item.item_code}
                              </small>
                            </td>
                            <td>
                              {item.quantity} {item.unit || ""}
                            </td>
                            <td>
                              {Number(item.unit_price).toLocaleString()}
                            </td>
                            <td>{Number(item.discount).toLocaleString()}</td>
                            <td>{Number(item.total).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="text-end">
                      <p className="mb-1">
                        Subtotal: {Number(viewing.subtotal).toLocaleString()}
                      </p>
                      <p className="mb-1 text-danger">
                        Discount: -{" "}
                        {Number(viewing.discount_total).toLocaleString()}
                      </p>
                      <h5>
                        Grand Total:{" "}
                        {Number(viewing.total_amount).toLocaleString()}
                      </h5>
                    </div>
                  </>
                )}

              </div>

              <div className="modal-footer">
                {viewing.status === "Pending" && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleStatusChange(viewing, "Approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleStatusChange(viewing, "Cancelled")}
                    >
                      Cancel Order
                    </button>
                  </>
                )}

                <button
                  className="btn btn-dark"
                  onClick={() => handlePrint(viewing)}
                >
                  Print
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setViewing(null)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SalesOrders;