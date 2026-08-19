import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

function Users() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteText, setDeleteText] = useState("");

  // Reset password state
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "supervisor",
    status: "Active"
  });

  // ============================================================
  // FILTER USERS
  // ============================================================

  // Developers are hidden from normal user management.
  const filteredUsers = users.filter(
    (user) => user.role !== "developer"
  );

  // ============================================================
  // MESSAGE HANDLER
  // ============================================================

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  // ============================================================
  // LOAD USERS
  // ============================================================

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/users");

      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Fetch users error:", error);

      showMessage(
        error.response?.data?.message ||
          "Failed to load users",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HANDLE INPUT (create form only)
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // ============================================================
  // OPEN CREATE FORM
  // ============================================================

  const openCreateForm = () => {
    setConfirmDeleteId(null);
    setDeleteText("");

    setFormData({
      username: "",
      email: "",
      password: "",
      role: "supervisor",
      status: "Active"
    });

    setShowForm(true);
  };

  // ============================================================
  // SAVE NEW USER
  // ============================================================

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formData.username.trim()) {
      showMessage("Username is required", "danger");
      return;
    }

    if (!formData.password.trim()) {
      showMessage(
        "Password is required when creating a user",
        "danger"
      );
      return;
    }

    if (!formData.role) {
      showMessage("Please select a role", "danger");
      return;
    }

    if (!formData.status) {
      showMessage("Please select a status", "danger");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim() || null,
        password: formData.password,
        role: formData.role,
        status: formData.status
      };

      await api.post("/admin/users", payload);

      showMessage("User created successfully");

      resetForm();

      await fetchUsers();

    } catch (error) {
      console.error("Save user error:", error);

      showMessage(
        error.response?.data?.message ||
          "Failed to save user",
        "danger"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // GO TO USER DETAILS PAGE
  // ============================================================

  const openUserDetails = (user) => {
    // Assumes a route like <Route path="/users/:id" element={<UserDetails />} />
    navigate(`/users/${user.id}`);
  };

  // ============================================================
  // DELETE USER
  // ============================================================

  const handleDelete = async (id) => {
    if (deleteText !== "DELETE") {
      showMessage(
        'Type "DELETE" to confirm user deletion',
        "danger"
      );
      return;
    }

    try {
      setSaving(true);

      await api.delete(`/admin/users/${id}`);

      setConfirmDeleteId(null);
      setDeleteText("");

      showMessage("User deleted successfully");

      await fetchUsers();

    } catch (error) {
      console.error("Delete user error:", error);

      showMessage(
        error.response?.data?.message ||
          "Failed to delete user",
        "danger"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RESET FORM (create form)
  // ============================================================

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "supervisor",
      status: "Active"
    });

    setShowForm(false);
  };

  // ============================================================
  // TOGGLE STATUS
  // ============================================================

  const toggleStatus = async (user) => {
    const newStatus =
      user.status === "Active" ? "Inactive" : "Active";

    try {
      setSaving(true);

      await api.patch(`/admin/users/${user.id}/status`, {
        status: newStatus
      });

      showMessage(`${user.username} is now ${newStatus}`);

      await fetchUsers();

    } catch (error) {
      console.error("Status update error:", error);

      showMessage(
        error.response?.data?.message ||
          "Failed to update user status",
        "danger"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CANCEL DELETE
  // ============================================================

  const cancelDelete = () => {
    setConfirmDeleteId(null);
    setDeleteText("");
  };

  // ============================================================
  // RESET PASSWORD
  // ============================================================

  const openResetPassword = (user) => {
    setResetPasswordUser(user);
    setNewPassword("");
    setConfirmPassword("");
  };

  const cancelResetPassword = () => {
    setResetPasswordUser(null);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      showMessage(
        "Password must be at least 6 characters",
        "danger"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match", "danger");
      return;
    }

    try {
      setSaving(true);

      // NOTE: adjust this endpoint to match your backend's actual
      // reset-password route if it differs.
      await api.patch(
        `/admin/users/${resetPasswordUser.id}/reset-password`,
        { password: newPassword }
      );

      showMessage(
        `Password reset for ${resetPasswordUser.username}`
      );

      cancelResetPassword();

    } catch (error) {
      console.error("Reset password error:", error);

      showMessage(
        error.response?.data?.message ||
          "Failed to reset password",
        "danger"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div>

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h3 className="mb-1">Users Management</h3>
          <p className="text-muted mb-0">
            Manage system users, roles and account status
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreateForm}
          disabled={saving}
        >
          + Add User
        </button>

      </div>

      {/* ========================================================
          MESSAGE
      ======================================================== */}

      {message && (
        <div
          className={`alert alert-${messageType} alert-dismissible fade show`}
          role="alert"
        >
          {message}

          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage("")}
          ></button>
        </div>
      )}

      {/* ========================================================
          CREATE FORM
      ======================================================== */}

      {showForm && (
        <div className="card shadow-sm mb-4">

          <div className="card-header bg-white">
            <h5 className="mb-0">Create New User</h5>
          </div>

          <div className="card-body">

            <form onSubmit={handleSave}>

              <div className="row">

                {/* USERNAME */}

                <div className="col-md-3 mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>

                {/* EMAIL */}

                <div className="col-md-3 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </div>

                {/* PASSWORD */}

                <div className="col-md-3 mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>

                {/* ROLE */}

                <div className="col-md-3 mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="sales_rep">Sales Rep</option>
                  </select>
                </div>

                {/* STATUS */}

                <div className="col-md-3 mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={saving}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>

              {/* FORM BUTTONS */}

              <div className="mt-2">

                <button
                  type="submit"
                  className="btn btn-success me-2"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save User"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ========================================================
          RESET PASSWORD MODAL
      ======================================================== */}

      {resetPasswordUser && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">
                  Reset Password — {resetPasswordUser.username}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelResetPassword}
                  disabled={saving}
                ></button>
              </div>

              <div className="modal-body">

                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={saving}
                    autoFocus
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    disabled={saving}
                  />
                </div>

                <div className="form-text">
                  Minimum 6 characters. The user will need to use
                  this new password on their next login.
                </div>

              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelResetPassword}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleResetPassword}
                  disabled={saving}
                >
                  {saving ? "Resetting..." : "Reset Password"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          USERS TABLE
      ======================================================== */}

      <div className="card shadow-sm">

        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">System Users</h5>
          <span className="text-muted small">
            {filteredUsers.length} user
            {filteredUsers.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="table-responsive">

          <table className="table table-hover align-middle mb-0">

            <thead className="table-light">
              <tr>
                <th style={{ width: "18%" }}>Username</th>
                <th style={{ width: "20%" }}>Email</th>
                <th style={{ width: "12%" }}>Role</th>
                <th style={{ width: "10%" }}>Status</th>
                <th style={{ width: "15%" }}>Created At</th>
                <th style={{ width: "25%" }} className="text-end">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-muted py-4"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <React.Fragment key={user.id}>

                    <tr>

                      {/* USERNAME (click to open details) */}

                      <td>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-semibold"
                          onClick={() => openUserDetails(user)}
                        >
                          {user.username}
                        </button>
                      </td>

                      {/* EMAIL */}

                      <td>
                        {user.email || (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      {/* ROLE */}

                      <td>
                        <span className="text-capitalize">
                          {user.role
                            ? user.role.replace("_", " ")
                            : "—"}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`badge ${
                            user.status === "Active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* CREATED AT */}

                      <td>
                        {user.created_at
                          ? new Date(
                              user.created_at
                            ).toLocaleString()
                          : "—"}
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="d-flex flex-wrap gap-2 justify-content-end">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openUserDetails(user)}
                            disabled={saving}
                          >
                            View / Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => openResetPassword(user)}
                            disabled={saving}
                          >
                            Reset Password
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              user.status === "Active"
                                ? "btn-outline-warning"
                                : "btn-outline-success"
                            }`}
                            onClick={() => toggleStatus(user)}
                            disabled={saving}
                          >
                            {user.status === "Active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setConfirmDeleteId(user.id);
                              setDeleteText("");
                            }}
                            disabled={saving}
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>

                    {/* DELETE CONFIRMATION ROW */}

                    {confirmDeleteId === user.id && (
                      <tr>
                        <td colSpan="6" className="p-0">
                          <div className="p-3 bg-light border-top">

                            <div className="small text-danger mb-2">
                              This action cannot be undone. Type{" "}
                              <strong>DELETE</strong> to confirm
                              deletion of{" "}
                              <strong>{user.username}</strong>.
                            </div>

                            <div className="d-flex gap-2 align-items-center">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                style={{ maxWidth: "220px" }}
                                placeholder="Type DELETE"
                                value={deleteText}
                                onChange={(event) =>
                                  setDeleteText(event.target.value)
                                }
                                disabled={saving}
                              />

                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(user.id)}
                                disabled={
                                  saving || deleteText !== "DELETE"
                                }
                              >
                                {saving
                                  ? "Deleting..."
                                  : "Confirm Delete"}
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={cancelDelete}
                                disabled={saving}
                              >
                                Cancel
                              </button>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}

                  </React.Fragment>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Users;