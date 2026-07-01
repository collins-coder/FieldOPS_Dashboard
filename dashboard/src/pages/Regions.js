import React, { useEffect, useState } from "react";
import axios from "axios";

function Regions() {
  const [data, setData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const API = "http://localhost:5000/api";

  const [form, setForm] = useState({
    code: "",
    name: "",
    country_id: "",
    status: "Active"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/regions`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err.message);
      setData([]);
    }
    setLoading(false);
  };

  const fetchCountries = async () => {
    try {
      const res = await axios.get(`${API}/countries`);
      setCountries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err.message);
      setCountries([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCountries();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.code || !form.name || !form.country_id) return;

    try {
      if (editing) {
        await axios.put(`${API}/regions/${editing.id}`, form);
      } else {
        await axios.post(`${API}/regions`, form);
      }

      reset();
      fetchData();
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      code: item.code || "",
      name: item.name || "",
      country_id: item.country_id || "",
      status: item.status || "Active"
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/regions/${id}`);
      fetchData();
    } catch (err) {
      console.log(err.message);
    }
  };

  const reset = () => {
    setForm({
      code: "",
      name: "",
      country_id: "",
      status: "Active"
    });
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div>

      <div className="d-flex justify-content-between mb-3">
        <h3>Regions</h3>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add Region
        </button>
      </div>

      <div className="card p-3">

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table table-hover align-middle">

            <thead className="table-dark">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Country</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((i, index) => (
                <tr key={i.id || index}>
                  <td>{i.code || "-"}</td>
                  <td>{i.name || "-"}</td>
                  <td>{i.country_name || i.country_id || "-"}</td>
                  <td>{i.status || "-"}</td>

                  <td>
                    <button
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() => handleEdit(i)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(i.id)}
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

      {showForm && (
        <div className="card p-3 mt-3">

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

          <select
            className="form-control mb-2"
            name="country_id"
            value={form.country_id}
            onChange={handleChange}
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="form-control mb-3"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button className="btn btn-success me-2" onClick={handleSave}>
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

export default Regions;