import { useState } from "react";
import PropTypes from "prop-types";
import "./Autogenerate.css";

export default function AutoGenerate({ onGoalsGenerated, onClose }) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("health");
  const [priority, setPriority] = useState("medium");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateEveryOtherDay = (start, end) => {
    const dates = [];
    const current = new Date(start + "T00:00:00");
    const last = new Date(end + "T00:00:00");
    let toggle = true;
    while (current <= last) {
      if (toggle) dates.push(new Date(current));
      toggle = !toggle;
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const getDayAbbr = (date) => {
    const map = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return map[date.getDay()];
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");

    if (startTime >= endTime) {
      setError("End time must be after start time");
      return;
    }

    if (startDate > endDate) {
      setError("End date must be after start date");
      return;
    }

    setLoading(true);

    const dates = generateEveryOtherDay(startDate, endDate);
    const endpoint = category === "health" ? "/api/health" : "/api/academic";

    const created = [];
    const conflicted = [];

    for (const date of dates) {
      const dayAbbr = getDayAbbr(date);
      const dateStr = formatDate(date);

      const goal = {
        description,
        category,
        priority,
        startTime,
        endTime,
        days: [dayAbbr],
        startDate: dateStr,
        endDate: dateStr,
      };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goal),
        });

        const data = await res.json();

        if (res.status === 409) {
          conflicted.push({
            date: dateStr,
            day: dayAbbr,
            conflicts: data.conflicts,
          });
        } else if (res.ok) {
          created.push(data);
        }
      } catch {
        conflicted.push({ date: dateStr, day: dayAbbr, conflicts: [] });
      }
    }

    setLoading(false);
    onGoalsGenerated(created, conflicted);
    onClose();
  };

  return (
    <div className="ag-overlay">
      <div className="ag-card">
        <div className="ag-header">
          <h2 className="ag-title">Auto Generate Timetable</h2>
          <button className="ag-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ag-info">
          <strong>How it works:</strong> Enter a goal name, category, priority,
          and a time slot. Auto Generate will schedule that goal on{" "}
          <em>every other day</em> between your start and end dates, at the same
          time each day. Any days that conflict with existing goals are
          automatically skipped.
        </div>

        <form onSubmit={handleGenerate}>
          <label className="ag-label">Description</label>
          <input
            className="ag-input"
            type="text"
            placeholder="e.g. Morning Run"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <label className="ag-label">Category</label>
          <select
            className="ag-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="health">Health</option>
            <option value="academic">Academic</option>
          </select>

          <label className="ag-label">Priority</label>
          <select
            className="ag-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <label className="ag-label">Start Time</label>
          <input
            className="ag-input"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <label className="ag-label">End Time</label>
          <input
            className="ag-input"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />

          <label className="ag-label">Start Date</label>
          <input
            className="ag-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <label className="ag-label">End Date</label>
          <input
            className="ag-input"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          {error && <p className="ag-error">{error}</p>}

          <button className="ag-btn" type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate Timetable"}
          </button>
        </form>
      </div>
    </div>
  );
}

AutoGenerate.propTypes = {
  onGoalsGenerated: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
