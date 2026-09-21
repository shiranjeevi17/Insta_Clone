import { useContext } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext } from '../../context/ToastContext';

const ICONS = { success: '✅', error: '⚠️', info: 'ℹ️' };

export default function ToastContainer() {
  const { toasts, dismissToast } = useContext(ToastContext) || { toasts: [] };

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span aria-hidden="true">{ICONS[t.type] || ICONS.info}</span>
          <span className="toast-message">{t.message}</span>
          <button className="toast-close" onClick={() => dismissToast(t.id)} aria-label="Dismiss notification">
            ✕
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
