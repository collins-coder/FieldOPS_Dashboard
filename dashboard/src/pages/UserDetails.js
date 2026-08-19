import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "supervisor",
    status: "Active"
  });

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
  // LOAD USER
  // ============================================================

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/admin/users/${id}`);

      setUser(response.data);

      setFormData({
        username: response.data.username || "",
        email: response.data.email || "",
        role: response.data.role || "supervisor",
        status: response.data.status || "Active"
      });

    } catch (error) {
      console.error("Fetch user error:", error);

      showMessage(
        error.response?.data?.message ||
          "Failed to load user",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // ============================================================
  // ENTER / CANCEL EDIT MODE
  // ============================================================

  const enterEditMode = () => {
    setFormData({
      username: user.username || "",
      email: user.email || "",
      role: user.role || "supervisor",
      status: user.status || "Active"
    });

    setEditMode(true);
  };

  const cancelEditMode = () => {
    setFormData({
      username: user.username || "",
      email: user.email || "",
      role: user.role || "supervisor",
      status: user.status || "Active"
    });

    setEditMode(false);
  };

  // ============================================================
  // SAVE CHANGES
  // ============================================================

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formData.username.trim()) {
      showMessage("Username is required", "danger");
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
        role: formData.role,
        status: formData.status
      };

      await api.put(`/admin/users/${id}`, payload);

      showMessage("User updated successfully");

      setEditMode(false);

      await fetchUser();

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
  // TOGGLE STATUS
  // ============================================================

  const toggleStatus = async () => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";

    try {
      setSaving(true);

      await api.patch(`/admin/users/${id}/status`, {
        status: newStatus
      });

      showMessage(`${user.username} is now ${newStatus}`);

      await fetchUser();

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
  // RESET PASSWORD
  // ============================================================

  const openResetPassword = () => {
    setShowResetPassword(true);
    setNewPassword("");
    setConfirmPassword("");
  };

  const cancelResetPassword = () => {
    setShowResetPassword(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      showMessage("Password must be at least 6 characters", "danger");
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
      await api.patch(`/admin/users/${id}/reset-password`, {
        password: newPassword
      });

      showMessage(`Password reset for ${user.username}`);

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
  // DELETE USER
  // ============================================================

  const handleDelete = async () => {
    if (deleteText !== "DELETE") {
      showMessage('Type "DELETE" to confirm user deletion', "danger");
      return;
    }

    try {
      setSaving(true);

      await api.delete(`/admin/users/${id}`);

      showMessage("User deleted successfully");

      navigate("/users");

    } catch (error) {
      console.error("Delete user error:", error);

      showMessage(
        error.response?.data?.message ||
          "Failed to delete user",
        "danger"
      );
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING / NOT FOUND
  // ============================================================

  if (loading) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border me-2" role="status"></span>
        Loading user...
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <button
          type="button"
          className="btn btn-secondary mb-3"
          onClick={() => navigate("/users")}
        >
          &larr; Back to Users
        </button>

        {message && (
          <div className={`alert alert-${messageType}`} role="alert">
            {message}
          </div>
        )}

        <div className="alert alert-warning">User not found.</div>
      </div>
    );
  }

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
          <button
            type="button"
            className="btn btn-link p-0 mb-1 text-decoration-none"
            onClick={() => navigate("/users")}
          >
            &larr; Back to Users
          </button>

          <h3 className="mb-1">{user.username}</h3>

          <p className="text-muted mb-0">
            User details and account settings
          </p>
        </div>

        <div className="d-flex gap-2">
          <span
            className={`badge align-self-center ${
              user.status === "Active" ? "bg-success" : "bg-secondary"
            }`}
            style={{ fontSize: "0.9rem" }}
          >
            {user.status}
          </span>
        </div>

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
          DETAILS CARD
      ======================================================== */}

      <div className="card shadow-sm mb-4">

        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Account Information</h5>

          {!editMode && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={enterEditMode}
              disabled={saving}
            >
              Edit
            </button>
          )}
        </div>

        <div className="card-body">

          {!editMode ? (

            /* ===================== READ-ONLY VIEW ===================== */

            <div className="row">

              <div className="col-md-6 mb-3">
                <div className="text-muted small">Username</div>
                <div className="fw-semibold">{user.username}</div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="text-muted small">Email</div>
                <div className="fw-semibold">
                  {user.email || <span className="text-muted">—</span>}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="text-muted small">Role</div>
                <div className="fw-semibold text-capitalize">
                  {user.role ? user.role.replace("_", " ") : "—"}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="text-muted small">Status</div>
                <div>
                  <span
                    className={`badge ${
                      user.status === "Active"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div className="text-muted small">Created At</div>
                <div className="fw-semibold">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleString()
                    : "—"}
                </div>
              </div>

              {user.updated_at && (
                <div className="col-md-6 mb-3">
                  <div className="text-muted small">Last Updated</div>
                  <div className="fw-semibold">
                    {new Date(user.updated_at).toLocaleString()}
                  </div>
                </div>
              )}

            </div>

          ) : (

            /* ===================== EDIT FORM ===================== */

            <form onSubmit={handleSave}>

              <div className="row">

                <div className="col-md-6 mb-3">
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

                <div className="col-md-6 mb-3">
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

                <div className="col-md-6 mb-3">
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

                <div className="col-md-6 mb-3">
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

              <div className="alert alert-info py-2">
                Password changes are handled separately via the
                "Reset Password" action below.
              </div>

              <div className="mt-2">

                <button
                  type="submit"
                  className="btn btn-success me-2"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelEditMode}
                  disabled={saving}
                >
                  Cancel
                </button>

              </div>

            </form>

          )}

        </div>

      </div>

      {/* ========================================================
          ACCOUNT ACTIONS
      ======================================================== */}

      {!editMode && (
        <div className="card shadow-sm mb-4">

          <div className="card-header bg-white">
            <h5 className="mb-0">Account Actions</h5>
          </div>

          <div className="card-body d-flex flex-wrap gap-2">

            <button
              type="button"
              className={`btn ${
                user.status === "Active"
                  ? "btn-outline-warning"
                  : "btn-outline-success"
              }`}
              onClick={toggleStatus}
              disabled={saving}
            >
              {user.status === "Active" ? "Deactivate User" : "Activate User"}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={openResetPassword}
              disabled={saving}
            >
              Reset Password
            </button>

            <button
              type="button"
              className="btn btn-outline-danger ms-auto"
              onClick={() => {
                setConfirmDelete(true);
                setDeleteText("");
              }}
              disabled={saving}
            >
              Delete User
            </button>

          </div>

        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION
      ======================================================== */}

      {confirmDelete && (
        <div className="card border-danger shadow-sm mb-4">

          <div className="card-body">

            <div className="text-danger mb-2">
              This action cannot be undone. Type{" "}
              <strong>DELETE</strong> to confirm deletion of{" "}
              <strong>{user.username}</strong>.
            </div>

            <div className="d-flex gap-2 align-items-center">

              <input
                type="text"
                className="form-control"
                style={{ maxWidth: "220px" }}
                placeholder="Type DELETE"
                value={deleteText}
                onChange={(event) => setDeleteText(event.target.value)}
                disabled={saving}
              />

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={saving || deleteText !== "DELETE"}
              >
                {saving ? "Deleting..." : "Confirm Delete"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setConfirmDelete(false);
                  setDeleteText("");
                }}
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================
          RESET PASSWORD MODAL
      ======================================================== */}

      {showResetPassword && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">
                  Reset Password — {user.username}
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
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={saving}
                  />
                </div>

                <div className="form-text">
                  Minimum 6 characters. The user will need to use this
                  new password on their next login.
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

    </div>
  );
}

export default UserDetails;