import styles from './Common.module.css';

/* ============================================
   Button — przycisk z wariantami kolorystycznymi
   Warianty: primary, secondary, danger, outline
   Rozmiary: sm, md (domyslny), lg
   ============================================ */

export function Button({
  children,
  variant,
  size,
  wariant,
  rozmiar,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
}) {
  const resolvedVariant = variant || wariant || 'primary';
  const resolvedSize = size || rozmiar || 'md';

  const klasy = [
    styles.button,
    styles[resolvedVariant],
    resolvedSize !== 'md' ? styles[resolvedSize] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={klasy} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

/* ============================================
   Loader — wskaznik ladowania danych
   ============================================ */

export function Loader({ text, tekst }) {
  const resolvedText = text || tekst || 'Loading data...';

  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.spinner} />
      <span className={styles.loaderText}>{resolvedText}</span>
    </div>
  );
}

/* ============================================
   Alert — komunikat zwrotny dla uzytkownika
   Typy: error, success, info, warning
   ============================================ */

export function Alert({ type, typ, children }) {
  const resolvedType = type || typ || 'info';
  const typeClass = {
    error: styles.alertError,
    success: styles.alertSuccess,
    info: styles.alertInfo,
    warning: styles.alertWarning,
  };

  return <div className={`${styles.alert} ${typeClass[resolvedType]}`}>{children}</div>;
}

/* ============================================
   EmptyState — komunikat gdy lista jest pusta
   ============================================ */

export function EmptyState({ title, description, icon, tytul, opis, ikona }) {
  const resolvedTitle = title ?? tytul;
  const resolvedDescription = description ?? opis;
  const resolvedIcon = icon ?? ikona ?? '---';

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{resolvedIcon}</div>
      <div className={styles.emptyTitle}>{resolvedTitle}</div>
      {resolvedDescription && <div className={styles.emptyDescription}>{resolvedDescription}</div>}
    </div>
  );
}

/* ============================================
   ConfirmModal — okno potwierdzenia akcji
   Uzywane np. przy usuwaniu rekordow
   ============================================ */

export function ConfirmModal({
  title,
  content,
  onConfirm,
  onCancel,
  isLoading,
  tytul,
  tresc,
  onPotwierdz,
  onAnuluj,
  ladowanie,
}) {
  const resolvedTitle = title ?? tytul;
  const resolvedContent = content ?? tresc;
  const resolvedOnConfirm = onConfirm ?? onPotwierdz;
  const resolvedOnCancel = onCancel ?? onAnuluj;
  const resolvedIsLoading = isLoading ?? ladowanie ?? false;

  return (
    <div className={styles.modalOverlay} onClick={resolvedOnCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>{resolvedTitle}</h3>
        <p className={styles.modalBody}>{resolvedContent}</p>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={resolvedOnCancel} disabled={resolvedIsLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={resolvedOnConfirm} disabled={resolvedIsLoading}>
            {resolvedIsLoading ? 'Deleting...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}
