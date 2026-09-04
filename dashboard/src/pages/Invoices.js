import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

function Invoices() {
  const location = useLocation();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [soLookupError, setSoLookupError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [formData, setFormData] = useState({
    invoice_number: "",
    customer_name: "",
    sales_order_id: "",
    invoice_amount: "",
    due_date: "",
    status: "Pending",
  });

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/invoices");
      setInvoices(res.data || []);
    } catch (error) {
      console.error("FETCH INVOICES ERROR:", error.response?.data || error.message);
      showMessage("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  // Only Approved AND still-Open orders can be invoiced — an order
  // that's already Closed (already invoiced or delivered) shouldn't
  // show up here to invoice again.
  const fetchSalesOrders = async () => {
    setSoLookupError("");
    try {
      const res = await api.get("/admin/sales-orders");
      setSalesOrders(
        (res.data || []).filter(
          (o) => (!o.status || o.status === "Approved") && (o.doc_status || "Open") === "Open"
        )
      );
    } catch (error) {
      console.error("FETCH SALES ORDERS ERROR:", error.response?.data || error.message);
      setSoLookupError("Could not load sales orders (" + (error.response?.status || "no response") + ").");
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchSalesOrders();
  }, []);

  // Arrived here via "Copy to Invoice" from a Sales Order detail page.
  useEffect(() => {
    const source = location.state?.copyFromOrder;
    if (source) {
      setFormData({
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        customer_name: source.customer_name || "",
        sales_order_id: String(source.id),
        invoice_amount: source.total_amount || "",
        due_date: "",
        status: "Pending",
      });
      setShowForm(true);
      // Clear the router state so refreshing the page doesn't reopen this.
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "sales_order_id") {
      const selectedOrder = salesOrders.find((order) => String(order.id) === value);
      setFormData({
        ...formData,
        sales_order_id: value,
        customer_name: selectedOrder ? selectedOrder.customer_name : "",
        invoice_amount: selectedOrder ? selectedOrder.total_amount : "",
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setSaveError("");
    try {
      if (!formData.sales_order_id || !formData.due_date) {
        showMessage("Sales Order and Due Date are required");
        return;
      }

      const payload = {
        invoice_number: formData.invoice_number,
        customer_name: formData.customer_name,
        sales_order_id: Number(formData.sales_order_id),
        invoice_amount: Number(formData.invoice_amount || 0),
        due_date: formData.due_date,
        status: "Pending",
      };

      await api.post("/create-invoice", payload);

      showMessage("Invoice created successfully");
      resetForm();
      fetchInvoices();
      fetchSalesOrders();
    } catch (error) {
      console.error("SAVE ERROR:", error.response?.data || error.message);
      setSaveError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create invoice"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_number: "",
      customer_name: "",
      sales_order_id: "",
      invoice_amount: "",
      due_date: "",
      status: "Pending",
    });
    setSaveError("");
    setShowForm(false);
  };

  const tc = useTableControls(invoices, {
    searchKeys: ["invoice_number", "customer_name", "status"],
  });

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Invoices are created against an approved, still-Open sales order. Click a row to open the full document."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData((f) => ({ ...f, invoice_number: `INV-${Date.now().toString().slice(-6)}` }));
              setShowForm(true);
            }}
          >
            <Icon.Plus size={14} /> Create Invoice
          </button>
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <FilterBar
        searchValue={tc.search}
        onSearchChange={tc.setSearch}
        placeholder="Search invoice #, customer, status..."
        onAddFilter={() => showMessage("Custom filters coming soon")}
        onRefresh={fetchInvoices}
        right={<ExportButton api={api} url="/admin/invoices/export" filename="invoices.xlsx" />}
      />

      <div className="card p-0">
        <div className="table-wrap">
          {loading ? (
            <p className="p-4 mb-0">Loading invoices...</p>
          ) : (
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <SortableTh label="Invoice #" sortKey="invoice_number" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <SortableTh label="Customer" sortKey="customer_name" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <SortableTh label="Amount" sortKey="invoice_amount" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <SortableTh label="Due Date" sortKey="due_date" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Payment Status</th>
                  <th>Document</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tc.pageRows.length === 0 ? (
                  <tr><td colSpan="7"><EmptyState label="No invoices found." /></td></tr>
                ) : (
                  tc.pageRows.map((inv) => (
                    <tr key={inv.id}>
                      <td className="fw-semibold">
                        <span className="table-link" onClick={() => navigate(`/invoices/${inv.id}`)}>
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td>{inv.customer_name}</td>
                      <td>{Number(inv.invoice_amount || 0).toLocaleString()}</td>
                      <td>{inv.due_date}</td>
                      <td><StatusPill status={inv.status} /></td>
                      <td><StatusPill status={inv.doc_status || "Open"} /></td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/invoices/${inv.id}`)}>
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
          <h5>Create Invoice</h5>

          {saveError && <div className="alert alert-danger py-2">{saveError}</div>}

          <label>Invoice Number</label>
          <input
            name="invoice_number"
            className="form-control mb-2"
            placeholder="e.g. INV-0001"
            value={formData.invoice_number}
            onChange={handleChange}
            title="Suggested automatically — edit if your backend expects a different format"
          />

          <label>Sales Order</label>
          {soLookupError && <div className="alert alert-danger py-2">{soLookupError}</div>}
          <select
            name="sales_order_id"
            className="form-control mb-2"
            value={formData.sales_order_id}
            onChange={handleChange}
          >
            <option value="">Select Sales Order</option>
            {salesOrders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.order_number} - {order.customer_name}
              </option>
            ))}
          </select>
          {!soLookupError && salesOrders.length === 0 && (
            <div className="alert alert-warning py-2">
              No approved, still-Open sales orders found. An order already invoiced or
              delivered is Closed and can't be invoiced again.
            </div>
          )}

          <input
            name="customer_name"
            className="form-control mb-2"
            placeholder="Customer"
            value={formData.customer_name}
            readOnly
          />

          <input
            name="invoice_amount"
            className="form-control mb-2"
            placeholder="Invoice Amount"
            value={formData.invoice_amount}
            readOnly
          />

          <label>Due Date</label>
          <input
            type="date"
            name="due_date"
            className="form-control mb-3"
            value={formData.due_date}
            onChange={handleChange}
          />

          <button className="btn btn-success me-2" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default Invoices;
