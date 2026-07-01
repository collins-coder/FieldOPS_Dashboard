import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function Timesheet() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ================= FETCH =================
  const fetchTimesheet = async () => {
    setLoading(true);
    try {
      const res = await api.get("/timesheet", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      setRecords(res.data || []);
    } catch (err) {
      console.error("Timesheet error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheet();
  }, []);

  // ================= EXPORT =================
  const exportExcel = async () => {
    try {
      const response = await api.get("/timesheet/export", {
        responseType: "blob",
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "timesheet.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  // ================= STATUS =================
  const getStatusBadge = (status) => {
    if (status === "Completed") {
      return <span className="badge bg-success">Completed</span>;
    }
    if (status === "Active") {
      return <span className="badge bg-warning text-dark">Active</span>;
    }
    return <span className="badge bg-secondary">{status}</span>;
  };

  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Timesheet - Employee Timesheet</h3>
      </div>

      {/* FILTERS */}
      <div className="card p-3 mb-3">
        <div className="row align-items-end">

          <div className="col-md-3">
            <label>Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label>End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="col-md-3 d-flex gap-2">
            <button className="btn btn-primary mt-4" onClick={fetchTimesheet}>
              Filter
            </button>

            <button className="btn btn-success mt-4" onClick={exportExcel}>
              Export to Excel
            </button>
          </div>

        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm p-3">

        {loading ? (
          <p>Loading timesheet...</p>
        ) : (

          <table className="table table-hover align-middle">

            <thead className="table-dark">
              <tr>
                <th>User</th>
                <th>Date</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Status</th>
                <th>Logged Hours</th>
              </tr>
            </thead>

            <tbody>
              {records.map((r, index) => (
                <tr key={index}>
                  <td>{r.user}</td>
                  <td>{r.date}</td>
                  <td>{r.start_time || r.in_time}</td>
                  <td>{r.end_time || "N/A"}</td>
                  <td>{getStatusBadge(r.status)}</td>
                  <td>{r.logged_hours || "-"}</td>
                </tr>
              ))}
            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

export default Timesheet;