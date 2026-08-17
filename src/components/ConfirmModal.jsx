import { ACCENT } from '../constants.js';

function ConfirmModal({ title, body, confirmLabel, altLabel, onConfirm, onAlt, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="confirm-card">
        <span className="confirm-title">{title}</span>
        <p className="confirm-body">{body}</p>
        <div className="confirm-actions">
          <div className="confirm-btn primary" style={{ background: ACCENT, borderColor: ACCENT }} onClick={onConfirm}>
            {confirmLabel}
          </div>
          <div className="confirm-btn" onClick={onAlt}>
            {altLabel}
          </div>
        </div>
        <span className="confirm-cancel" onClick={onCancel}>
          취소
        </span>
      </div>
    </div>
  );
}

export default ConfirmModal;
