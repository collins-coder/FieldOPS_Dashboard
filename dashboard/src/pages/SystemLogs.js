import React, { useEffect, useState } from "react";
// Was creating its own separate axios instance/interceptor here — now
// uses the same shared client as every other page, so there's one
// source of truth for base URL + auth handling.
import api from "../api/axiosConfig";

function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // MESSAGE HANDLER
  // =========================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // =========================
  // FETCH LOGS
  // =========================
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);

    try {
      const res = await api.get("/admin/logs");
      setLogs(res.data || []);
    } catch (error) {
      console.error("Error loading logs:", error);
      showMessage("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EXPORT LOGS
  // =========================
  const exportLogs = async () => {
    try {
      const res = await api.get("/admin/export-logs", {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");
      link.href = url;
      link.download = "integration_logs.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      showMessage("Export successful");

    } catch (err) {
      console.log("Export failed:", err);
      showMessage("Export failed");
    }
  };

  // =========================
  // STATUS BADGE
  // =========================
  const getStatusBadge = (status) => {
    if (status === "SUCCESS") {
      return <span className="badge bg-success">SUCCESS</span>;
    }
    if (status === "FAILED") {
      return <span className="badge bg-danger">FAILED</span>;
    }
    return <span className="badge bg-secondary">{status}</span>;
  };

  const successCount = logs.filter((l) => l.status === "SUCCESS").length;
  const failedCount = logs.filter((l) => l.status === "FAILED").length;

  return (
    <div>

      {/* MESSAGE */}
      {message && (
        <div className="alert alert-info py-2">
          {message}
        </div>
      )}

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">System Logs</h3>
          <p className="text-muted mb-0">
            Integration monitoring & system diagnostics
          </p>
        </div>

        <button className="btn btn-primary" onClick={exportLogs}>
          Export Logs
        </button>
      </div>

      {/* STATS */}
      <div className="row mb-4">

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6>Total Logs</h6>
            <h3>{logs.length}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6>Success</h6>
            <h3>{successCount}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6>Failed</h6>
            <h3>{failedCount}</h3>
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="card p-4 shadow-sm">

        {loading ? (
          <p>Loading logs...</p>
        ) : (
          <div className="table-responsive">

            <table className="table table-hover table-sm">
              <thead >
                <tr>
                  <th>ID</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Retry</th>
                  <th>Payload</th>
                  <th>Response</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{log.action}</td>
                      <td>{getStatusBadge(log.status)}</td>
                      <td>{log.retry_count}</td>
                      <td style={{ maxWidth: "200px" }}>
                        <small>{log.payload}</small>
                      </td>
                      <td style={{ maxWidth: "200px" }}>
                        <small>{log.response}</small>
                      </td>
                      <td>{log.created_at}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No logs found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default SystemLogs;