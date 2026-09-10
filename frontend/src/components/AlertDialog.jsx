import { useEffect } from "react";
import "./AlertDialog.css";

function AlertDialog({ open, title, message, onClose }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="alert-dialog__backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="alert-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-message"
      >
        <h2 className="alert-dialog__title" id="alert-dialog-title">
          {title}
        </h2>
        <p className="alert-dialog__message" id="alert-dialog-message">
          {message}
        </p>
        <div className="alert-dialog__actions">
          <button
            className="alert-dialog__button"
            type="button"
            onClick={onClose}
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertDialog;
