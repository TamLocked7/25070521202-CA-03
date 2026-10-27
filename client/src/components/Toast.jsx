export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className={`toast-notification ${toast.type || "info"} animate-slide-up`}>
      <span className="toast-icon">{toast.icon || "🔔"}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
