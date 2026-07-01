import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH TRIPS =================
  const fetchTrips = async () => {
    setLoading(true);

    try {
      const res = await api.get("/trips");
      setTrips(res.data || []);
    } catch (err) {
      console.error("Trips fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Trips - Route Planning</h3>
      </div>

      {/* TABLE CARD */}
      <div className="card shadow-sm p-3">

        {loading ? (
          <p>Loading trips...</p>
        ) : (
          <table className="table table-hover align-middle">

            <thead className="table-dark">
              <tr>
                <th>Route Name</th>
                <th>Region</th>
                <th>Frequency</th>
                <th>Schedule Info</th>
                <th>Users</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {trips.length > 0 ? (
                trips.map((trip, index) => (
                  <tr key={index}>
                    <td>{trip.route_name}</td>
                    <td>{trip.region}</td>
                    <td>{trip.frequency}</td>
                    <td>{trip.schedule_info}</td>
                    <td>{trip.users || "-"}</td>
                    <td>
                      <button className="btn btn-sm btn-primary">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No trips found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        )}

      </div>

    </div>
  );
}

export default Trips;