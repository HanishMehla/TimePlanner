import { useState } from "react";
import PropTypes from "prop-types";
import "./AcademicGoalForm.css";

export default function AcademicGoalForm({
  onGoalAdded,
  onGoalUpdated,
  onConflict,
  onClose,
  existingGoal,
}) {
  const [description, setDescription] = useState(
    existingGoal?.description || ""
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
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
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
        ? `/api/academic/${existingGoal._id}`
        : "/api/academic";

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
    } catch(_err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agf-overlay">
      <div className="agf-card">
        <div className="agf-header">
          <h2 className="agf-title">
            {isEditMode ? "Edit Academic Goal" : "Add Academic Goal"}
          </h2>
          <button className="agf-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="agf-label">Description</label>
          <input
            className="agf-input"
            type="text"
            placeholder="e.g. Maths Study"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <label className="agf-label">Priority</label>
          <select
            className="agf-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <label className="agf-label">Start Time</label>
          <input
            className="agf-input"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <label className="agf-label">End Time</label>
          <input
            className="agf-input"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />

          <label className="agf-label">Days</label>
          <div className="agf-days">
            {allDays.map((day) => (
              <button
                key={day}
                type="button"
                className={days.includes(day) ? "agf-day active" : "agf-day"}
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            ))}
          </div>

          <label className="agf-label">Start Date</label>
          <input
            className="agf-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <label className="agf-label">End Date</label>
          <input
            className="agf-input"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          {error && <p className="agf-error">{error}</p>}

          <button className="agf-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update Goal" : "Add Goal"}
          </button>
        </form>
      </div>
    </div>
  );
}

AcademicGoalForm.propTypes = {
  onGoalAdded: PropTypes.func,
  onGoalUpdated: PropTypes.func,
  onConflict: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  existingGoal: PropTypes.object,
};

AcademicGoalForm.defaultProps = {
  onGoalAdded: () => {},
  onGoalUpdated: () => {},
  existingGoal: null,
};
