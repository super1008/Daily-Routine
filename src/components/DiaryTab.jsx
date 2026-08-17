import { useEffect, useMemo, useState } from 'react';
import { addDays, daysInMonth, dateLabel, DOW_KO, mondayIndex, MOOD_OPTIONS, startOfMonth, startOfWeek, toISODate } from '../dateUtils.js';
import { ACCENT } from '../constants.js';

function pastel(i) {
  return `oklch(${(0.93 - i * 0.021).toFixed(3)} 0.062 ${250 + i * 15})`;
}

function DiaryTab({ diaryEntries, setDiaryEntries }) {
  const today = useMemo(() => new Date(), []);
  const todayISO = toISODate(today);

  const [diaryDate, setDiaryDate] = useState(todayISO);
  const [draft, setDraft] = useState('');
  const [draftMood, setDraftMood] = useState(null);
  const [justSaved, setJustSaved] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));

  useEffect(() => {
    const e = diaryEntries[diaryDate];
    setDraft(e ? e.text : '');
    setDraftMood(e ? e.mood : null);
    setJustSaved(false);
  }, [diaryDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const weekStart = startOfWeek(today);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const canEdit = diaryDate <= todayISO;
  const selDate = new Date(`${diaryDate}T00:00:00`);

  const saveDiary = () => {
    if (!draft.trim()) return;
    setDiaryEntries((prev) => ({ ...prev, [diaryDate]: { mood: draftMood, text: draft.trim() } }));
    setJustSaved(true);
  };

  const past = Object.keys(diaryEntries).sort((a, b) => (a < b ? 1 : -1));

  const monthDays = [];
  const firstOffset = mondayIndex(viewMonth);
  for (let b = 0; b < firstOffset; b++) monthDays.push(null);
  const total = daysInMonth(viewMonth);
  for (let d = 1; d <= total; d++) {
    monthDays.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }

  return (
    <div className="tab-pad">
      <div className="today-head">
        <span className="eyebrow">{dateLabel(selDate)}</span>
        <span className="big-title">{diaryDate === todayISO ? '오늘의 일기' : 'My Diary'}</span>
      </div>

      <div className="diary-week">
        {weekDates.map((d, i) => {
          const iso = toISODate(d);
          const future = iso > todayISO;
          const selected = iso === diaryDate;
          return (
            <div
              key={iso}
              className="diary-day"
              style={{
                cursor: future ? 'default' : 'pointer',
                borderColor: selected ? ACCENT : 'transparent',
                background: pastel(i),
                opacity: future ? 0.4 : 1,
                color: selected ? '#12233A' : '#3A342B',
                fontWeight: selected ? 600 : 400,
              }}
              onClick={() => !future && setDiaryDate(iso)}
            >
              <span className="diary-dow">{DOW_KO[i]}</span>
              <span className="diary-date-num">{d.getDate()}</span>
              <div className="diary-dot" style={{ background: diaryEntries[iso] ? '#12233A' : 'transparent' }} />
            </div>
          );
        })}
      </div>

      <span className="eyebrow">오늘 기분</span>
      <div className="mood-row">
        {MOOD_OPTIONS.map((m) => (
          <div
            key={m}
            className="mood-chip"
            style={{
              cursor: canEdit ? 'pointer' : 'default',
              borderColor: draftMood === m ? ACCENT : '#E0D8C8',
              background: draftMood === m ? ACCENT : '#FFFDF8',
              color: draftMood === m ? '#FBF9F5' : '#5C5446',
            }}
            onClick={() => canEdit && setDraftMood(m)}
          >
            {m}
          </div>
        ))}
      </div>

      <div className="diary-editor">
        <textarea
          value={draft}
          placeholder="오늘 하루는 어땠나요?"
          rows={8}
          disabled={!canEdit}
          onChange={(e) => {
            setDraft(e.target.value);
            setJustSaved(false);
          }}
        />
        <div className="diary-editor-foot">
          <span className="diary-meta">{draft.trim() ? `${draft.trim().length}자` : '아직 작성 전'}</span>
          <div
            className="pill-btn save-btn"
            style={{
              color: justSaved ? ACCENT : '#FBF9F5',
              background: justSaved ? '#F2EFE7' : ACCENT,
              borderColor: justSaved ? '#E0D8C8' : ACCENT,
            }}
            onClick={saveDiary}
          >
            {justSaved ? '저장됨 ✓' : '일기 저장'}
          </div>
        </div>
      </div>

      {past.length > 0 && (
        <div className="diary-history">
          <span className="eyebrow">My Diary</span>
          <div className="diary-calendar">
            <div className="diary-calendar-head">
              <span
                className="cal-nav"
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              >
                ‹
              </span>
              <span>
                {viewMonth.getFullYear()}년 {viewMonth.getMonth() + 1}월
              </span>
              <span
                className="cal-nav"
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              >
                ›
              </span>
            </div>
            <div className="cal-grid">
              {DOW_KO.map((c) => (
                <span key={c} className="cal-head-cell">
                  {c}
                </span>
              ))}
              {monthDays.map((d, i) => {
                if (!d) return <div key={i} className="cal-cell empty" />;
                const iso = toISODate(d);
                const has = !!diaryEntries[iso];
                const future = iso > todayISO;
                const selected = iso === diaryDate;
                return (
                  <div
                    key={i}
                    className="cal-cell"
                    style={{
                      cursor: future ? 'default' : 'pointer',
                      background: has ? pastel(mondayIndex(d)) : 'transparent',
                      opacity: future ? 0.4 : 1,
                      color: has ? '#12233A' : '#A79E8E',
                      fontWeight: selected ? 600 : 400,
                      outline: selected ? `1.5px solid ${ACCENT}` : 'none',
                    }}
                    onClick={() => !future && setDiaryDate(iso)}
                  >
                    {d.getDate()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiaryTab;
