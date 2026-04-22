import PropTypes from "prop-types";
import "./ConflictAlert.css";

export default function ConflictAlert({
  conflicts,
  newGoal,
  onAcceptResolution,
  onClose,
}) {
  const handleAccept = async (conflict) => {
    try {
      if (conflict.resolution?.suggestion === "replace") {
        const deleteEndpoint =
          conflict.conflictingGoal.category === "health"
            ? "/api/health"
            : "/api/academic";
        await fetch(`${deleteEndpoint}/${conflict.conflictingGoal._id}`, {
          method: "DELETE",
        });
        const saveEndpoint =
          newGoal.category === "health" ? "/api/health" : "/api/academic";
        const res = await fetch(saveEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newGoal),
        });
        const data = await res.json();
        onAcceptResolution(
          data,
          conflict.conflictingGoal._id,
          conflict.conflictingGoal.category,
        );
      } else {
        onClose();
      }
    } catch (_err) {
      console.error("Failed to accept resolution:", _err);
    }
  };

  return (
    <div className="ca-overlay">
      <div className="ca-card">
        <div className="ca-header">
          <h2 className="ca-title"> Conflict Detected</h2>
          <button className="ca-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="ca-subtitle">
          Your goal conflicts with the following existing goals:
        </p>

        <div className="ca-list">
          {conflicts.map((conflict, index) => (
            <div key={index} className="ca-item">
              <div className="ca-item-header">
                <span className="ca-item-name">
                  {conflict.conflictingGoal.description}
                </span>
                <span
                  className={`ca-priority ${conflict.conflictingGoal.priority}`}
                >
                  {conflict.conflictingGoal.priority}
                </span>
              </div>
              <p className="ca-reason">{conflict.reason}</p>
              {conflict.resolution && (
                <>
                  <p className="ca-resolution">
                    {" "}
                    {conflict.resolution.message}
                  </p>
                  {conflict.resolution.suggestion === "replace" && (
                    <button
                      className="ca-btn-accept"
                      onClick={() => handleAccept(conflict)}
                    >
                      Accept — Remove "{conflict.conflictingGoal.description}"
                      and save new goal
                    </button>
                  )}
                  {conflict.resolution.suggestion === "reschedule" && (
                    <p className="ca-hint">
                      Please reschedule your new goal to a different time.
                    </p>
                  )}
                  {conflict.resolution.suggestion === "manual" && (
                    <p className="ca-hint">
                      Please manually adjust the time or days of either goal.
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="ca-actions">
          <button className="ca-btn-close" onClick={onClose}>
            Edit Manually
          </button>
        </div>
      </div>
    </div>
  );
}

ConflictAlert.propTypes = {
  conflicts: PropTypes.arrayOf(
    PropTypes.shape({
      conflictingGoal: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        priority: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
      }).isRequired,
      reason: PropTypes.string.isRequired,
      resolution: PropTypes.shape({
        suggestion: PropTypes.string,
        message: PropTypes.string,
      }),
    }),
  ).isRequired,
  newGoal: PropTypes.object.isRequired,
  onAcceptResolution: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
