const DOW_KO = ['월', '화', '수', '목', '금', '토', '일'];
const MOOD_OPTIONS = ['좋음', '뿌듯', '보통', '지침', '불안'];

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Monday-first day-of-week index: 0=Mon .. 6=Sun
function mondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

function startOfWeek(date) {
  return addDays(startOfDay(date), -mondayIndex(date));
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function dateLabel(date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${DOW_KO[mondayIndex(date)]}요일`;
}

function dueLabel(dueISO) {
  const d = new Date(`${dueISO}T00:00:00`);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${DOW_KO[mondayIndex(d)]}요일까지`;
}

function ddayInfo(dueISO, today) {
  const d = new Date(`${dueISO}T00:00:00`);
  const t = startOfDay(today);
  const n = Math.round((d - t) / 86400000);
  return {
    n,
    urgent: n < 5,
    label: n === 0 ? 'D-DAY' : n > 0 ? `D-${n}` : `D+${Math.abs(n)}`,
  };
}

export {
  DOW_KO,
  MOOD_OPTIONS,
  toISODate,
  startOfDay,
  addDays,
  mondayIndex,
  startOfWeek,
  startOfMonth,
  daysInMonth,
  dateLabel,
  dueLabel,
  ddayInfo,
};
