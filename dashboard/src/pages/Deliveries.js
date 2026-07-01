import React, { useEffect, useState } from "react";

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [formData, setFormData] = useState({
    dispatch_code: "",
    order_number: "",
    customer: "",
    delivery_address: "",
    item_name: "",
    quantity: "",
    driver_name: "",
    vehicle_details: "",
    agent: "",
    delivery_date: "",
    status: "Not Started",
    return_status: "No Return",
    return_reason: ""
  });

  // ================= MOCK DATA =================
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        dispatch_code: "DISP-001",
        order_number: "SO-001",
        customer: "John Doe Ltd",
        delivery_address: "Westlands, Nairobi",
        item_name: "Office Chairs",
        quantity: 10,
        driver_name: "James Kariuki",
        vehicle_details: "KDA 345X - Canter",
        agent: "sales1",
        status: "Not Started",
        return_status: "No Return",
        return_reason: "",
        delivery_date: "2026-04-25"
      },
      {
        id: 2,
        dispatch_code: "DISP-002",
        order_number: "SO-002",
        customer: "Acme Traders",
        delivery_address: "Industrial Area, Nairobi",
        item_name: "Laptop HP ProBook",
        quantity: 5,
        driver_name: "Peter Mwangi",
        vehicle_details: "KCB 908P - Van",
        agent: "sales2",
        status: "Delivered",
        return_status: "No Return",
        return_reason: "",
        delivery_date: "2026-04-24"
      }
    ];

    setDeliveries(mockData);
  }, []);

  // ================= INPUT =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ================= SAVE (CREATE + UPDATE) =================
  const handleSave = () => {
    if (!formData.dispatch_code || !formData.customer) {
      alert("Please fill required fields");
      return;
    }

    if (editing) {
      const updated = deliveries.map((d) =>
        d.id === editing.id ? { ...d, ...formData } : d
      );

      setDeliveries(updated);
      setEditing(null);
    } else {
      const newDelivery = {
        id: deliveries.length + 1,
        ...formData
      };

      setDeliveries([newDelivery, ...deliveries]);
    }

    setFormData({
      dispatch_code: "",
      order_number: "",
      customer: "",
      delivery_address: "",
      item_name: "",
      quantity: "",
      driver_name: "",
      vehicle_details: "",
      agent: "",
      delivery_date: "",
      status: "Not Started",
      return_status: "No Return",
      return_reason: ""
    });

    setShowForm(false);
  };

  // ================= EDIT =================
  const handleEdit = (d) => {
    setEditing(d);
    setFormData(d);
    setShowForm(true);
  };

  // ================= PRINT =================
  const handlePrint = (d) => {
    const w = window.open("", "_blank");

    w.document.write(`
      <html>
        <head>
          <title>Delivery Note</title>
          <style>
            body { font-family: Arial; padding: 30px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td, th { border: 1px solid #ddd; padding: 10px; }
          </style>
        </head>
        <body>
          <h2>DELIVERY NOTE</h2>

          <table>
            <tr><th>Dispatch Code</th><td>${d.dispatch_code}</td></tr>
            <tr><th>Order Number</th><td>${d.order_number}</td></tr>
            <tr><th>Customer</th><td>${d.customer}</td></tr>
            <tr><th>Address</th><td>${d.delivery_address}</td></tr>
            <tr><th>Item</th><td>${d.item_name}</td></tr>
            <tr><th>Quantity</th><td>${d.quantity}</td></tr>
            <tr><th>Driver</th><td>${d.driver_name}</td></tr>
            <tr><th>Vehicle</th><td>${d.vehicle_details}</td></tr>
            <tr><th>Status</th><td>${d.status}</td></tr>
            <tr><th>Return Status</th><td>${d.return_status}</td></tr>
            <tr><th>Return Reason</th><td>${d.return_reason || "-"}</td></tr>
          </table>

          <br><br>
          <p>Driver Signature: ____________________</p>
          <p>Customer Signature: __________________</p>
        </body>
      </html>
    `);

    w.document.close();
    w.print();
  };

  // ================= STATUS =================
  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return <span className="badge bg-success">Delivered</span>;

      case "Pending":
        return <span className="badge bg-warning text-dark">Pending</span>;

      case "Not Started":
        return <span className="badge bg-secondary">Not Started</span>;

      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // ================= UI =================
  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Deliveries</h3>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
        >
          + Add Delivery
        </button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm p-3">

        <table className="table table-hover align-middle">

          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Dispatch</th>
              <th>Order</th>
              <th>Customer</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Return</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.dispatch_code}</td>
                <td>{d.order_number}</td>
                <td>{d.customer}</td>
                <td>{d.driver_name}</td>
                <td>{getStatusBadge(d.status)}</td>
                <td>{d.return_status}</td>
                <td>{d.delivery_date}</td>

                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(d)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-dark"
                    onClick={() => handlePrint(d)}
                  >
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card p-4 mt-4">
          <h5>{editing ? "Edit Delivery" : "Add Delivery"}</h5>

          <input name="dispatch_code" className="form-control mb-2" placeholder="Dispatch Code" value={formData.dispatch_code} onChange={handleChange} />
          <input name="order_number" className="form-control mb-2" placeholder="Order Number" value={formData.order_number} onChange={handleChange} />
          <input name="customer" className="form-control mb-2" placeholder="Customer" value={formData.customer} onChange={handleChange} />
          <input name="delivery_address" className="form-control mb-2" placeholder="Address" value={formData.delivery_address} onChange={handleChange} />
          <input name="item_name" className="form-control mb-2" placeholder="Item" value={formData.item_name} onChange={handleChange} />
          <input name="quantity" className="form-control mb-2" placeholder="Quantity" value={formData.quantity} onChange={handleChange} />
          <input name="driver_name" className="form-control mb-2" placeholder="Driver" value={formData.driver_name} onChange={handleChange} />
          <input name="vehicle_details" className="form-control mb-2" placeholder="Vehicle" value={formData.vehicle_details} onChange={handleChange} />
          <input name="agent" className="form-control mb-2" placeholder="Agent" value={formData.agent} onChange={handleChange} />

          <input type="date" name="delivery_date" className="form-control mb-2" value={formData.delivery_date} onChange={handleChange} />

          <select name="status" className="form-control mb-2" value={formData.status} onChange={handleChange}>
            <option>Not Started</option>
            <option>Pending</option>
            <option>Delivered</option>
          </select>

          <select name="return_status" className="form-control mb-2" value={formData.return_status} onChange={handleChange}>
            <option>No Return</option>
            <option>Returned</option>
            <option>Partially Returned</option>
          </select>

          <input name="return_reason" className="form-control mb-3" placeholder="Return Reason" value={formData.return_reason} onChange={handleChange} />

          <button className="btn btn-success me-2" onClick={handleSave}>
            Save
          </button>

          <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      )}

    </div>
  );
}

export default Deliveries;