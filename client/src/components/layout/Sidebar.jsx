import BrandLogo from '../ui/BrandLogo';

const Sidebar = ({
  roleLabel,
  userName,
  navItems,
  activeSection,
  onNavigate,
  onLogout,
  isOpen,
  onClose
}) => (
  <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`} aria-label="Main navigation">
    <div className="sidebar__header">
      <BrandLogo subtitle={roleLabel} />
      {userName && <p className="sidebar__user">{userName}</p>}
      <button
        type="button"
        className="sidebar__close ghost ghost--compact"
        onClick={onClose}
        aria-label="Close navigation"
      >
        Close
      </button>
    </div>

    <nav className="sidebar__nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={
            activeSection === item.id
              ? 'sidebar__link sidebar__link--active'
              : 'sidebar__link'
          }
          onClick={() => onNavigate(item.id)}
          aria-current={activeSection === item.id ? 'page' : undefined}
        >
          <span>{item.label}</span>
          {item.badge > 0 && (
            <span className="sidebar__badge">{item.badge}</span>
          )}
        </button>
      ))}
    </nav>

    <div className="sidebar__footer">
      <button type="button" className="ghost sidebar__logout" onClick={onLogout}>
        Sign out
      </button>
    </div>
  </aside>
);

export default Sidebar;
