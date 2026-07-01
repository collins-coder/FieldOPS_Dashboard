import React, { useEffect, useState } from "react";
import axios from "axios";

function Taxes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "",
    rate: "",
    compound: false,
    exempt: false,
    status: "Active"
  });

  const fetchData = async () => {
    setLoading(true);
    const res = await axios.get("http://localhost:5000/api/taxes");
    setData(res.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const save = async () => {
    if (editing) {
      await axios.put(`http://localhost:5000/api/taxes/${editing.id}`, form);
    } else {
      await axios.post("http://localhost:5000/api/taxes", form);
    }
    reset();
    fetchData();
  };

  const edit = (item) => {
    setEditing(item);
    setForm(item);
    setShowForm(true);
  };

  const remove = async (id) => {
    await axios.delete(`http://localhost:5000/api/taxes/${id}`);
    fetchData();
  };

  const reset = () => {
    setForm({
      code: "",
      name: "",
      type: "",
      rate: "",
      compound: false,
      exempt: false,
      status: "Active"
    });
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div>

      <div className="d-flex justify-content-between mb-3">
        <h3>Taxes</h3>

        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Tax
        </button>
      </div>

      <div className="card p-3">
        {loading ? "Loading..." : (
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((i) => (
                <tr key={i.id}>
                  <td>{i.code}</td>
                  <td>{i.name}</td>
                  <td>{i.type}</td>
                  <td>{i.rate}</td>
                  <td>{i.status}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary me-2" onClick={() => edit(i)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(i.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="card p-4 mt-3">

          <input className="form-control mb-2" name="code" placeholder="Code" value={form.code} onChange={handleChange} />
          <input className="form-control mb-2" name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <input className="form-control mb-2" name="type" placeholder="Type" value={form.type} onChange={handleChange} />
          <input className="form-control mb-2" name="rate" placeholder="Rate" value={form.rate} onChange={handleChange} />

          <div className="mb-2">
            <label><input type="checkbox" name="compound" onChange={handleChange} /> Compound</label>
            <label className="ms-3"><input type="checkbox" name="exempt" onChange={handleChange} /> Exempt</label>
          </div>

          <button className="btn btn-success me-2" onClick={save}>Save</button>
          <button className="btn btn-secondary" onClick={reset}>Cancel</button>
        </div>
      )}

    </div>
  );
}

export default Taxes;