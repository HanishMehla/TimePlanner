import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./Admin.css";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [healthGoals, setHealthGoals] = useState([]);
  const [academicGoals, setAcademicGoals] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterUserId, setFilterUserId] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === "health") fetchHealthGoals();
    if (activeTab === "academic") fetchAcademicGoals();
    setFilterUserId("");
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (_err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealthGoals(data);
    } catch (_err) {
      setError("Failed to fetch health goals");
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/academic");
      const data = await res.json();
      setAcademicGoals(data);
    } catch (_err) {
      setError("Failed to fetch academic goals");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await fetch(`/api/${type}/${id}`, { method: "DELETE" });
      if (type === "users")
        setUsers((prev) => prev.filter((u) => u._id !== id));
      if (type === "health")
        setHealthGoals((prev) => prev.filter((g) => g._id !== id));
      if (type === "academic")
        setAcademicGoals((prev) => prev.filter((g) => g._id !== id));
    } catch (_err) {
      setError("Failed to delete record");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditData({ ...item });
  };

  const handleEditChange = (e) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSave = async (type) => {
    try {
      await fetch(`/api/${type}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (type === "health")
        setHealthGoals((prev) =>
          prev.map((g) => (g._id === editingId ? { ...g, ...editData } : g)),
        );
      if (type === "academic")
        setAcademicGoals((prev) =>
          prev.map((g) => (g._id === editingId ? { ...g, ...editData } : g)),
        );
      if (type === "users")
        setUsers((prev) =>
          prev.map((u) => (u._id === editingId ? { ...u, ...editData } : u)),
        );
      setEditingId(null);
      setEditData({});
    } catch (_err) {
      setError("Failed to update record");
    }
  };

  const renderUsersTable = () => (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Role</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            {editingId === user._id ? (
              <>
                <td>
                  <input
                    className="admin-edit-input"
                    name="username"
                    value={editData.username}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <select
                    className="admin-edit-input"
                    name="role"
                    value={editData.role}
                    onChange={handleEditChange}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="admin-btn save"
                    onClick={() => handleEditSave("users")}
                  >
                    Save
                  </button>
                  <button
                    className="admin-btn cancel"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </td>
              </>
            ) : (
              <>
                <td>{user.username}</td>
                <td>
                  <span className={`admin-role ${user.role}`}>{user.role}</span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="admin-btn edit"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-btn delete"
                    onClick={() => handleDelete(user._id, "users")}
                  >
                    Delete
                  </button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderGoalsTable = (goals, type) => (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Priority</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Days</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {goals.map((goal) => (
          <tr key={goal._id}>
            {editingId === goal._id ? (
              <>
                <td>
                  <input
                    className="admin-edit-input"
                    name="description"
                    value={editData.description}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <select
                    className="admin-edit-input"
                    name="priority"
                    value={editData.priority}
                    onChange={handleEditChange}
                  >
                    <option value="high">high</option>
                    <option value="medium">medium</option>
                    <option value="low">low</option>
                  </select>
                </td>
                <td>
                  <input
                    className="admin-edit-input"
                    name="startTime"
                    type="time"
                    value={editData.startTime}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <input
                    className="admin-edit-input"
                    name="endTime"
                    type="time"
                    value={editData.endTime}
                    onChange={handleEditChange}
                  />
                </td>
                <td>{goal.days.join(", ")}</td>
                <td>
                  <input
                    className="admin-edit-input"
                    name="startDate"
                    type="date"
                    value={editData.startDate}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <input
                    className="admin-edit-input"
                    name="endDate"
                    type="date"
                    value={editData.endDate}
                    onChange={handleEditChange}
                  />
                </td>
                <td>
                  <button
                    className="admin-btn save"
                    onClick={() => handleEditSave(type)}
                  >
                    Save
                  </button>
                  <button
                    className="admin-btn cancel"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </td>
              </>
            ) : (
              <>
                <td>{goal.description}</td>
                <td>
                  <span className={`admin-priority ${goal.priority}`}>
                    {goal.priority}
                  </span>
                </td>
                <td>{goal.startTime}</td>
                <td>{goal.endTime}</td>
                <td>{goal.days.join(", ")}</td>
                <td>{goal.startDate}</td>
                <td>{goal.endDate}</td>
                <td>
                  <button
                    className="admin-btn edit"
                    onClick={() => handleEdit(goal)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-btn delete"
                    onClick={() => handleDelete(goal._id, type)}
                  >
                    Delete
                  </button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <main className="admin-container">
      <h1 className="admin-title">Admin Panel</h1>

      <div className="admin-tabs">
        <button
          className={activeTab === "users" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={activeTab === "health" ? "admin-tab active" : "admin-tab"}
          onClick={() => setActiveTab("health")}
        >
          Health Goals
        </button>
        <button
          className={
            activeTab === "academic" ? "admin-tab active" : "admin-tab"
          }
          onClick={() => setActiveTab("academic")}
        >
          Academic Goals
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {(activeTab === "health" || activeTab === "academic") && (
        <div className="admin-filter-bar">
          <label className="admin-filter-label">Filter by user:</label>
          <select
            className="admin-filter-select"
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.username}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <div className="admin-table-wrapper">
          {activeTab === "users" && renderUsersTable()}
          {activeTab === "health" &&
            renderGoalsTable(
              healthGoals.filter(
                (g) => !filterUserId || g.userId === filterUserId,
              ),
              "health",
            )}
          {activeTab === "academic" &&
            renderGoalsTable(
              academicGoals.filter(
                (g) => !filterUserId || g.userId === filterUserId,
              ),
              "academic",
            )}
        </div>
      )}
    </main>
  );
}

Admin.propTypes = {};
