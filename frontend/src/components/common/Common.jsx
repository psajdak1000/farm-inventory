import styles from './Common.module.css';

/* ============================================
   Button — button with color variants
   Variants: primary, secondary, danger, outline
   Sizes: sm, md (default), lg
   ============================================ */

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
}) {
  const classes = [
    styles.button,
    styles[variant],
    size !== 'md' ? styles[size] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

/* ============================================
   Loader — loading indicator
   ============================================ */

export function Loader({ text = 'Ladowanie danych...' }) {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.spinner} />
      <span className={styles.loaderText}>{text}</span>
    </div>
  );
}

/* ============================================
   Alert — feedback message for the user
   Types: error, success, info, warning
   ============================================ */

export function Alert({ type = 'info', children }) {
  const typeClass = {
    error: styles.alertError,
    success: styles.alertSuccess,
    info: styles.alertInfo,
    warning: styles.alertWarning,
  };

  return <div className={`${styles.alert} ${typeClass[type]}`}>{children}</div>;
}

/* ============================================
   EmptyState — message when list is empty
   ============================================ */

export function EmptyState({ title, description, icon = '---' }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <div className={styles.emptyTitle}>{title}</div>
      {description && <div className={styles.emptyDescription}>{description}</div>}
    </div>
  );
}

/* ============================================
   ConfirmModal — action confirmation dialog
   Used e.g. when deleting records
   ============================================ */

export function ConfirmModal({ title, content, onConfirm, onCancel, isLoading = false }) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <p className={styles.modalBody}>{content}</p>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Anuluj
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Usuwanie...' : 'Potwierdz'}
          </Button>
        </div>
      </div>
    </div>
  );
}