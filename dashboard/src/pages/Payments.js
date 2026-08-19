import React, { useEffect, useState } from "react";
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

/* ============================================================
   PAY-ON-ACCOUNT NOTE (see API_CONTRACTS.md item 6):
   When "Pay Against" = Customer, this sends { customer_id, ... } and NO
   invoice_id. That only works once the backend accepts payments with no
   invoice (an "on account" payment) and exposes a reconcile endpoint to
   apply it to an invoice later — exactly like SAP B1's Incoming Payment
   screen. If your backend doesn't support that yet, this half of the
   form will 400/422 until it's added — the error will show inline below
   the form so it's obvious what's missing.
   ============================================================ */

function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const [showForm, setShowForm] = useState(false);

  // "invoice" (pay a specific invoice) or "customer" (pay on account,
  // no invoice yet — reconciled later)
  const [payAgainst, setPayAgainst] = useState("invoice");

  const [formData, setFormData] = useState({
    payment_reference: "",
    invoice_id: "",
    customer_id: "",
    amount_paid: "",
    payment_method: "",
    payment_date: "",
    status: "Pending",
  });

  // ================= MESSAGE =================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // ================= FETCH =================
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

  const fetchLookups = async () => {
    const [invRes, custRes] = await Promise.allSettled([
      api.get("/admin/invoices"),
      api.get("/customers"),
    ]);

    setInvoices(invRes.status === "fulfilled" ? invRes.value.data || [] : []);
    setCustomers(custRes.status === "fulfilled" ? custRes.value.data || [] : []);
  };

  useEffect(() => {
    fetchPayments();
    fetchLookups();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "invoice_id") {
      const selectedInvoice = invoices.find((inv) => String(inv.id) === value);
      setFormData({
        ...formData,
        invoice_id: value,
        amount_paid: selectedInvoice ? selectedInvoice.invoice_amount : "",
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const switchPayAgainst = (mode) => {
    setPayAgainst(mode);
    setFormData({
      ...formData,
      invoice_id: "",
      customer_id: "",
      amount_paid: mode === "customer" ? formData.amount_paid : "",
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    setSaveError("");

    if (payAgainst === "invoice" && !formData.invoice_id) {
      showMessage("Please select an invoice, or switch to 'Pay on account'");
      return;
    }
    if (payAgainst === "customer" && !formData.customer_id) {
      showMessage("Please select a customer for this on-account payment");
      return;
    }
    if (!formData.payment_reference || !formData.payment_method || !formData.payment_date || !formData.amount_paid) {
      showMessage("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        payment_reference: formData.payment_reference,
        amount_paid: Number(formData.amount_paid || 0),
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
        status: "Completed",
        ...(payAgainst === "invoice"
          ? { invoice_id: Number(formData.invoice_id) }
          : { customer_id: Number(formData.customer_id), allocation_status: "unallocated" }),
      };

      await api.post("/create-payment", payload);

      showMessage("Payment created successfully");
      resetForm();
      fetchPayments();
    } catch (error) {
      console.error("SAVE PAYMENT ERROR:", error.response?.data || error.message);
      if (payAgainst === "customer" && (error.response?.status === 400 || error.response?.status === 422)) {
        setSaveError(
          "The backend rejected this on-account payment (no invoice attached). It likely doesn't support pay-on-account yet — see API_CONTRACTS.md item 6 for what needs adding server-side."
        );
      } else {
        setSaveError(error.response?.data?.message || "Failed to save payment.");
      }
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      payment_reference: "",
      invoice_id: "",
      customer_id: "",
      amount_paid: "",
      payment_method: "",
      payment_date: "",
      status: "Pending",
    });
    setPayAgainst("invoice");
    setSaveError("");
    setShowForm(false);
  };

  // ================= UI =================
  const tc = useTableControls(payments, {
    searchKeys: ["payment_reference", "payment_method", "status"],
  });

  return (
    <div>

      <PageHeader
        title="Payments"
        subtitle="Record a payment against an invoice, or pay on account and reconcile later."
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
                  <th>Invoice / Customer</th>
                  <SortableTh label="Amount" sortKey="amount_paid" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Method</th>
                  <SortableTh label="Date" sortKey="payment_date" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {tc.pageRows.length === 0 ? (
                  <tr><td colSpan="6"><EmptyState label="No payments found." /></td></tr>
                ) : (
                  tc.pageRows.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold">{p.payment_reference}</td>
                      <td>
                        {p.invoice_id ? (
                          `Invoice #${p.invoice_id}`
                        ) : (
                          <span className="pill pill-info">On Account{p.customer_name ? ` — ${p.customer_name}` : ""}</span>
                        )}
                      </td>
                      <td>{Number(p.amount_paid || 0).toLocaleString()}</td>
                      <td>{p.payment_method}</td>
                      <td>{p.payment_date}</td>
                      <td><StatusPill status={p.status} /></td>
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

          <input
            name="payment_reference"
            className="form-control mb-2"
            placeholder="Payment Reference"
            value={formData.payment_reference}
            onChange={handleChange}
          />

          <label className="form-label mb-1">Pay Against</label>
          <div className="btn-group w-100 mb-2" role="group">
            <button
              type="button"
              className={`btn ${payAgainst === "invoice" ? "btn-primary" : "btn-light"}`}
              onClick={() => switchPayAgainst("invoice")}
            >
              Invoice / Order
            </button>
            <button
              type="button"
              className={`btn ${payAgainst === "customer" ? "btn-primary" : "btn-light"}`}
              onClick={() => switchPayAgainst("customer")}
            >
              Customer (Pay on Account)
            </button>
          </div>

          {payAgainst === "invoice" ? (
            <>
              <select
                name="invoice_id"
                className="form-control mb-2"
                value={formData.invoice_id}
                onChange={handleChange}
              >
                <option value="">Select Invoice</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} - {inv.customer_name}
                  </option>
                ))}
              </select>
              {invoices.length === 0 && (
                <div className="alert alert-warning py-2">
                  No invoices found — create one first, or switch to "Pay on account"
                  if the customer is paying before an invoice exists.
                </div>
              )}

              <input
                name="amount_paid"
                className="form-control mb-2"
                placeholder="Amount Paid"
                value={formData.amount_paid}
                readOnly
              />
            </>
          ) : (
            <>
              <select
                name="customer_id"
                className="form-control mb-2"
                value={formData.customer_id}
                onChange={handleChange}
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customer_name} {c.customer_code ? `(${c.customer_code})` : ""}
                  </option>
                ))}
              </select>
              {customers.length === 0 && (
                <div className="alert alert-warning py-2">
                  No customers found — check the Customers page loaded correctly.
                </div>
              )}

              <input
                name="amount_paid"
                type="number"
                className="form-control mb-2"
                placeholder="Amount Paid"
                value={formData.amount_paid}
                onChange={handleChange}
              />

              <div className="alert alert-info py-2">
                This payment will be recorded as <strong>unallocated / on account</strong>.
                Once an order or invoice exists for this customer, it can be reconciled
                against it (SAP B1-style) — that reconciliation screen is planned for
                the next phase.
              </div>
            </>
          )}

          <select
            name="payment_method"
            className="form-control mb-2"
            value={formData.payment_method}
            onChange={handleChange}
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="M-Pesa">M-Pesa</option>
            <option value="Cheque">Cheque</option>
          </select>

          <input
            type="date"
            name="payment_date"
            className="form-control mb-3"
            value={formData.payment_date}
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

export default Payments;