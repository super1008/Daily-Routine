import { useState } from 'react';
import { useAppState } from './storage.js';
import TodayTab from './components/TodayTab.jsx';
import GoalsTab from './components/GoalsTab.jsx';
import StatsTab from './components/StatsTab.jsx';
import DiaryTab from './components/DiaryTab.jsx';
import BottomNav from './components/BottomNav.jsx';
import './App.css';

function App() {
  const [state, setState] = useAppState();
  const [tab, setTab] = useState('today');

  const setHabits = (updater) =>
    setState((prev) => ({ ...prev, habits: typeof updater === 'function' ? updater(prev.habits) : updater }));
  const setHabitHistory = (updater) =>
    setState((prev) => ({
      ...prev,
      habitHistory: typeof updater === 'function' ? updater(prev.habitHistory) : updater,
    }));
  const setGoals = (updater) =>
    setState((prev) => ({ ...prev, goals: typeof updater === 'function' ? updater(prev.goals) : updater }));
  const setDiaryEntries = (updater) =>
    setState((prev) => ({
      ...prev,
      diaryEntries: typeof updater === 'function' ? updater(prev.diaryEntries) : updater,
    }));

  return (
    <div className="app-shell">
      <div className="app-body">
        {tab === 'today' && (
          <TodayTab
            habits={state.habits}
            habitHistory={state.habitHistory}
            setHabits={setHabits}
            setHabitHistory={setHabitHistory}
          />
        )}
        {tab === 'goals' && <GoalsTab goals={state.goals} setGoals={setGoals} />}
        {tab === 'stats' && <StatsTab habits={state.habits} habitHistory={state.habitHistory} />}
        {tab === 'diary' && <DiaryTab diaryEntries={state.diaryEntries} setDiaryEntries={setDiaryEntries} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

export default App;
