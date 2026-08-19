import React, { useEffect, useState } from "react";
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

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Masters, read-only here — same idea as SAP B1's Business Partner
  // Master reading its Payment Terms / Price List dropdowns from the
  // shared master data tables rather than typing them in per customer.
  const [priceLists, setPriceLists] = useState([]);
  const [paymentTermsList, setPaymentTermsList] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    customer_code: "",
    customer_name: "",
    phone: "",
    email: "",
    location: "",
    route: "",
    credit_limit: "",
    status: "Active",
    price_list_id: "",
    payment_terms_id: "",
  });

  // ================= MESSAGE =================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchMasters = async () => {
    const [plRes, ptRes] = await Promise.allSettled([
      api.get(`${MASTERS_BASE}/price-lists`),
      api.get(`${MASTERS_BASE}/payment-terms`),
    ]);
    setPriceLists(plRes.status === "fulfilled" ? plRes.value.data || [] : []);
    setPaymentTermsList(ptRes.status === "fulfilled" ? ptRes.value.data || [] : []);
  };

  // ================= FETCH =================
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers");
      setCustomers(res.data || []);
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
      showMessage("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchMasters();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "credit_limit"
          ? value.replace(/[^0-9.]/g, "")
          : value,
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      if (!formData.customer_name) {
        showMessage("Customer name is required");
        return;
      }

      const payload = {
        ...formData,
        credit_limit: Number(formData.credit_limit || 0),
      };

      if (editing) {
        await api.put(`/customers/${editing.id}`, payload);
        showMessage("Customer updated");
      } else {
        // Same issue as invoices: your backend doesn't auto-generate
        // customer codes yet, so we send a client-generated suggestion
        // rather than omitting the field (omitting it caused a 400 on
        // invoices — fixing pre-emptively here before it bites the same
        // way).
        await api.post("/customers", payload);
        showMessage("Customer created");
      }

      resetForm();
      fetchCustomers();

    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err.message);
      showMessage(
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.data ? JSON.stringify(err.response.data) : "Save failed")
      );
    }
  };

  // ================= EDIT =================
  const handleEdit = (c) => {
    setEditing(c);
    setViewing(null);
    setShowForm(true);

    setFormData({
      customer_code: c.customer_code || "",
      customer_name: c.customer_name || "",
      phone: c.phone || "",
      email: c.email || "",
      location: c.location || "",
      route: c.route || "",
      credit_limit: c.credit_limit || "",
      status: c.status || "Active",
      price_list_id: c.price_list_id || "",
      payment_terms_id: c.payment_terms_id || "",
    });
  };

  // ================= VIEW =================
  const handleView = (c) => {
    setViewing(c);
    setShowForm(false);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete customer?")) return;

    try {
      await api.delete(`/customers/${id}`);
      showMessage("Deleted successfully");
      fetchCustomers();
    } catch (err) {
      console.error(err);
      showMessage("Delete failed");
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      customer_code: "",
      customer_name: "",
      phone: "",
      email: "",
      location: "",
      route: "",
      credit_limit: "",
      status: "Active",
      price_list_id: "",
      payment_terms_id: "",
    });

    setEditing(null);
    setShowForm(false);
    setViewing(null);
  };

  // ================= UI =================
  const tc = useTableControls(customers, {
    searchKeys: ["customer_code", "customer_name", "phone", "email", "location", "route"],
  });

  return (
    <div>

      <PageHeader
        title="Customers"
        subtitle="Customer codes are suggested automatically — edit if needed."
        actions={
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setViewing(null);

              setFormData({
                customer_code: `CUST-${Date.now().toString().slice(-6)}`,
                customer_name: "",
                phone: "",
                email: "",
                location: "",
                route: "",
                credit_limit: "",
                status: "Active",
                price_list_id: "",
                payment_terms_id: "",
              });
            }}
          >
            <Icon.Plus size={14} /> Add Customer
          </button>
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <FilterBar
        searchValue={tc.search}
        onSearchChange={tc.setSearch}
        placeholder="Search code, name, phone, email, location..."
        onAddFilter={() => showMessage("Custom filters coming soon")}
        onRefresh={fetchCustomers}
        right={<ExportButton api={api} url="/customers/export" filename="customers.xlsx" />}
      />

      {/* TABLE */}
      <div className="card p-0">
        <div className="table-wrap">
          {loading ? (
            <p className="p-4 mb-0">Loading...</p>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <SortableTh label="Code" sortKey="customer_code" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <SortableTh label="Name" sortKey="customer_name" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Route</th>
                  <th>Price List</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tc.pageRows.length === 0 ? (
                  <tr><td colSpan="9"><EmptyState label="No customers found." /></td></tr>
                ) : (
                  tc.pageRows.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-semibold">{c.customer_code}</td>
                      <td>{c.customer_name}</td>
                      <td>{c.phone}</td>
                      <td>{c.email}</td>
                      <td>{c.location}</td>
                      <td>{c.route}</td>
                      <td>{c.price_list_name || "—"}</td>
                      <td><StatusPill status={c.status || "Active"} /></td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleView(c)}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View
                          </button>

                          <button
                            onClick={() => handleEdit(c)}
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(c.id)}
                            className="btn btn-sm btn-outline-danger"
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

      {/* VIEW */}
      {viewing && (
        <div className="card p-3 mt-3">
          <h5>Customer Details</h5>
          <p><b>Name:</b> {viewing.customer_name}</p>
          <p><b>Email:</b> {viewing.email}</p>
          <p><b>Phone:</b> {viewing.phone}</p>
          <p><b>Location:</b> {viewing.location}</p>
          <p><b>Route:</b> {viewing.route}</p>
          <p><b>Credit:</b> {viewing.credit_limit}</p>
          <p><b>Price List:</b> {viewing.price_list_name || "—"}</p>
          <p><b>Payment Terms:</b> {viewing.payment_terms_name || "—"}</p>

          <button className="btn btn-secondary btn-sm" onClick={() => setViewing(null)}>
            Close
          </button>
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <div className="card p-4 mt-3">
          <h5>{editing ? "Edit Customer" : "Add Customer"}</h5>

          <label>Customer Code</label>
          <input
            name="customer_code"
            className="form-control mb-2"
            placeholder="e.g. CUST-0001"
            value={formData.customer_code}
            onChange={handleChange}
            title="Suggested automatically — edit if your backend expects a different format"
          />
          <label>Customer Name</label>
          <input name="customer_name" className="form-control mb-2" placeholder="Name" value={formData.customer_name} onChange={handleChange} />
          <input name="phone" className="form-control mb-2" placeholder="Phone" value={formData.phone} onChange={handleChange} />
          <input name="email" className="form-control mb-2" placeholder="Email" value={formData.email} onChange={handleChange} />
          <input name="location" className="form-control mb-2" placeholder="Location" value={formData.location} onChange={handleChange} />
          <input name="route" className="form-control mb-2" placeholder="Route" value={formData.route} onChange={handleChange} />
          <input name="credit_limit" className="form-control mb-2" placeholder="Credit Limit" value={formData.credit_limit} onChange={handleChange} />

          <label>Price List</label>
          <select name="price_list_id" className="form-control mb-2" value={formData.price_list_id} onChange={handleChange}>
            <option value="">-- Select Price List --</option>
            {priceLists.map((pl) => (
              <option key={pl.id} value={pl.id}>{pl.name} {pl.currency ? `(${pl.currency})` : ""}</option>
            ))}
          </select>
          {priceLists.length === 0 && (
            <div className="alert alert-warning py-2 mb-2">
              No price lists found — add one on the Price Lists master page first.
            </div>
          )}

          <label>Payment Terms</label>
          <select name="payment_terms_id" className="form-control mb-2" value={formData.payment_terms_id} onChange={handleChange}>
            <option value="">-- Select Payment Terms --</option>
            {paymentTermsList.map((pt) => (
              <option key={pt.id} value={pt.id}>{pt.name} {pt.days ? `(${pt.days} days)` : ""}</option>
            ))}
          </select>
          {paymentTermsList.length === 0 && (
            <div className="alert alert-warning py-2 mb-2">
              No payment terms found — add one on the Payment Terms master page first.
            </div>
          )}

          <select name="status" className="form-control mb-2" value={formData.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

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