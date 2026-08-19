import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { Icon } from "../components/Icons";
import { PageHeader, StatusPill } from "../components/ui";

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

  return (
    <div>

      <PageHeader
        title="Timesheet"
        subtitle="Start/stop day sessions logged from the field app. A session left open is auto-closed at midnight (Phase C)."
      />

      {/* FILTERS */}
      <div className="card p-3 mb-3">
        <div className="row align-items-end g-2">

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

          <div className="col-md-6 d-flex gap-2">
            <button className="btn btn-primary" onClick={fetchTimesheet}>
              <Icon.Filter size={14} /> Filter
            </button>

            <button className="btn btn-light" onClick={exportExcel}>
              <Icon.FileText size={14} /> Export to Excel
            </button>
          </div>

        </div>
      </div>

      {/* TABLE */}
      <div className="card p-0">
        <div className="table-wrap">
          {loading ? (
            <p className="p-4 mb-0">Loading timesheet...</p>
          ) : (
            <table className="table table-hover align-middle">

              <thead>
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
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty">No timesheet records for this range.</td>
                  </tr>
                ) : (
                  records.map((r, index) => (
                    <tr key={index}>
                      <td>{r.user}</td>
                      <td>{r.date}</td>
                      <td>{r.start_time || r.in_time}</td>
                      <td>{r.end_time || "N/A"}</td>
                      <td><StatusPill status={r.status} /></td>
                      <td>{r.logged_hours || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          )}
        </div>
      </div>

    </div>
  );
}

export default Timesheet;