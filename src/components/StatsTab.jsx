import { useMemo, useState } from 'react';
import { addDays, daysInMonth, mondayIndex, startOfMonth, startOfWeek, toISODate } from '../dateUtils.js';
import { appliesOn } from '../habitLogic.js';

const PERIOD_TABS = [
  { id: 'week', label: '주간' },
  { id: 'month', label: '월간' },
  { id: 'year', label: '연간' },
];

function countOn(habitHistory, iso) {
  return (habitHistory[iso] || []).length;
}

function statsIn(activeHabits, habitHistory, lo, hi) {
  const per = activeHabits
    .map((h) => {
      let possible = 0;
      let n = 0;
      for (let d = new Date(lo); d <= hi; d = addDays(d, 1)) {
        const iso = toISODate(d);
        const dow = mondayIndex(d);
        if (!appliesOn(h, iso, dow)) continue;
        possible++;
        if ((habitHistory[iso] || []).includes(h.id)) n++;
      }
      return { name: h.name, pct: possible ? Math.round((n / possible) * 100) : 0 };
    })
    .sort((a, b) => b.pct - a.pct);

  let days = 0;
  for (let d = new Date(lo); d <= hi; d = addDays(d, 1)) {
    if (countOn(habitHistory, toISODate(d)) > 0) days++;
  }

  const rate = per.length ? Math.round(per.reduce((s, x) => s + x.pct, 0) / per.length) : 0;
  return { per, days, rate };
}

function StatsTab({ habits, habitHistory }) {
  const today = useMemo(() => new Date(), []);
  const [period, setPeriod] = useState('week');

  const activeHabits = habits.filter((h) => !h.endDate);

  const computed = useMemo(() => {
    if (period === 'week') {
      const weekStart = startOfWeek(today);
      const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      const data = dates.map((d) => countOn(habitHistory, toISODate(d)));
      const weekEnd = dates[6];
      const range = `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 – ${weekEnd.getMonth() + 1}월 ${weekEnd.getDate()}일`;
      const S = statsIn(activeHabits, habitHistory, weekStart, today < weekEnd ? today : weekEnd);
      return {
        range,
        chartLabel: '요일별 완료 수',
        labels: ['월', '화', '수', '목', '금', '토', '일'],
        data,
        max: Math.max(5, ...data),
        current: mondayIndex(today),
        barGap: '10px',
        S,
      };
    }

    if (period === 'month') {
      const mStart = startOfMonth(today);
      const total = daysInMonth(today);
      const firstOffset = mondayIndex(mStart);
      const weekCount = Math.ceil((total + firstOffset) / 7);
      const data = new Array(weekCount).fill(0);
      for (let day = 1; day <= total; day++) {
        const d = new Date(mStart.getFullYear(), mStart.getMonth(), day);
        const bucket = Math.floor((day - 1 + firstOffset) / 7);
        data[bucket] += countOn(habitHistory, toISODate(d));
      }
      const currentBucket = Math.floor((today.getDate() - 1 + firstOffset) / 7);
      const monthEnd = new Date(mStart.getFullYear(), mStart.getMonth(), total);
      const S = statsIn(activeHabits, habitHistory, mStart, today < monthEnd ? today : monthEnd);
      return {
        range: `${today.getFullYear()}년 ${today.getMonth() + 1}월`,
        chartLabel: '주별 완료 수',
        labels: data.map((_, i) => `${i + 1}주`),
        data,
        max: Math.max(1, ...data),
        current: currentBucket,
        barGap: '10px',
        S,
      };
    }

    // year
    const data = new Array(12).fill(0);
    for (let m = 0; m <= today.getMonth(); m++) {
      const mStart = new Date(today.getFullYear(), m, 1);
      const mEnd = new Date(today.getFullYear(), m + 1, 0);
      const hi = mEnd < today ? mEnd : today;
      for (let d = new Date(mStart); d <= hi; d = addDays(d, 1)) {
        data[m] += countOn(habitHistory, toISODate(d));
      }
    }
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const S = statsIn(activeHabits, habitHistory, yearStart, today);
    return {
      range: `${today.getFullYear()}년`,
      chartLabel: '월별 완료 수',
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      data,
      max: Math.max(1, ...data),
      current: today.getMonth(),
      barGap: '4px',
      S,
    };
  }, [period, today, habitHistory, activeHabits]);

  return (
    <div className="tab-pad">
      <div className="today-head">
        <span className="eyebrow">{computed.range}</span>
        <span className="big-title">진척도</span>
      </div>

      <div className="period-tabs">
        {PERIOD_TABS.map((p) => (
          <div
            key={p.id}
            className={`period-tab ${period === p.id ? 'active' : ''}`}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </div>
        ))}
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-num">{computed.S.rate}%</span>
          <span className="stat-label">루틴 달성률</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{computed.S.days}일</span>
          <span className="stat-label">달성 일수</span>
        </div>
      </div>

      <span className="eyebrow">{computed.chartLabel}</span>
      <div className="bar-chart" style={{ gap: computed.barGap }}>
        {computed.data.map((n, i) => {
          const future = i > computed.current;
          const height = future ? 6 : 10 + (n / computed.max) * 92;
          const shade = `oklch(${(0.92 - 0.11 * (i / Math.max(1, computed.data.length - 1))).toFixed(3)} 0.068 ${Math.round(
            250 + 95 * (i / Math.max(1, computed.data.length - 1))
          )})`;
          return (
            <div key={i} className="bar-col">
              <span className="bar-count">{period === 'year' ? '' : n}</span>
              <div
                className="bar-fill"
                style={{
                  height: `${height}px`,
                  background: future ? '#F0EBE0' : shade,
                  boxShadow: i === computed.current ? 'inset 0 0 0 1.5px #3B5BDB' : 'none',
                }}
              />
              <span className="bar-label">{computed.labels[i]}</span>
            </div>
          );
        })}
      </div>

      <span className="eyebrow">습관별</span>
      <div className="habit-stat-list">
        {computed.S.per.map((s) => (
          <div key={s.name} className="habit-stat-row">
            <span className="habit-stat-name">{s.name}</span>
            <div className="habit-stat-track">
              <div
                className="habit-stat-fill"
                style={{
                  width: `${s.pct}%`,
                  backgroundImage: 'linear-gradient(90deg, oklch(0.92 0.068 255), oklch(0.79 0.085 320))',
                }}
              />
            </div>
            <span className="habit-stat-pct">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsTab;
