import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function Trips() {

  /* ================= STATES ================= */

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  const [salesReps, setSalesReps] = useState([]);
  const [regions, setRegions] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [editingTrip, setEditingTrip] = useState(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteText, setDeleteText] = useState("");

  /* ================= FORM ================= */

  const [tripName, setTripName] = useState("");

  const [salesRepId, setSalesRepId] = useState("");

  const [regionId, setRegionId] = useState("");

  const [scheduleType, setScheduleType] = useState("");

  const [selectedDays, setSelectedDays] = useState([]);

  const [weeklyDay, setWeeklyDay] = useState("");

  const [monthlyDate, setMonthlyDate] = useState("");

  const [visitAllCustomers, setVisitAllCustomers] =
    useState(false);

  const [selectedCustomerId, setSelectedCustomerId] =
    useState("");

  const [assignedCustomers, setAssignedCustomers] =
    useState([]);

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  /* ================= FETCH TRIPS ================= */

  const fetchTrips = async () => {

    try {

      setLoading(true);

      const res = await api.get("/trips");

      setTrips(res.data || []);

    } catch (err) {

      console.error(
        "Trips fetch error:",
        err.response?.data || err.message
      );

    } finally {

      setLoading(false);
    }
  };

  /* ================= FETCH MASTER DATA ================= */

  const fetchMasterData = async () => {

    try {

      const [usersRes, regionsRes, customersRes] =
        await Promise.all([
          api.get("/sales-reps"),
          api.get("/regions"),
          api.get("/customers")
        ]);

      console.log("USERS RESPONSE:", usersRes.data);
      console.log("REGIONS RESPONSE:", regionsRes.data);
      console.log("CUSTOMERS RESPONSE:", customersRes.data);

      setSalesReps(usersRes.data || []);
      setRegions(regionsRes.data || []);
      setCustomers(customersRes.data || []);

    } catch (err) {

      console.error(
        "Master data fetch error:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {

    fetchTrips();
    fetchMasterData();

  }, []);

  /* ================= OPEN CREATE FORM ================= */

  const openCreateForm = () => {

    setEditingTrip(null);

    setTripName("");
    setSalesRepId("");
    setRegionId("");
    setScheduleType("");
    setSelectedDays([]);
    setWeeklyDay("");
    setMonthlyDate("");
    setVisitAllCustomers(false);
    setAssignedCustomers([]);

    setDeleteText("");
    setConfirmDeleteId(null);

    setShowForm(true);
  };

  /* ================= SCHEDULE LOGIC ================= */

  const handleScheduleType = (type) => {

    setScheduleType(type);

    setSelectedDays([]);
    setWeeklyDay("");
    setMonthlyDate("");

    if (type === "Daily") {
      setSelectedDays([...weekdays]);
    }
  };

  /* ================= DAILY TOGGLE ================= */

  const toggleDay = (day) => {

    if (selectedDays.includes(day)) {

      setSelectedDays(
        selectedDays.filter((d) => d !== day)
      );

    } else {

      setSelectedDays([
        ...selectedDays,
        day
      ]);
    }
  };

  /* ================= ADD CUSTOMER ================= */

  const addCustomer = () => {

    if (!selectedCustomerId) return;

    const customerExists =
      assignedCustomers.find(
        (c) => c.id === Number(selectedCustomerId)
      );

    if (customerExists) return;

    const customer = customers.find(
      (c) => c.id === Number(selectedCustomerId)
    );

    if (customer) {

      setAssignedCustomers([
        ...assignedCustomers,
        customer
      ]);
    }

    setSelectedCustomerId("");
  };

  /* ================= REMOVE CUSTOMER ================= */

  const removeCustomer = (id) => {

    setAssignedCustomers(
      assignedCustomers.filter(
        (c) => c.id !== id
      )
    );
  };

  /* ================= CREATE / UPDATE TRIP ================= */

  const handleCreateTrip = async (e) => {

    e.preventDefault();

    try {

      const payload = {

        trip_name: tripName,

        sales_rep_id: Number(salesRepId),

        region_id: Number(regionId),

        schedule_type: scheduleType,

        daily_days: selectedDays,

        weekly_day: weeklyDay,

        monthly_date: monthlyDate
          ? Number(monthlyDate)
          : null,

        visit_all_customers: visitAllCustomers,

        customers: assignedCustomers.map(
          (c) => c.id
        )
      };

      if (editingTrip) {

        await api.put(
          `/trips/${editingTrip.id}`,
          payload
        );

        alert("Trip updated successfully");

      } else {

        await api.post("/trips", payload);

        alert("Trip created successfully");
      }

      setTripName("");
      setSalesRepId("");
      setRegionId("");
      setScheduleType("");
      setSelectedDays([]);
      setWeeklyDay("");
      setMonthlyDate("");
      setVisitAllCustomers(false);
      setAssignedCustomers([]);
      setShowForm(false);
      setEditingTrip(null);

      fetchTrips();

    } catch (err) {

      console.error(
        "Create trip error:",
        err.response?.data || err.message
      );

      alert(
        editingTrip
          ? "Failed to update trip"
          : "Failed to create trip"
      );
    }
  };

  /* ================= EDIT TRIP ================= */

  const handleEditTrip = (trip) => {

    setEditingTrip(trip);

    setTripName(trip.trip_name || "");

    setSalesRepId(
      trip.sales_rep_id
        ? String(trip.sales_rep_id)
        : ""
    );

    setRegionId(
      trip.region_id
        ? String(trip.region_id)
        : ""
    );

    setScheduleType(
      trip.schedule_type || ""
    );

    setSelectedDays(
      trip.daily_days || []
    );

    setWeeklyDay(
      trip.weekly_day || ""
    );

    setMonthlyDate(
      trip.monthly_date || ""
    );

    setVisitAllCustomers(
      trip.visit_all_customers || false
    );

    setAssignedCustomers(
      trip.customers || []
    );

    setShowForm(true);
  };

  /* ================= DELETE TRIP ================= */

  const handleDeleteTrip = async (id) => {

    if (deleteText !== "DELETE") return;

    try {

      await api.delete(`/trips/${id}`);

      setConfirmDeleteId(null);
      setDeleteText("");

      fetchTrips();

      alert("Trip deleted successfully");

    } catch (err) {

      console.error(
        "Delete trip error:",
        err.response?.data || err.message
      );

      alert("Failed to delete trip");
    }
  };

  return (
    <div>

      {/* ================= HEADER ================= */}

      <div
        className="d-flex justify-content-between align-items-center mb-4"
      >

        <div>

          <h3
            style={{
              fontWeight: "700"
            }}
          >
            Trips & Route Planning
          </h3>

          <p className="text-muted mb-0">
            Plan sales rep visits and schedules
          </p>

        </div>

        <button
          className="btn btn-primary"
          onClick={openCreateForm}
        >
          {showForm
            ? "Close Form"
            : "+ Create Trip"}
        </button>

      </div>

      {/* ================= FORM ================= */}

      {showForm && (

        <div
          className="card border-0 shadow-sm mb-4"
          style={{
            borderRadius: "18px"
          }}
        >

          <div className="card-body">

            <h5 className="mb-4">
              {editingTrip
                ? "Edit Trip"
                : "Create Trip"}
            </h5>

            <form onSubmit={handleCreateTrip}>

              <div className="row">

                {/* TRIP NAME */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Trip Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    required
                  />
                </div>

                {/* SALES REP */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Assign Sales Rep</label>
                  <select
                    className="form-control"
                    value={salesRepId}
                    onChange={(e) => setSalesRepId(e.target.value)}
                    required
                  >
                    <option value="">Select Sales Rep</option>

                    {salesReps.map((rep) => (
                      <option key={rep.id} value={rep.id}>
                        {rep.username}
                      </option>
                    ))}

                  </select>
                </div>

                {/* REGION */}
                <div className="col-md-6 mb-3">

                  <label className="form-label">Region</label>

                  <select
                    className="form-select"
                    value={regionId}
                    onChange={(e) => setRegionId(e.target.value)}
                  >

                    <option value="">Select Region</option>

                    {regions.map((region) => (
                      <option
                        key={region.id}
                        value={region.id}
                      >
                        {region.name}
                      </option>
                    ))}

                  </select>

                </div>

                {/* SCHEDULE TYPE */}
                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Schedule Type
                  </label>

                  <select
                    className="form-control"
                    value={scheduleType}
                    onChange={(e) =>
                      handleScheduleType(e.target.value)
                    }
                    required
                  >

                    <option value="">
                      Select Schedule Type
                    </option>

                    <option value="Daily">
                      Daily
                    </option>

                    <option value="Weekly">
                      Weekly
                    </option>

                    <option value="Monthly">
                      Monthly
                    </option>

                  </select>

                </div>

              </div>

              {/* ================= DAILY ================= */}

              {scheduleType === "Daily" && (
                <div className="mb-4">

                  <label className="form-label">
                    Daily Schedule Days
                  </label>

                  <div className="d-flex flex-wrap gap-2">

                    {weekdays.map((day) => (
                      <button
                        type="button"
                        key={day}
                        className={`btn ${
                          selectedDays.includes(day)
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </button>
                    ))}

                  </div>

                </div>
              )}

              {/* ================= WEEKLY ================= */}

              {scheduleType === "Weekly" && (
                <div className="mb-4">

                  <label className="form-label">
                    Weekly Schedule Day
                  </label>

                  <select
                    className="form-control"
                    value={weeklyDay}
                    onChange={(e) => setWeeklyDay(e.target.value)}
                    required
                  >

                    <option value="">
                      Select Day
                    </option>

                    {weekdays.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}

                  </select>

                </div>
              )}

              {/* ================= MONTHLY ================= */}

              {scheduleType === "Monthly" && (
                <div className="mb-4">

                  <label className="form-label">
                    Monthly Visit Date
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="31"
                    value={monthlyDate}
                    onChange={(e) => setMonthlyDate(e.target.value)}
                    required
                  />

                </div>
              )}

              {/* ================= CUSTOMER ASSIGNMENT ================= */}

              <div className="card bg-light border-0 p-4 mb-4">

                <h5 className="mb-3">
                  Customer Assignment
                </h5>

                <div className="form-check mb-4">

                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={visitAllCustomers}
                    onChange={(e) =>
                      setVisitAllCustomers(e.target.checked)
                    }
                  />

                  <label className="form-check-label">
                    Visit All Customers
                  </label>

                </div>

                {!visitAllCustomers && (
                  <>

                    <div className="row align-items-end">

                      <div className="col-md-8">

                        <label className="form-label">
                          Select Customer
                        </label>

                        <select
                          className="form-control"
                          value={selectedCustomerId}
                          onChange={(e) =>
                            setSelectedCustomerId(e.target.value)
                          }
                        >

                          <option value="">
                            Select Customer
                          </option>

                          {customers.map((customer) => (
                            <option
                              key={customer.id}
                              value={customer.id}
                            >
                              {customer.customer_name}
                            </option>
                          ))}

                        </select>

                      </div>

                      <div className="col-md-4">

                        <button
                          type="button"
                          className="btn btn-primary w-100"
                          onClick={addCustomer}
                        >
                          + Add Customer
                        </button>

                      </div>

                    </div>

                    <div className="mt-4">

                      <h6>Assigned Customers</h6>

                      {assignedCustomers.length > 0 ? (

                        <table className="table table-bordered">

                          <thead>
                            <tr>
                              <th>Customer</th>
                              <th width="120">Action</th>
                            </tr>
                          </thead>

                          <tbody>

                            {assignedCustomers.map((customer) => (
                              <tr key={customer.id}>

                                <td>
                                  {customer.customer_name}
                                </td>

                                <td>

                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() =>
                                      removeCustomer(customer.id)
                                    }
                                  >
                                    Remove
                                  </button>

                                </td>

                              </tr>
                            ))}

                          </tbody>

                        </table>

                      ) : (

                        <p className="text-muted">
                          No customers assigned
                        </p>

                      )}

                    </div>

                  </>
                )}

              </div>

              <button
                type="submit"
                className="btn btn-success me-2"
              >
                {editingTrip
                  ? "Update Trip"
                  : "Save Trip"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingTrip(null);
                }}
              >
                Cancel
              </button>

            </form>

          </div>
        </div>
      )}

      {/* ================= TRIPS TABLE ================= */}

      <div
        className="card border-0 shadow-sm"
        style={{
          borderRadius: "18px"
        }}
      >

        <div className="card-body">

          {loading ? (

            <p>Loading trips...</p>

          ) : (

            <table className="table align-middle">

              <thead>

                <tr>
                  <th>Trip</th>
                  <th>Sales Rep</th>
                  <th>Region</th>
                  <th>Schedule</th>
                  <th>Created</th>
                  <th width="250">Actions</th>
                </tr>

              </thead>

              <tbody>

                {trips.length > 0 ? (

                  trips.map((trip) => (

                    <tr key={trip.id}>

                      <td>{trip.trip_name}</td>

                      <td>
                        {trip.sales_rep || trip.sales_rep_name}
                      </td>

                      <td>
                        {trip.region || trip.region_name}
                      </td>

                      <td>{trip.schedule_type}</td>

                      <td>{trip.created_at}</td>

                      <td>

                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEditTrip(trip)}
                        >
                          View / Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            setConfirmDeleteId(trip.id);
                            setDeleteText("");
                          }}
                        >
                          Delete
                        </button>

                        {confirmDeleteId === trip.id && (
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
                              onClick={() =>
                                handleDeleteTrip(trip.id)
                              }
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

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center"
                    >
                      No trips found
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          )}

        </div>
      </div>

    </div>
  );
}

export default Trips;