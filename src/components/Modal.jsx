export default function Modal({ open, title, onClose, children }) {
  if (!open) return null

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button type="button" className="modal__backdrop" aria-label="Close dialog" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__head">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
