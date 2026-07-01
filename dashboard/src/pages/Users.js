import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function Users() {
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteText, setDeleteText] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "supervisor",
    status: "Active"
  });

  const filteredUsers = users.filter((u) => u.role !== "developer");

  // =========================
  // MESSAGE HANDLER
  // =========================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // =========================
  // LOAD USERS
  // =========================
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // OPEN CREATE FORM
  // =========================
  const openCreateForm = () => {
    setEditingUser(null);

    setDeleteText("");
    setConfirmDeleteId(null);

    setFormData({
      username: "",
      email: "",
      password: "",
      role: "supervisor",
      status: "Active"
    });

    setShowForm(true);
  };

  // =========================
  // SAVE USER (CREATE / UPDATE)
  // =========================
  const handleSave = async () => {
    try {
      const payload = { ...formData };

      // IMPORTANT: don't send empty password on edit
      if (editingUser && !payload.password) {
        delete payload.password;
      }

      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, payload);
        showMessage("User updated successfully");
      } else {
        await api.post("/admin/users", payload);
        showMessage("User created successfully");
      }

      resetForm();
      fetchUsers();

    } catch (err) {
      console.error("Save user error:", err);
    }
  };

  // =========================
  // EDIT USER
  // =========================
  const handleEdit = (user) => {
    setEditingUser(user);

    setFormData({
      username: user.username,
      email: user.email || "",
      password: "",
      role: user.role,
      status: user.status
    });

    setShowForm(true);
  };

  // =========================
  // DELETE USER
  // =========================
  const handleDelete = async (id) => {
    if (deleteText !== "DELETE") return;

    try {
      await api.delete(`/admin/users/${id}`);

      setConfirmDeleteId(null);
      setDeleteText("");
      fetchUsers();

      showMessage("User deleted successfully");

    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "supervisor",
      status: "Active"
    });

    setEditingUser(null);
    setShowForm(false);
  };

  // =========================
  // TOGGLE STATUS
  // =========================
  const toggleStatus = async (user) => {
    const newStatus =
      user.status === "Active" ? "Inactive" : "Active";

    try {
      await api.patch(`/admin/users/${user.id}/status`, {
        status: newStatus
      });

      fetchUsers();

    } catch (err) {
      console.error("Status error:", err);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h3>Users Management</h3>
          <p className="text-muted">
            Manage system users and roles
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openCreateForm}
        >
          + Add User
        </button>

      </div>

      {/* MESSAGE */}
      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {/* TABLE */}
      <div className="card p-3 shadow-sm">

        <table className="table table-hover">

          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredUsers.map((u) => (
              <tr key={u.id}>

                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.status}</td>

                <td>

                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(u)}
                  >
                    View / Edit
                  </button>

                  <button
                    className="btn btn-sm btn-outline-warning me-2"
                    onClick={() => toggleStatus(u)}
                  >
                    Toggle
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setConfirmDeleteId(u.id);
                      setDeleteText("");
                    }}
                  >
                    Delete
                  </button>

                  {confirmDeleteId === u.id && (
                    <div className="mt-2">

                      <input
                        className="form-control mb-1"
                        placeholder='Type "DELETE"'
                        value={deleteText}
                        onChange={(e) =>
                          setDeleteText(e.target.value)
                        }
                      />

                      <button
                        className="btn btn-danger btn-sm me-2"
                        onClick={() => handleDelete(u.id)}
                      >
                        Confirm
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setConfirmDeleteId(null);
                          setDeleteText("");
                        }}
                      >
                        Cancel
                      </button>

                    </div>
                  )}

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* FORM (BOTTOM) */}
      {showForm && (
        <div className="card p-4 mt-4 shadow-sm">

          <div className="row">

            <div className="col-md-6 mb-2">
              <input
                className="form-control"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-2">
              <input
                className="form-control"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-2">
              <input
                className="form-control"
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3 mb-2">
              <select
                className="form-control"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="admin">Admin</option>
                <option value="supervisor">Supervisor</option>
                <option value="sales_rep">Sales Rep</option>
              </select>
            </div>

            <div className="col-md-3 mb-2">
              <select
                className="form-control"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

          </div>

          <button
            className="btn btn-success me-2"
            onClick={handleSave}
          >
            {editingUser ? "Update User" : "Save User"}
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

export default Users;