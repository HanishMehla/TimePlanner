function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function timesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

function datesOverlap(startDate1, endDate1, startDate2, endDate2) {
  const s1 = new Date(startDate1);
  const e1 = new Date(endDate1);
  const s2 = new Date(startDate2);
  const e2 = new Date(endDate2);
  return s1 <= e2 && s2 <= e1;
}

function daysOverlap(days1, days2) {
  return days1.some((day) => days2.includes(day));
}

export function detectConflicts(newGoal, existingGoals) {
  const conflicts = [];
  for (const existing of existingGoals) {
    const sameDays = daysOverlap(newGoal.days, existing.days);
    const sameTime = timesOverlap(
      newGoal.startTime,
      newGoal.endTime,
      existing.startTime,
      existing.endTime
    );
    const sameDates = datesOverlap(
      newGoal.startDate,
      newGoal.endDate,
      existing.startDate,
      existing.endDate
    );
    if (sameDays && sameTime && sameDates) {
      const resolution = resolveConflict(newGoal, existing);
      conflicts.push({
        conflictingGoal: existing,
        reason: `"${newGoal.description}" Overlaps with "${existing.description}" on ${existing.days.join(", ")} from ${existing.startTime} to ${existing.endTime}`,
        resolution,
      });
    }
  }
  return conflicts;
}

export function resolveConflict(newGoal, conflictingGoal) {
  const priorityRank = { high: 3, medium: 2, low: 1 };
  const newPriority = priorityRank[newGoal.priority];
  const existingPriority = priorityRank[conflictingGoal.priority];

  if (newPriority > existingPriority) {
    return {
      suggestion: "replace",
      message: `"${newGoal.description}" has higher priority. Accept to remove "${conflictingGoal.description}" and save the new goal.`,
      keepGoal: newGoal,
      removeGoal: conflictingGoal,
    };
  }

  if (newPriority < existingPriority) {
    return {
      suggestion: "reschedule",
      message: `"${conflictingGoal.description}" has higher priority. Please reschedule "${newGoal.description}" to a different time.`,
      keepGoal: conflictingGoal,
      removeGoal: newGoal,
    };
  }

  return {
    suggestion: "manual",
    message: `Both goals have equal priority. Please manually adjust the time or days of either goal.`,
    keepGoal: null,
    removeGoal: null,
  };
}

export function validateSchedule(goals) {
  const warnings = [];
  const dayMap = {};

  for (const goal of goals) {
    const duration =
      timeToMinutes(goal.endTime) - timeToMinutes(goal.startTime);
    for (const day of goal.days) {
      if (!dayMap[day]) dayMap[day] = 0;
      dayMap[day] += duration;
    }
  }

  for (const [day, totalMinutes] of Object.entries(dayMap)) {
    if (totalMinutes > 16 * 60) {
      warnings.push(
        `Unrealistic schedule on ${day}: ${Math.round(totalMinutes / 60)} hours of goals scheduled. Consider reducing goals.`
      );
    }
  }

  return warnings;
}
