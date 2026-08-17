import { useMemo, useState } from 'react';
import { addDays, ddayInfo, dueLabel, toISODate } from '../dateUtils.js';
import { ACCENT } from '../constants.js';
import GoalSheet from './GoalSheet.jsx';

function barStyle(pct) {
  const grad = `linear-gradient(90deg, color-mix(in oklab, ${ACCENT} 28%, #FBF9F5), ${ACCENT})`;
  const base = {
    height: '100%',
    width: `${pct}%`,
    borderRadius: 3,
    transition: 'width .3s ease',
  };
  if (pct >= 100) {
    return {
      ...base,
      backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.85) 50%, rgba(255,255,255,0) 100%), ${grad}`,
      backgroundSize: '55% 100%, 100% 100%',
      backgroundRepeat: 'no-repeat',
      animation: 'shimmer 1.7s linear infinite',
    };
  }
  return { ...base, backgroundImage: grad };
}

function GoalsTab({ goals, setGoals }) {
  const today = useMemo(() => new Date(), []);
  const [openId, setOpenId] = useState(null);

  const updateGoal = (id, field, value) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const addGoal = () => {
    const id = `g${Date.now()}`;
    setGoals((prev) => [
      ...prev,
      { id, name: '새 목표', note: '', pct: 0, due: toISODate(addDays(today, 7)) },
    ]);
    setOpenId(id);
  };

  const removeGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setOpenId(null);
  };

  const openGoal = goals.find((g) => g.id === openId);

  return (
    <div className="tab-pad">
      <div className="today-head">
        <span className="big-title">To-Do List</span>
      </div>

      <div className="goal-list">
        {goals.map((g) => {
          const dday = ddayInfo(g.due, today);
          return (
            <div key={g.id} className="goal-card" onClick={() => setOpenId(g.id)}>
              <div className="goal-top">
                <div className="goal-name-wrap">
                  <span className="goal-name">{g.name}</span>
                  <span
                    className="goal-pace"
                    style={{
                      fontWeight: dday.urgent ? 600 : 400,
                      background: dday.urgent ? '#FBEAE7' : '#F2EFE7',
                      color: dday.urgent ? '#C0392B' : '#7C7365',
                    }}
                  >
                    {dday.label}
                  </span>
                </div>
                <span className="goal-pct">{g.pct}%</span>
              </div>
              <div className="goal-bar-track">
                <div className="goal-bar-fill" style={barStyle(g.pct)} />
              </div>
              <div className="goal-bottom">
                <span>{dueLabel(g.due)}</span>
                <span>탭해서 편집</span>
              </div>
            </div>
          );
        })}
        <div className="add-goal-card" onClick={addGoal}>
          + 할 일 추가
        </div>
      </div>

      {openGoal && (
        <GoalSheet
          goal={openGoal}
          today={today}
          onUpdate={updateGoal}
          onClose={() => setOpenId(null)}
          onRemove={removeGoal}
        />
      )}
    </div>
  );
}

export default GoalsTab;
