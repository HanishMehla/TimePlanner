import PropTypes from "prop-types";
import "./GoalDetail.css";

export default function GoalDetail({ goal, onEdit, onDelete, onClose }) {
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      const endpoint =
        goal.category === "health" ? "/api/health" : "/api/academic";
      await fetch(`${endpoint}/${goal._id}`, { method: "DELETE" });
      onDelete(goal._id);
      onClose();
    } catch (_err) {
      console.error("Failed to delete goal:", _err);
    }
  };

  return (
    <div className="gd-overlay">
      <div className="gd-card">
        <div className="gd-header">
          <h2 className="gd-title">{goal.description}</h2>
          <button className="gd-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="gd-body">
          <div className="gd-row">
            <span className="gd-label">Category</span>
            <span className={`gd-badge ${goal.category}`}>{goal.category}</span>
          </div>
          <div className="gd-row">
            <span className="gd-label">Priority</span>
            <span className={`gd-badge ${goal.priority}`}>{goal.priority}</span>
          </div>
          <div className="gd-row">
            <span className="gd-label">Time</span>
            <span className="gd-value">
              {goal.startTime} — {goal.endTime}
            </span>
          </div>
          <div className="gd-row">
            <span className="gd-label">Days</span>
            <span className="gd-value">{goal.days.join(", ")}</span>
          </div>
          <div className="gd-row">
            <span className="gd-label">Start Date</span>
            <span className="gd-value">{goal.startDate}</span>
          </div>
          <div className="gd-row">
            <span className="gd-label">End Date</span>
            <span className="gd-value">{goal.endDate}</span>
          </div>
        </div>

        <div className="gd-actions">
          <button
            className="gd-btn edit"
            onClick={() => {
              onEdit(goal);
              onClose();
            }}
          >
            Edit Goal
          </button>
          <button className="gd-btn delete" onClick={handleDelete}>
            Delete Goal
          </button>
        </div>
      </div>
    </div>
  );
}

GoalDetail.propTypes = {
  goal: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    days: PropTypes.arrayOf(PropTypes.string).isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
