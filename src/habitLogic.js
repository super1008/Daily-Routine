// dow: Monday-first index, 0=Mon .. 6=Sun
function appliesOn(habit, dateISO, dow) {
  if (habit.startDate && dateISO < habit.startDate) return false;
  if (habit.endDate && dateISO >= habit.endDate) return false;
  if (habit.freq === 'weekly') return dow === (habit.startDow ?? 0);
  if (habit.freq === 'weekend') return dow >= 5;
  return true;
}

export { appliesOn };
