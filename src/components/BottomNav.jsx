import { ACCENT } from '../constants.js';

const TABS = [
  { id: 'today', label: '오늘' },
  { id: 'goals', label: '목표' },
  { id: 'stats', label: '통계' },
  { id: 'diary', label: '일기' },
];

function BottomNav({ tab, setTab }) {
  return (
    <div className="bottom-nav">
      {TABS.map((t) => {
        const active = tab === t.id;
        return (
          <div key={t.id} className="nav-item" onClick={() => setTab(t.id)}>
            <div
              className="nav-icon"
              style={{ borderColor: active ? ACCENT : '#C6BCA8', background: active ? ACCENT : 'transparent' }}
            />
            <span style={{ color: active ? '#1C1913' : '#9A9182' }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default BottomNav;
