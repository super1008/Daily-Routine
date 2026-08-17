import { useMemo, useRef, useState } from 'react';
import { addDays, DOW_KO, mondayIndex, startOfWeek, toISODate } from '../dateUtils.js';
import { appliesOn } from '../habitLogic.js';
import { ACCENT, FREQ_LABELS, FREQ_OPTIONS } from '../constants.js';
import ConfirmModal from './ConfirmModal.jsx';

const WEEK_TABS = [
  { id: 1, label: '지난주' },
  { id: 0, label: '이번 주' },
  { id: -1, label: '다음 주' },
];

const CIRC = 2 * Math.PI * 30;

function TodayTab({ habits, habitHistory, setHabits, setHabitHistory }) {
  const today = useMemo(() => new Date(), []);
  const todayISO = toISODate(today);
  const todayDow = mondayIndex(today);

  const [weekOffset, setWeekOffset] = useState(0);
  const [dayIndex, setDayIndex] = useState(todayDow);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFreq, setNewFreq] = useState('daily');
  const [pendingRemove, setPendingRemove] = useState(null);
  const nameRef = useRef(null);

  const weekStart = useMemo(
    () => addDays(startOfWeek(today), -7 * weekOffset),
    [today, weekOffset]
  );
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const weekISOs = useMemo(() => weekDates.map(toISODate), [weekDates]);

  const isTodaySelected = weekOffset === 0 && dayIndex === todayDow;
  const selectedDate = weekDates[dayIndex];
  const selectedISO = weekISOs[dayIndex];

  const countOn = (iso, dow) =>
    (habitHistory[iso] || []).filter((id) => {
      const h = habits.find((x) => x.id === id);
      return h && appliesOn(h, iso, dow);
    }).length;

  const weekCounts = weekISOs.map((iso, i) => countOn(iso, i));

  const viewHabits = habits.filter((h) => appliesOn(h, selectedISO, dayIndex));
  const doneIds = new Set(habitHistory[selectedISO] || []);
  const shownTotal = viewHabits.length;
  const shownDone = viewHabits.filter((h) => doneIds.has(h.id)).length;

  const monthCount = (habitId) => {
    const h = habits.find((x) => x.id === habitId);
    if (!h) return 0;
    const monthPrefix = todayISO.slice(0, 7);
    let n = 0;
    Object.keys(habitHistory).forEach((iso) => {
      if (!iso.startsWith(monthPrefix) || iso > todayISO) return;
      const dow = mondayIndex(new Date(`${iso}T00:00:00`));
      if (appliesOn(h, iso, dow) && habitHistory[iso].includes(habitId)) n++;
    });
    return n;
  };

  const toggleHabit = (habitId) => {
    setHabitHistory((prev) => {
      const cur = prev[selectedISO] || [];
      const had = cur.includes(habitId);
      return {
        ...prev,
        [selectedISO]: had ? cur.filter((id) => id !== habitId) : [...cur, habitId],
      };
    });
  };

  const setHabitFreq = (habitId, freq) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, freq, startDow: freq === 'weekly' ? dayIndex : h.startDow } : h
      )
    );
  };

  const addHabit = () => {
    const name = (nameRef.current?.value || newName).trim();
    if (!name) return;
    if (nameRef.current) nameRef.current.value = '';
    setNewName('');
    const id = `h${Date.now()}`;
    setHabits((prev) => [
      ...prev,
      { id, name, meta: '', freq: newFreq, startDow: dayIndex, startDate: selectedISO },
    ]);
  };

  const requestRemove = (habit) => setPendingRemove(habit);

  const removeForward = () => {
    setHabits((prev) =>
      prev.map((h) => (h.id === pendingRemove.id ? { ...h, endDate: selectedISO } : h))
    );
    setPendingRemove(null);
  };

  const removeCompletely = () => {
    const id = pendingRemove.id;
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setHabitHistory((prev) => {
      const next = {};
      Object.keys(prev).forEach((iso) => {
        next[iso] = prev[iso].filter((x) => x !== id);
      });
      return next;
    });
    setPendingRemove(null);
  };

  const doneCount = `${shownDone}/${shownTotal}`;
  const ringDash = `${(CIRC * (shownTotal ? shownDone / shownTotal : 0)).toFixed(1)} ${CIRC.toFixed(1)}`;

  let headline;
  let subline;
  if (isTodaySelected) {
    headline = shownDone === shownTotal ? '오늘 루틴 전부 완료' : `${shownTotal - shownDone}개 남았습니다`;
    subline =
      shownDone === shownTotal
        ? '기록을 이어가고 있습니다. 내일도 같은 시간에.'
        : '가장 짧은 것부터 처리하면 흐름이 이어집니다.';
  } else if (weekOffset < 0) {
    headline = `${shownDone}개 예정 · 전체 ${shownTotal}개`;
    subline = '미리 계획해 둘 루틴을 탭해서 표시해 두세요.';
  } else {
    headline =
      shownDone === shownTotal ? '이 날은 전부 완료했습니다 ♥' : `${shownDone}개 완료 · ${shownTotal - shownDone}개 놓침`;
    subline = '지난 기록도 탭해서 수정할 수 있습니다.';
  }

  const todayDateLabel = `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 ${DOW_KO[dayIndex]}요일`;

  return (
    <div className="tab-pad">
      <div className="today-head">
        <span className="eyebrow">Daily Routine</span>
        <span className="big-title">{todayDateLabel}</span>
      </div>

      <div className="ring-card">
        <div className="ring-wrap">
          <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="36" cy="36" r="30" fill="none" stroke="#EAE3D5" strokeWidth="7" />
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke={ACCENT}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={ringDash}
            />
          </svg>
          <div className="ring-count">{doneCount}</div>
        </div>
        <div className="ring-text">
          <span className="ring-headline">{headline}</span>
          <span className="ring-subline">{subline}</span>
        </div>
      </div>

      <div className="section-row">
        <span className="eyebrow">루틴</span>
        <span className="pill-btn" onClick={() => setEditing((e) => !e)}>
          {editing ? '완료' : '편집'}
        </span>
      </div>

      <div className="habit-list">
        {viewHabits.map((h) => {
          const done = doneIds.has(h.id);
          const meta =
            (h.meta ? `${h.meta} · ` : '') +
            FREQ_LABELS[h.freq] +
            (h.freq === 'weekly' ? ` ${DOW_KO[h.startDow ?? 0]}요일` : '');
          return (
            <div
              key={h.id}
              className={`habit-row ${done ? 'is-done' : ''}`}
              onClick={() => toggleHabit(h.id)}
            >
              <div className="habit-box" style={{ borderColor: done ? ACCENT : '#D3CAB8', background: done ? ACCENT : 'transparent' }}>
                {done ? '✓' : ''}
              </div>
              <div className="habit-info">
                <span className={`habit-name ${done ? 'is-done' : ''}`}>{h.name}</span>
                <span className="habit-meta">{meta}</span>
                {editing && (
                  <div className="freq-row" onClick={(e) => e.stopPropagation()}>
                    {FREQ_OPTIONS.map((f) => (
                      <span
                        key={f}
                        className="freq-chip"
                        style={{
                          borderColor: (h.freq || 'daily') === f ? ACCENT : '#CFDCEA',
                          background: (h.freq || 'daily') === f ? ACCENT : 'transparent',
                          color: (h.freq || 'daily') === f ? '#FBF9F5' : '#6E7B88',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setHabitFreq(h.id, f);
                        }}
                      >
                        {FREQ_LABELS[f]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="streak-label">이달 {monthCount(h.id)}회</span>
              {editing && (
                <span
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    requestRemove(h);
                  }}
                >
                  ✕
                </span>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="add-habit-card">
          <div className="add-habit-row">
            <div className="habit-box dashed" />
            <input
              ref={nameRef}
              placeholder="새 루틴 이름"
              className="add-habit-input"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            />
            <div className="add-btn" style={{ background: ACCENT, borderColor: ACCENT }} onMouseDown={(e) => e.preventDefault()} onClick={addHabit}>
              +
            </div>
          </div>
          <div className="freq-row" style={{ paddingLeft: 40 }}>
            {FREQ_OPTIONS.map((f) => (
              <span
                key={f}
                className="freq-chip"
                style={{
                  borderColor: newFreq === f ? ACCENT : '#CFDCEA',
                  background: newFreq === f ? ACCENT : 'transparent',
                  color: newFreq === f ? '#FBF9F5' : '#6E7B88',
                }}
                onClick={() => setNewFreq(f)}
              >
                {FREQ_LABELS[f]}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="week-nav">
        <div className="week-tabs-row">
          <div className="week-tabs">
            {WEEK_TABS.map((w) => (
              <span
                key={w.id}
                className="pill-tab"
                style={{
                  borderColor: w.id === weekOffset ? ACCENT : '#E0D8C8',
                  background: w.id === weekOffset ? ACCENT : 'transparent',
                  color: w.id === weekOffset ? '#FBF9F5' : '#8C8375',
                }}
                onClick={() => {
                  setWeekOffset(w.id);
                  setDayIndex(w.id === 0 ? todayDow : w.id === 1 ? 6 : 0);
                }}
              >
                {w.label}
              </span>
            ))}
          </div>
          {!isTodaySelected && (
            <span
              className="pill-btn"
              onClick={() => {
                setWeekOffset(0);
                setDayIndex(todayDow);
              }}
            >
              오늘로
            </span>
          )}
        </div>
        <div className="week-days">
          {DOW_KO.map((l, i) => {
            const future = weekOffset === 0 && i > todayDow;
            const opacity = future ? 0.35 : i === todayDow && weekOffset === 0 ? 1 : weekCounts[i] === 0 ? 0.4 : 0.55 + 0.09 * weekCounts[i];
            return (
              <div
                key={l}
                className="week-day"
                style={{ cursor: future ? 'default' : 'pointer' }}
                onClick={() => !future && setDayIndex(i)}
              >
                <span className="week-day-label" style={{ color: i === dayIndex ? '#1C1913' : future ? '#BDB5A6' : '#948B7C' }}>
                  {l}
                </span>
                <div
                  className="week-day-dot"
                  style={{
                    color: ACCENT,
                    background: `oklch(${(0.93 - i * 0.021).toFixed(3)} 0.062 ${250 + i * 15})`,
                    opacity,
                    outline: i === dayIndex ? `1.5px solid ${ACCENT}` : 'none',
                  }}
                >
                  {i === todayDow && weekOffset === 0 ? '★' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pendingRemove && (
        <ConfirmModal
          title={`"${pendingRemove.name}" 삭제`}
          body={`${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일부터만 제외할까요? 이전 기록은 그대로 남습니다.`}
          confirmLabel="이후 날짜부터"
          altLabel="완전히 삭제"
          onConfirm={removeForward}
          onAlt={removeCompletely}
          onCancel={() => setPendingRemove(null)}
        />
      )}
    </div>
  );
}

export default TodayTab;
