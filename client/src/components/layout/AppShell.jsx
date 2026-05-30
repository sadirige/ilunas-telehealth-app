import { useState } from 'react';
import Sidebar from './Sidebar';

const AppShell = ({
  roleLabel,
  userName,
  navItems,
  activeSection,
  onNavigate,
  onLogout,
  title,
  subtitle,
  showEmergencyBanner = false,
  children
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (sectionId) => {
    onNavigate(sectionId);
    setMenuOpen(false);
  };

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          type="button"
          className="app-shell__backdrop"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      <Sidebar
        roleLabel={roleLabel}
        userName={userName}
        navItems={navItems}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="app-shell__main">
        <header className="app-shell__topbar">
          <button
            type="button"
            className="app-shell__menu-btn ghost ghost--compact"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <span className="app-shell__menu-icon" aria-hidden="true" />
            Menu
          </button>
          <div className="app-shell__titles">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </header>

        <main className="app-shell__content">
          {showEmergencyBanner && (
            <div className="emergency-banner" role="note">
              <strong>Not for emergencies.</strong> If you are experiencing a medical emergency, call
              your local emergency number immediately.
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
