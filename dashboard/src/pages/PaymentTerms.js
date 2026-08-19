import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { MASTERS_BASE } from "../api/mastersBase";

function PaymentTerms() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    days: "",
    status: "Active"
  });

  // ================= FETCH =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${MASTERS_BASE}/payment-terms`);
      setData(res.data || []);
    } catch (err) {
      console.log("FETCH ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  // ================= SAVE =================
  const save = async () => {
    try {
      const payload = {
        ...form,
        days: Number(form.days || 0) // IMPORTANT FIX
      };

      if (editing) {
        await api.put(
          `${MASTERS_BASE}/payment-terms/${editing.id}`,
          payload
        );
      } else {
        await api.post(
          `${MASTERS_BASE}/payment-terms`,
          payload
        );
      }

      reset();
      fetchData();
    } catch (err) {
      console.log("SAVE ERROR:", err.response?.data || err.message);
      alert("Save failed");
    }
  };

  // ================= EDIT =================
  const edit = (item) => {
    setEditing(item);
    setForm({
      code: item.code || "",
      name: item.name || "",
      days: item.days || "",
      status: item.status || "Active"
    });
    setShowForm(true);
  };

  // ================= DELETE =================
  const remove = async (id) => {
    try {
      await api.delete(
        `${MASTERS_BASE}/payment-terms/${id}`
      );
      fetchData();
    } catch (err) {
      console.log("DELETE ERROR:", err.response?.data || err.message);
    }
  };

  // ================= RESET =================
  const reset = () => {
    setForm({
      code: "",
      name: "",
      days: "",
      status: "Active"
    });
    setEditing(null);
    setShowForm(false);
  };

  // ================= UI =================
  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3">
        <h3>Payment Terms</h3>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
        >
          + Add
        </button>
      </div>

      {/* TABLE */}
      <div className="card p-3">

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table table-hover">

            <thead >
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((i) => (
                <tr key={i.id}>
                  <td>{i.code}</td>
                  <td>{i.name}</td>
                  <td>{i.days}</td>
                  <td>{i.status}</td>

                  <td>
                    <button
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() => edit(i)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => remove(i.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card p-4 mt-3">

          <input
            className="form-control mb-2"
            name="code"
            placeholder="Code"
            value={form.code}
            onChange={handleChange}
          />

          <input
            className="form-control mb-2"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            className="form-control mb-2"
            name="days"
            placeholder="Days"
            value={form.days}
            onChange={handleChange}
          />

          <button className="btn btn-success me-2" onClick={save}>
            Save
          </button>

          <button className="btn btn-secondary" onClick={reset}>
            Cancel
          </button>

        </div>
      )}

    </div>
  );
}

export default PaymentTerms;