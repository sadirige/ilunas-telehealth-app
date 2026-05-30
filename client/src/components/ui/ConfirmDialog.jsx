import useModal from '../../hooks/useModal';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel
}) => {
  const { modalRef, handleBackdropClick } = useModal(isOpen, onCancel);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={handleBackdropClick}
    >
      <div className="modal modal--confirm" ref={modalRef}>
        <div className="modal__header">
          <div>
            <h3 id="confirm-dialog-title">{title}</h3>
            <p>{message}</p>
          </div>
        </div>
        <div className="modal__actions modal__actions--end">
          <button type="button" className="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={variant === 'danger' ? 'primary primary--danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
