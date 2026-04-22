import { useState } from "react";
import PropTypes from "prop-types";
import "./HealthGoalForm.css";

export default function HealthGoalForm({
  onGoalAdded,
  onGoalUpdated,
  onConflict,
  onClose,
  existingGoal,
}) {
  const [description, setDescription] = useState(
    existingGoal?.description || "",
  );
  const [priority, setPriority] = useState(existingGoal?.priority || "medium");
  const [startTime, setStartTime] = useState(existingGoal?.startTime || "");
  const [endTime, setEndTime] = useState(existingGoal?.endTime || "");
  const [days, setDays] = useState(existingGoal?.days || []);
  const [startDate, setStartDate] = useState(existingGoal?.startDate || "");
  const [endDate, setEndDate] = useState(existingGoal?.endDate || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditMode = !!existingGoal;
  const allDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (days.length === 0) {
      setError("Please select at least one day");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be after start time");
      return;
    }

    if (startDate > endDate) {
      setError("End date must be after start date");
      return;
    }

    setLoading(true);

    try {
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode
        ? `/api/health/${existingGoal._id}`
        : "/api/health";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          priority,
          startTime,
          endTime,
          days,
          startDate,
          endDate,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        onConflict(data.conflicts, data.newGoal);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Failed to save goal");
        return;
      }

      if (isEditMode) {
        onGoalUpdated({
          ...existingGoal,
          description,
          priority,
          startTime,
          endTime,
          days,
          startDate,
          endDate,
        });
      } else {
        onGoalAdded(data);
      }
      onClose();
    } catch (_err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hgf-overlay">
      <div className="hgf-card">
        <div className="hgf-header">
          <h2 className="hgf-title">
            {isEditMode ? "Edit Health Goal" : "Add Health Goal"}
          </h2>
          <button className="hgf-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="hgf-label">Description</label>
          <input
            className="hgf-input"
            type="text"
            placeholder="e.g. Swimming"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <label className="hgf-label">Priority</label>
          <select
            className="hgf-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <label className="hgf-label">Start Time</label>
          <input
            className="hgf-input"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <label className="hgf-label">End Time</label>
          <input
            className="hgf-input"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />

          <label className="hgf-label">Days</label>
          <div className="hgf-days">
            {allDays.map((day) => (
              <button
                key={day}
                type="button"
                className={days.includes(day) ? "hgf-day active" : "hgf-day"}
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            ))}
          </div>

          <label className="hgf-label">Start Date</label>
          <input
            className="hgf-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <label className="hgf-label">End Date</label>
          <input
            className="hgf-input"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          {error && <p className="hgf-error">{error}</p>}

          <button className="hgf-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update Goal" : "Add Goal"}
          </button>
        </form>
      </div>
    </div>
  );
}

HealthGoalForm.propTypes = {
  onGoalAdded: PropTypes.func,
  onGoalUpdated: PropTypes.func,
  onConflict: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  existingGoal: PropTypes.object,
};

HealthGoalForm.defaultProps = {
  onGoalAdded: () => {},
  onGoalUpdated: () => {},
  existingGoal: null,
};
