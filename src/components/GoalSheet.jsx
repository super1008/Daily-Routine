import { useRef } from 'react';
import { ddayInfo } from '../dateUtils.js';
import { ACCENT } from '../constants.js';

function GoalSheet({ goal, today, onUpdate, onClose, onRemove }) {
  const nameRef = useRef(null);
  const noteRef = useRef(null);

  const dday = ddayInfo(goal.due, today);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="field">
          <span className="eyebrow">목표 이름</span>
          <input
            ref={nameRef}
            defaultValue={goal.name}
            className="sheet-input title"
            onChange={(e) => onUpdate(goal.id, 'name', e.target.value)}
          />
        </div>

        <div className="field">
          <span className="eyebrow">상세 내용</span>
          <textarea
            ref={noteRef}
            defaultValue={goal.note}
            rows={3}
            placeholder="무엇을 어디까지 끝내면 완료인가요?"
            className="sheet-input"
            onChange={(e) => onUpdate(goal.id, 'note', e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field" style={{ flex: 1 }}>
            <span className="eyebrow">마감일</span>
            <input
              type="date"
              value={goal.due}
              className="sheet-input"
              onChange={(e) => onUpdate(goal.id, 'due', e.target.value)}
            />
          </div>
          <div
            className="dday-badge"
            style={{
              background: dday.urgent ? '#FBEAE7' : '#F2EFE7',
              color: dday.urgent ? '#C0392B' : '#1C1913',
            }}
          >
            {dday.label}
          </div>
        </div>

        <div className="field-row" style={{ alignItems: 'center' }}>
          <span className="eyebrow" style={{ whiteSpace: 'nowrap' }}>
            진행률
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={goal.pct}
            className="pct-range"
            style={{ accentColor: ACCENT }}
            onChange={(e) => onUpdate(goal.id, 'pct', Number(e.target.value))}
          />
          <span className="pct-label">{goal.pct}%</span>
        </div>

        <div className="sheet-actions">
          <div className="confirm-btn primary" style={{ background: ACCENT, borderColor: ACCENT, flex: 1 }} onClick={onClose}>
            완료
          </div>
          <div className="danger-btn" onClick={() => onRemove(goal.id)}>
            삭제
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoalSheet;
