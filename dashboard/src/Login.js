import React, { useState } from "react";
import axios from "axios";
import "./theme.css";

function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/login",
        { username, password }
      );

      const { access_token, role, username: uname } = response.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role.toLowerCase());
      localStorage.setItem("username", uname);

      setToken(access_token);

    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "radial-gradient(circle at 20% 20%, #2b2470, #171432 60%)",
      }}
    >
      <div
        className="card p-4"
        style={{ width: "400px", borderRadius: "16px", border: "none", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
      >

        {/* LOGO */}
        <div className="d-flex flex-column align-items-center mb-3">
          <img
          src={require("./logo.jpeg")}
          alt="Logo"
          style={{ width: 84, height: 84, borderRadius: 8, marginBottom: 8 }}
        />  

          <h3 className="text-center mb-0 fw-bold" style={{ color: "var(--text-primary)" }}>
            FieldOPS
          </h3>
          <small style={{ color: "var(--text-muted)" }}>Sales Force Automation System</small>
        </div>

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            className="form-control"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-2">
            {error}
          </div>
        )}

        <button
          className="btn btn-primary w-100"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-3 mb-0" style={{ fontSize: 12, color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} Goandroy. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
