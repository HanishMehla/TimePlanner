import { useState } from "react";
import "./Auth.css";
import PropTypes from "prop-types";

export default function Auth({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const endpoint = isSignUp ? "/api/users/signup" : "/api/users/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (isSignUp) {
        setSuccessMsg("Account created! You can now sign in.");
        setIsSignUp(false);
        setUsername("");
        setPassword("");
        return;
      }

      setSuccessMsg("Signed in successfully!");
      setTimeout(() => onLogin(data.user), 800);
    } catch (_err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">
          Time<span>Planner</span>
        </h1>
        <p className="auth-tagline">Smart Time-Table Planner</p>

        <div className="auth-toggle">
          <button
            className={!isSignUp ? "active" : ""}
            onClick={() => {
              setIsSignUp(false);
              setError("");
              setSuccessMsg("");
            }}
          >
            Sign In
          </button>
          <button
            className={isSignUp ? "active" : ""}
            onClick={() => {
              setIsSignUp(true);
              setError("");
              setSuccessMsg("");
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Username</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}
          {successMsg && <p className="auth-success">{successMsg}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

Auth.propTypes = {
  onLogin: PropTypes.func.isRequired,
};
