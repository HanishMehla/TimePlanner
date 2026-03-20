import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import HealthGoalForm from "../HealthGoalForm/HealthGoalForm";
import AutoGenerate from "../Autogenerate/Autogenerate";
import AcademicGoalForm from "../AcademicGoalForm/AcademicGoalForm";
import ConflictAlert from "../ConflictAlert/ConflictAlert";
import GoalDetail from "../GoalDetail/GoalDetail";
import "./Timetable.css";

export default function Timetable({ user }) {
  const [view, setView] = useState("week");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [healthGoals, setHealthGoals] = useState([]);
  const [academicGoals, setAcademicGoals] = useState([]);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [showAcademicForm, setShowAcademicForm] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [conflicts, setConflicts] = useState(null);
  const [newGoalData, setNewGoalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [showAutoGenerate, setShowAutoGenerate] = useState(false);
  const [generateSummary, setGenerateSummary] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2035, 2038, 2040];
  const timeSlots = [
    "05:00", "06:00", "07:00", "08:00", "09:00", "10:00",
    "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
  ];

  const getWeeksInMonth = (year, month) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const firstMonday = new Date(firstDay);
    const dow = firstDay.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    firstMonday.setDate(firstDay.getDate() + diff);
    let weeks = 0;
    let current = new Date(firstMonday);
    while (current <= lastDay) {
      weeks++;
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  };

  const getWeekDays = (year, month, week) => {
    const firstDay = new Date(year, month - 1, 1);
    const firstMonday = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    firstMonday.setDate(firstDay.getDate() + diff + (week - 1) * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(firstMonday);
      d.setDate(firstMonday.getDate() + i);
      return d;
    });
  };

  function getDayAbbr(date) {
    const map = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return map[date.getDay()];
  }

  const totalWeeks = getWeeksInMonth(selectedYear, selectedMonth);
  const weekDays = getWeekDays(selectedYear, selectedMonth, selectedWeek);
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  const selectedDayDate = weekDays[selectedDayIndex];
  const selectedDayAbbr = getDayAbbr(selectedDayDate);

  const displayDays =
    view === "week" ? weekDays.map((d) => getDayAbbr(d)) : [selectedDayAbbr];

  useEffect(() => {
    if (user) fetchGoals();
  }, [selectedYear, selectedMonth, user]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const [healthRes, academicRes] = await Promise.all([
        fetch("/api/health"),
        fetch("/api/academic"),
      ]);
      const healthData = await healthRes.json();
      const academicData = await academicRes.json();
      setHealthGoals(Array.isArray(healthData) ? healthData : []);
      setAcademicGoals(Array.isArray(academicData) ? academicData : []);
    } catch {
      console.error("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  const filteredHealthGoals = healthGoals.filter((goal) => {
    const [sY, sM, sD] = goal.startDate.split("-").map(Number);
    const [eY, eM, eD] = goal.endDate.split("-").map(Number);
    const startDate = new Date(sY, sM - 1, sD);
    const endDate = new Date(eY, eM - 1, eD);
    return startDate <= weekEnd && endDate >= weekStart;
  });

  const filteredAcademicGoals = academicGoals.filter((goal) => {
    const [sY, sM, sD] = goal.startDate.split("-").map(Number);
    const [eY, eM, eD] = goal.endDate.split("-").map(Number);
    const startDate = new Date(sY, sM - 1, sD);
    const endDate = new Date(eY, eM - 1, eD);
    return startDate <= weekEnd && endDate >= weekStart;
  });

  const getGoalsForSlot = (day, time) => {
    const dateForDay = weekDays.find((d) => getDayAbbr(d) === day);

    const health = filteredHealthGoals.filter((g) => {
      if (!g.days.includes(day)) return false;
      if (g.startTime > time || g.endTime <= time) return false;
      if (!dateForDay) return false;
      const [sY, sM, sD] = g.startDate.split("-").map(Number);
      const [eY, eM, eD] = g.endDate.split("-").map(Number);
      const startDate = new Date(sY, sM - 1, sD);
      const endDate = new Date(eY, eM - 1, eD);
      return dateForDay >= startDate && dateForDay <= endDate;
    });

    const academic = filteredAcademicGoals.filter((g) => {
      if (!g.days.includes(day)) return false;
      if (g.startTime > time || g.endTime <= time) return false;
      if (!dateForDay) return false;
      const [sY, sM, sD] = g.startDate.split("-").map(Number);
      const [eY, eM, eD] = g.endDate.split("-").map(Number);
      const startDate = new Date(sY, sM - 1, sD);
      const endDate = new Date(eY, eM - 1, eD);
      return dateForDay >= startDate && dateForDay <= endDate;
    });

    return { health, academic };
  };

  const handleGoalAdded = (newGoal) => {
    if (newGoal.category === "health") {
      setHealthGoals((prev) => [...prev, newGoal]);
    } else {
      setAcademicGoals((prev) => [...prev, newGoal]);
    }
    if (newGoal.warnings && newGoal.warnings.length > 0) {
      setWarnings(newGoal.warnings);
    }
  };

  const handleGoalUpdated = (updatedGoal) => {
    if (updatedGoal.category === "health") {
      setHealthGoals((prev) =>
        prev.map((g) => (g._id === updatedGoal._id ? updatedGoal : g))
      );
    } else {
      setAcademicGoals((prev) =>
        prev.map((g) => (g._id === updatedGoal._id ? updatedGoal : g))
      );
    }
  };

  const handleGoalDeleted = (goalId) => {
    setHealthGoals((prev) => prev.filter((g) => g._id !== goalId));
    setAcademicGoals((prev) => prev.filter((g) => g._id !== goalId));
  };

  const handleGoalsGenerated = (created, conflicted) => {
    created.forEach((goal) => {
      if (goal.category === "health") {
        setHealthGoals((prev) => [...prev, goal]);
      } else {
        setAcademicGoals((prev) => [...prev, goal]);
      }
    });
    setGenerateSummary({ created, conflicted });
  };

  const handleConflict = (conflictData, goalData) => {
    setConflicts(conflictData);
    setNewGoalData(goalData);
    setShowHealthForm(false);
    setShowAcademicForm(false);
  };

  const handleAcceptResolution = (savedGoal, removedGoalId, removedCategory) => {
    if (removedCategory === "health") {
      setHealthGoals((prev) =>
        prev.filter((g) => g._id.toString() !== removedGoalId.toString())
      );
    } else {
      setAcademicGoals((prev) =>
        prev.filter((g) => g._id.toString() !== removedGoalId.toString())
      );
    }
    if (savedGoal.category === "health") {
      setHealthGoals((prev) => [...prev, savedGoal]);
    } else {
      setAcademicGoals((prev) => [...prev, savedGoal]);
    }
    setConflicts(null);
    setNewGoalData(null);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    if (goal.category === "health") {
      setShowHealthForm(true);
      setShowAcademicForm(false);
    } else {
      setShowAcademicForm(true);
      setShowHealthForm(false);
    }
  };

  const closeAllForms = () => {
    setShowHealthForm(false);
    setShowAcademicForm(false);
    setShowCategoryPicker(false);
    setEditingGoal(null);
  };

  return (
    <div className="timetable-container">
      {warnings.length > 0 && (
        <div className="tt-warnings">
          {warnings.map((w, i) => (
            <div key={i} className="tt-warning">{w}</div>
          ))}
          <button className="tt-warning-close" onClick={() => setWarnings([])}>
            x
          </button>
        </div>
      )}

      <div className="timetable-toolbar">
        <div className="timetable-filters">
          <select
            className="tt-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            className="tt-select"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(Number(e.target.value));
              setSelectedWeek(1);
              setSelectedDayIndex(0);
            }}
          >
            {months.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>

          <select
            className="tt-select"
            value={selectedWeek}
            onChange={(e) => {
              setSelectedWeek(Number(e.target.value));
              setSelectedDayIndex(0);
            }}
          >
            {Array.from({ length: totalWeeks }, (_, i) => (
              <option key={i + 1} value={i + 1}>Week {i + 1}</option>
            ))}
          </select>

          <div className="tt-view-toggle">
            <button
              className={view === "week" ? "tt-toggle-btn active" : "tt-toggle-btn"}
              onClick={() => setView("week")}
            >
              Week
            </button>
            <button
              className={view === "day" ? "tt-toggle-btn active" : "tt-toggle-btn"}
              onClick={() => setView("day")}
            >
              Day
            </button>
          </div>

          {view === "day" && (
            <select
              className="tt-select"
              value={selectedDayIndex}
              onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
            >
              {weekDays.map((d, i) => (
                <option key={i} value={i}>
                  {getDayAbbr(d)} {d.getDate()} {months[d.getMonth()].slice(0, 3)}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="tt-add-wrapper">
          <button className="tt-add-btn" onClick={() => setShowCategoryPicker(true)}>
            + Add Goal
          </button>
          <button className="tt-auto-btn" onClick={() => setShowAutoGenerate(true)}>
            Auto Generate
          </button>
          {showCategoryPicker && (
            <div className="tt-category-picker">
              <button
                className="tt-category-btn health"
                onClick={() => {
                  setShowCategoryPicker(false);
                  setEditingGoal(null);
                  setShowHealthForm(true);
                }}
              >
                Health Goal
              </button>
              <button
                className="tt-category-btn academic"
                onClick={() => {
                  setShowCategoryPicker(false);
                  setEditingGoal(null);
                  setShowAcademicForm(true);
                }}
              >
                Academic Goal
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="tt-loading">Loading...</div>
      ) : (
        <div className="tt-grid-wrapper">
          <table className="tt-grid">
            <thead>
              <tr>
                <th className="tt-time-header">Time</th>
                {view === "week" ? (
                  weekDays.map((d, i) => (
                    <th key={`${selectedWeek}-${i}`} className="tt-day-header">
                      {getDayAbbr(d)}
                      <span className="tt-day-date">{d.getDate()}</span>
                    </th>
                  ))
                ) : (
                  <th className="tt-day-header">
                    {getDayAbbr(selectedDayDate)}
                    <span className="tt-day-date">
                      {selectedDayDate.getDate()}{" "}
                      {months[selectedDayDate.getMonth()].slice(0, 3)}
                    </span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="tt-time-cell">{time}</td>
                  {displayDays.map((day, i) => {
                    const { health, academic } = getGoalsForSlot(day, time);
                    return (
                      <td key={`${selectedWeek}-${i}`} className="tt-cell">
                        {health.map((g) => (
                          <div
                            key={g._id}
                            className="tt-block health"
                            onClick={() => setSelectedGoal(g)}
                          >
                            {g.description}
                          </div>
                        ))}
                        {academic.map((g) => (
                          <div
                            key={g._id}
                            className="tt-block academic"
                            onClick={() => setSelectedGoal(g)}
                          >
                            {g.description}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="tt-legend">
        <span className="tt-legend-item health">Health</span>
        <span className="tt-legend-item academic">Academic</span>
      </div>

      {selectedGoal && (
        <GoalDetail
          goal={selectedGoal}
          onEdit={(goal) => {
            setSelectedGoal(null);
            handleEditGoal(goal);
          }}
          onDelete={handleGoalDeleted}
          onClose={() => setSelectedGoal(null)}
        />
      )}

      {showHealthForm && (
        <HealthGoalForm
          existingGoal={editingGoal}
          onGoalAdded={handleGoalAdded}
          onGoalUpdated={handleGoalUpdated}
          onConflict={handleConflict}
          onClose={closeAllForms}
        />
      )}

      {showAcademicForm && (
        <AcademicGoalForm
          existingGoal={editingGoal}
          onGoalAdded={handleGoalAdded}
          onGoalUpdated={handleGoalUpdated}
          onConflict={handleConflict}
          onClose={closeAllForms}
        />
      )}

      {conflicts && newGoalData && (
        <ConflictAlert
          conflicts={conflicts}
          newGoal={newGoalData}
          onAcceptResolution={handleAcceptResolution}
          onClose={() => {
            setConflicts(null);
            setNewGoalData(null);
            if (newGoalData?.category === "health") {
              setShowHealthForm(true);
            } else {
              setShowAcademicForm(true);
            }
          }}
        />
      )}

      {showAutoGenerate && (
        <AutoGenerate
          onGoalsGenerated={handleGoalsGenerated}
          onClose={() => setShowAutoGenerate(false)}
        />
      )}

      {generateSummary && (
        <div className="ag-summary-overlay">
          <div className="ag-summary-card">
            <h2 className="ag-summary-title">Generation Complete</h2>
            <p className="ag-summary-stat">
              {generateSummary.created.length} goals created successfully
            </p>
            {generateSummary.conflicted.length > 0 && (
              <>
                <p className="ag-summary-stat conflict">
                  {generateSummary.conflicted.length} days had conflicts
                </p>
                <div className="ag-summary-list">
                  {generateSummary.conflicted.map((c, i) => (
                    <div key={i} className="ag-summary-item">
                      {c.day} {c.date} — conflict detected
                    </div>
                  ))}
                </div>
              </>
            )}
            <button
              className="ag-summary-btn"
              onClick={() => setGenerateSummary(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

Timetable.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
};