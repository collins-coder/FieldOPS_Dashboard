import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axiosConfig";

function Visits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  // ================= MESSAGE =================
  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // ================= FETCH VISITS =================
  const fetchVisits = useCallback(async () => {
    setLoading(true);

    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await api.get("/visits", { params });
      setVisits(res.data || []);
    } catch (err) {
      console.error("FETCH VISITS ERROR:", err.response?.data || err.message);
      showMessage("Failed to load visits");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // ================= FILTERING (client-side: status + search) =================
  const filteredVisits = visits.filter((v) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "In Progress" && v.status === "In Progress") ||
      (statusFilter === "Completed" && v.status !== "In Progress");

    const matchesSearch =
      !search ||
      `${v.user} ${v.customer} ${v.route_name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // ================= STATS =================
  const totalVisits = filteredVisits.length;
  const inProgressCount = filteredVisits.filter(
    (v) => v.status === "In Progress"
  ).length;
  const completedCount = totalVisits - inProgressCount;

  // ================= STATUS BADGE =================
  const getStatusBadge = (status) => {
    if (status === "In Progress") {
      return <span className="badge bg-primary">In Progress</span>;
    }

    // Any completed visit's status holds the checkout reason
    // (Complete Visit, Shop Closed, Money Collection, etc).
    switch (status) {
      case "Complete Visit":
        return <span className="badge bg-success">Complete Visit</span>;
      case "Shop Closed":
        return <span className="badge bg-secondary">Shop Closed</span>;
      case "Money Collection":
        return <span className="badge bg-info text-dark">Money Collection</span>;
      case "Customer Not Available":
        return (
          <span className="badge bg-warning text-dark">
            Customer Not Available
          </span>
        );
      default:
        return <span className="badge bg-dark">{status}</span>;
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("All");
    setSearch("");
  };

  // ================= UI =================
  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-1">Visits</h3>
          <p className="text-muted mb-0">
            Field check-ins, check-outs, and time spent per customer
          </p>
        </div>
      </div>

      {/* MESSAGE */}
      {message && <div className="alert alert-info">{message}</div>}

      {/* STATS */}
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6 className="text-muted mb-1">Total Visits</h6>
            <h3 className="mb-0">{totalVisits}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6 className="text-muted mb-1">In Progress</h6>
            <h3 className="mb-0 text-primary">{inProgressCount}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6 className="text-muted mb-1">Completed</h6>
            <h3 className="mb-0 text-success">{completedCount}</h3>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card shadow-sm p-3 mb-3">
        <div className="row g-2 align-items-end">

          <div className="col-md-3">
            <label className="form-label small text-muted mb-1">
              From
            </label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted mb-1">
              To
            </label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted mb-1">
              Status
            </label>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed (any reason)</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted mb-1">
              Search rep / customer / route
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>

        <div className="mt-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm p-3">

        {loading ? (
          <p>Loading visits...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">

              <thead >
                <tr>
                  <th>Sales Rep</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Comment</th>
                </tr>
              </thead>

              <tbody>
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-3">
                      No visits found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((v) => (
                    <tr key={v.id}>
                      <td>{v.user}</td>
                      <td>{v.customer}</td>
                      <td>{v.route_name || "—"}</td>
                      <td>{v.visit_date}</td>
                      <td>{v.time_in || "—"}</td>
                      <td>{v.time_out || "—"}</td>
                      <td>
                        {v.status === "In Progress" ? (
                          <span className="text-primary">Ongoing</span>
                        ) : (
                          v.duration || "—"
                        )}
                      </td>
                      <td>{getStatusBadge(v.status)}</td>
                      <td style={{ maxWidth: "200px" }}>
                        <small>{v.comment || "—"}</small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        )}

      </div>

    </div>
  );
}

export default Visits;