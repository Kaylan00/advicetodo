import { useEffect } from "react";

import Icon from "./Icon";

export default function Dialog({ title, onClose, children, testId }) {
  useEffect(() => {
    const fecharComEsc = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", fecharComEsc);
    return () => window.removeEventListener("keydown", fecharComEsc);
  }, [onClose]);

  return (
    <div className="overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid={testId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="dialog__header">
          <h2>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <Icon name="close" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
