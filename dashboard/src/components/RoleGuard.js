import React from "react";
import { Navigate } from "react-router-dom";

function RoleGuard({ allowedRoles, children }) {
  const role = localStorage.getItem("role");

  if (!role) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="p-4">
        <h4>Access Denied</h4>
        <p>You do not have permission to access this module.</p>
      </div>
    );
  }

  return children;
}

export default RoleGuard;