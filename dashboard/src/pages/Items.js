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
  ExportButton,
  useTableControls,
} from "../components/ui";

// Standard units of measure available when creating/editing an item.
// Keep this list in sync with anywhere else UOM is referenced (e.g.
// the mobile app's order screen).
const UNIT_OPTIONS = [
  "PCS",
  "CTN",
  "KG",
  "G",
  "L",
  "ML",
  "BOX",
  "PACK",
  "DOZEN",
  "BAG"
];

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    item_code: "",
    name: "",
    category: "",
    unit: "PCS",
    price: "",
    stock: "",
    status: "Active"
  });

  // ================= MESSAGE =================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // ================= FETCH ITEMS =================
  const fetchItems = async () => {
    setLoading(true);

    try {
      const res = await api.get("/items");
      setItems(res.data || []);
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
      showMessage("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "stock"
          ? value.replace(/[^0-9.]/g, "")
          : value
    });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      if (!formData.name) {
        showMessage("Item Name is required");
        return;
      }

      const payload = {
        ...formData,
        price: Number(formData.price || 0),
        stock: Number(formData.stock || 0)
      };
      // item_code is generated server-side from the new row's id
      // (ITEM-000123) — never sent on create, so it can't collide
      // between two reps working at once. Editing an existing item
      // still shows its real code (read-only) since that one's
      // already assigned and the backend won't let it be changed.
      if (!editing) delete payload.item_code;

      if (editing) {
        await api.put(`/items/${editing.id}`, payload);
        showMessage("Item updated successfully");
      } else {
        await api.post("/items", payload);
        showMessage("Item created successfully");
      }

      resetForm();
      fetchItems();

    } catch (err) {
      console.error("SAVE ERROR:", err.response?.data || err.message);
      showMessage(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Save failed"
      );
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setEditing(item);
    setShowForm(true);

    setFormData({
      item_code: item.item_code || "",
      name: item.name || "",
      category: item.category || "",
      unit: item.unit || "PCS",
      price: item.price || "",
      stock: item.stock || "",
      status: item.status || "Active"
    });
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await api.delete(`/items/${id}`);
      showMessage("Item deleted successfully");
      fetchItems();
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err.message);
      showMessage("Delete failed");
    }
  };

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      item_code: "",
      name: "",
      category: "",
      unit: "PCS",
      price: "",
      stock: "",
      status: "Active"
    });

    setEditing(null);
    setShowForm(false);
  };

  // ================= UI =================
  const tc = useTableControls(items, {
    searchKeys: ["item_code", "name", "category", "unit"],
  });

  return (
    <div>

      <PageHeader
        title="Items Master"
        subtitle={`${items.length} items in catalogue — item codes are assigned automatically.`}
        actions={
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true);
              setEditing(null);
            }}
          >
            <Icon.Plus size={14} /> Add Item
          </button>
        }
      />

      {message && <div className="alert alert-info">{message}</div>}

      <FilterBar
        searchValue={tc.search}
        onSearchChange={tc.setSearch}
        placeholder="Search item code, name, category..."
        onAddFilter={() => showMessage("Custom filters coming soon")}
        onRefresh={fetchItems}
        right={<ExportButton api={api} url="/items/export" filename="items.xlsx" />}
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
                  <SortableTh label="Item Code" sortKey="item_code" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <SortableTh label="Name" sortKey="name" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Category</th>
                  <th>UOM</th>
                  <SortableTh label="Price" sortKey="price" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <SortableTh label="Stock" sortKey="stock" activeKey={tc.sortKey} dir={tc.sortDir} onSort={tc.toggleSort} />
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tc.pageRows.length === 0 ? (
                  <tr><td colSpan="8"><EmptyState label="No items found." /></td></tr>
                ) : (
                  tc.pageRows.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-semibold">{item.item_code}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.unit || "—"}</td>
                      <td>{item.price}</td>
                      <td>{item.stock}</td>
                      <td><StatusPill status={item.status || "Active"} /></td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(item.id)}
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
          <h5>{editing ? "Edit Item" : "Add Item"}</h5>

          <label>Item Code</label>
          <input
            name="item_code"
            className="form-control mb-2"
            placeholder={editing ? "" : "Auto-generated on save"}
            value={formData.item_code}
            onChange={handleChange}
            disabled={!editing}
            title={!editing ? "Assigned automatically by the server to prevent duplicates" : ""}
          />

          <label>Item Name</label>
          <input
            name="name"
            className="form-control mb-2"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            name="category"
            className="form-control mb-2"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
          />

          <label className="form-label mb-1">Unit of Measure (UOM)</label>
          <select
            name="unit"
            className="form-control mb-2"
            value={formData.unit}
            onChange={handleChange}
          >
            {UNIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <input
            name="price"
            className="form-control mb-2"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
          />

          <input
            name="stock"
            className="form-control mb-2"
            placeholder="Stock Quantity"
            value={formData.stock}
            onChange={handleChange}
          />

          <select
            name="status"
            className="form-control mb-3"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            className="btn btn-success me-2"
            onClick={handleSave}
          >
            {editing ? "Update" : "Save"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={resetForm}
          >
            Cancel
          </button>
        </div>
      )}

    </div>
  );
}

export default Items;