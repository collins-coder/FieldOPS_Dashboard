import React, { useEffect, useState } from "react";
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

/* ============================================================
   SAP B1's "Incoming Payment": pick an open invoice, pay some or
   all of its remaining balance. The backend (create_payment):
     - generates the payment_reference itself from the new row's id
       (PAY-000123) — never sent by this form
     - rejects an amount over the invoice's remaining balance (400)
     - recomputes the invoice's Pending/Partial/Paid status after
   "Pay on account" (a customer with no invoice yet) is NOT
   supported by the backend yet — it needs a schema change
   (payments.customer_id + nullable invoice_id) that hasn't been
   run. Rather than show a form half that always 400s, that path is
   removed until the schema catches up.
   ============================================================ */

function Payments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const [formData, setFormData] = useState({
    invoice_id: "",
    amount_paid: "",
    payment_method: "",
    payment_date: "",
  });

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/payments");
      setPayments(res.data || []);
    } catch (error) {
      console.error("FETCH PAYMENTS ERROR:", error.response?.data || error.message);
      showMessage("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  // Only invoices that still owe something can be paid against.
  const fetchInvoices = async () => {
    try {
      const res = await api.get("/admin/invoices");
      setInvoices((res.data || []).filter((inv) => inv.status !== "Paid" && inv.status !== "Cancelled"));
    } catch (error) {
      console.error("FETCH INVOICES ERROR:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const handleInvoiceSelect = async (invoiceId) => {
    setFormData((f) => ({ ...f, invoice_id: invoiceId, amount_paid: "" }));
    setInvoiceDetail(null);

    if (!invoiceId) return;

    setLoadingBalance(true);
    try {
      const res = await api.get(`/admin/invoices/${invoiceId}`);
      setInvoiceDetail(res.data);
      // Pre-fill with the full remaining balance — the common case
      // is paying it off in one go; user can lower it for a partial.
      setFormData((f) => ({ ...f, amount_paid: res.data.balance_remaining || "" }));
    } catch (err) {
      console.error("FETCH INVOICE BALANCE ERROR:", err.response?.data || err.message);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleSave = async () => {
    setSaveError("");

    if (!formData.invoice_id) {
      showMessage("Please select an invoice");
      return;
    }
    if (!formData.payment_method || !formData.payment_date || !formData.amount_paid) {
      showMessage("Please fill all required fields");
      return;
    }

    try {
      const res = await api.post("/create-payment", {
        invoice_id: Number(formData.invoice_id),
        amount_paid: Number(formData.amount_paid),
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
      });

      showMessage(
        `Payment ${res.data.payment_reference} recorded — invoice is now ${res.data.invoice_status}.`
      );
      resetForm();
      fetchPayments();
      fetchInvoices();
    } catch (error) {
      console.error("SAVE PAYMENT ERROR:", error.response?.data || error.message);
      setSaveError(error.response?.data?.message || "Failed to save payment.");
    }
  };

  const resetForm = () => {
    setFormData({ invoice_id: "", amount_paid: "", payment_method: "", payment_date: "" });
    setInvoiceDetail(null);
    setSaveError("");
    setShowForm(false);
  };

  const tc = useTableControls(payments, {
    searchKeys: ["payment_reference", "payment_method", "status"],
  });

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Record an incoming payment against an open invoice. References are assigned automatically."
        actions={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Icon.Plus size={14} /> Add Payment
          </button>
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <FilterBar
        searchValue={tc.search}
        onSearchChange={tc.setSearch}
        placeholder="Search reference, method, status..."
        onAddFilter={() => showMessage("Custom filters coming soon")}
        onRefresh={fetchPayments}
        right={<ExportButton api={api} url="/admin/payments/export" filename="payments.xlsx" />}
      />

      {/* TABLE */}
      <div className="card p-0">
        <div className="table-wrap">
          {loading ? (
            <p className="p-4 mb-0">Loading payments...</p>
          ) : (
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <SortableTh label="Reference" sortKey="payment_reference" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Invoice</th>
                  <SortableTh label="Amount" sortKey="amount_paid" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Method</th>
                  <SortableTh label="Date" sortKey="payment_date" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tc.pageRows.length === 0 ? (
                  <tr><td colSpan="7"><EmptyState label="No payments found." /></td></tr>
                ) : (
                  tc.pageRows.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold">
                        <span className="table-link" onClick={() => navigate(`/payments/${p.id}`)}>
                          {p.payment_reference}
                        </span>
                      </td>
                      <td>{p.invoice_number || `#${p.invoice_id}`}</td>
                      <td>{Number(p.amount_paid || 0).toLocaleString()}</td>
                      <td>{p.payment_method}</td>
                      <td>{p.payment_date}</td>
                      <td><StatusPill status={p.status} /></td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/payments/${p.id}`)}>
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

      {/* FORM */}
      {showForm && (
        <div className="card p-4 mt-4">
          <h5>Add Payment</h5>

          {saveError && <div className="alert alert-danger py-2">{saveError}</div>}

          <label>Invoice</label>
          <select
            className="form-control mb-2"
            value={formData.invoice_id}
            onChange={(e) => handleInvoiceSelect(e.target.value)}
          >
            <option value="">Select Invoice</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoice_number} - {inv.customer_name} ({inv.status})
              </option>
            ))}
          </select>
          {invoices.length === 0 && (
            <div className="alert alert-warning py-2">
              No open invoices found — every invoice is either fully paid or cancelled.
            </div>
          )}

          {loadingBalance && <p className="text-muted" style={{ fontSize: 13 }}>Loading balance...</p>}

          {invoiceDetail && (
            <div className="alert alert-info py-2" style={{ fontSize: 13 }}>
              Invoice total: <b>{Number(invoiceDetail.invoice_amount || 0).toLocaleString()}</b> —
              already paid: <b>{invoiceDetail.total_paid.toLocaleString()}</b> —
              remaining balance: <b>{invoiceDetail.balance_remaining.toLocaleString()}</b>
            </div>
          )}

          <label>Amount Paid</label>
          <input
            type="number"
            className="form-control mb-2"
            placeholder="Amount Paid"
            value={formData.amount_paid}
            max={invoiceDetail?.balance_remaining}
            onChange={(e) => setFormData((f) => ({ ...f, amount_paid: e.target.value }))}
          />
          {invoiceDetail && (
            <p className="text-muted mb-2" style={{ fontSize: 12 }}>
              Enter less than the full balance to record a partial payment — the invoice
              will show as "Partial" until it's fully settled.
            </p>
          )}

          <select
            className="form-control mb-2"
            value={formData.payment_method}
            onChange={(e) => setFormData((f) => ({ ...f, payment_method: e.target.value }))}
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="M-Pesa">M-Pesa</option>
            <option value="Cheque">Cheque</option>
          </select>

          <input
            type="date"
            className="form-control mb-3"
            value={formData.payment_date}
            onChange={(e) => setFormData((f) => ({ ...f, payment_date: e.target.value }))}
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

export default Payments;
