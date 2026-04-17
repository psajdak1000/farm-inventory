import styles from './Header.module.css';

/* Header — page header shown above each view.
   Uses English prop names and keeps Polish aliases for backward compatibility. */

function Header({ title, subtitle, tytul, podtytul, children }) {
  const resolvedTitle = title ?? tytul;
  const resolvedSubtitle = subtitle ?? podtytul;

  return (
    <header className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{resolvedTitle}</h1>
        {resolvedSubtitle && <p className={styles.subtitle}>{resolvedSubtitle}</p>}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </header>
  );
}

export default Header;
