import styles from './Header.module.css';

/* Header — displayed above every view.
   Accepts the page title, optional subtitle and action elements (e.g. add button). */

function Header({ title, subtitle, children }) {
  return (
    <header className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </header>
  );
}

export default Header;