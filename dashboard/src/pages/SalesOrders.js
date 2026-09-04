import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
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

function SalesOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState([]);

  const tc = useTableControls(orders, {
    searchKeys: ["order_number", "customer_name", "created_by_name", "status"],
  });

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/sales-orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("FETCH ORDERS ERROR:", err.response?.data || err.message);
      showMessage("Failed to load sales orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Quick approve/cancel right from the list, without needing to open
  // the detail page first — the detail page also has these actions
  // for when you're already looking at the order.
  const handleStatusChange = async (order, newStatus) => {
    try {
      await api.patch(`/admin/sales-orders/${order.id}/status`, { status: newStatus });
      showMessage(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err.response?.data || err.message);
      showMessage(err.response?.data?.message || "Failed to update status");
    }
  };

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

  return (
    <div>
      <PageHeader
        title="Sales Orders"
        subtitle="Orders are created from the field app during a visit. Click a row to open the full document."
      />

      {message && <div className="alert alert-info">{message}</div>}

      <FilterBar
        searchValue={tc.search}
        onSearchChange={tc.setSearch}
        placeholder="Search order #, customer, sales rep..."
        onAddFilter={() => showMessage("Custom filters coming soon")}
        onRefresh={fetchOrders}
        right={<ExportButton api={api} url="/admin/sales-orders/export" filename="sales_orders.xlsx" />}
      />

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
                  <th>Document</th>
                  <SortableTh label="Total" sortKey="total_amount" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tc.pageRows.length === 0 ? (
                  <tr><td colSpan="8"><EmptyState label="No sales orders found." /></td></tr>
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
                        <span className="table-link" onClick={() => navigate(`/sales-orders/${order.id}`)}>
                          {order.order_number}
                        </span>
                      </td>
                      <td>{order.order_date}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.created_by_name || order.created_by || "—"}</td>
                      <td><StatusPill status={order.status} /></td>
                      <td><StatusPill status={order.doc_status || "Open"} /></td>
                      <td>{Number(order.total_amount || 0).toLocaleString()}</td>

                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/sales-orders/${order.id}`)}
                          >
                            View
                          </button>

                          {order.status === "Pending" && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleStatusChange(order, "Approved")}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleStatusChange(order, "Cancelled")}
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
    </div>
  );
}

export default SalesOrders;
