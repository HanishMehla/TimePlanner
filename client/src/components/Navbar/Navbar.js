import PropTypes from "prop-types";
import "./Navbar.css";

export default function Navbar({ user, page, setPage, onLogout }) {
  const handleLogout = async () => {
    try {
      await fetch("/api/users/logout", { method: "POST" });
    } catch (_err) {
      console.error("Logout failed:", _err);
    } finally {
      onLogout();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">
          Time<span className="navbar-accent">Planner</span>
        </span>
      </div>

      <div className="navbar-center">
        <button
          className={page === "timetable" ? "nav-btn active" : "nav-btn"}
          onClick={() => setPage("timetable")}
        >
          Timetable
        </button>
        {user.role === "admin" && (
          <button
            className={page === "admin" ? "nav-btn active" : "nav-btn"}
            onClick={() => setPage("admin")}
          >
            Admin
          </button>
        )}
      </div>

      <div className="navbar-right">
        <span className="navbar-username">👤 {user.username}</span>
        <button className="nav-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
  page: PropTypes.string.isRequired,
  setPage: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};
