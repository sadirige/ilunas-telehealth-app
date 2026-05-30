import BrandLogo from '../ui/BrandLogo';
import { getAvatarColor } from '../../utils/avatarColors';

const Sidebar = ({
  roleLabel,
  userName,
  profilePictureUrl,
  navItems,
  activeSection,
  onNavigate,
  onLogout,
  isOpen,
  onClose
}) => {
  const avatarColor = getAvatarColor(userName);

  return (
  <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`} aria-label="Main navigation">
    <div className="sidebar__header">
      <BrandLogo subtitle={roleLabel} />
      <div className="sidebar__user-info">
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt={`${userName}'s profile`}
            className="sidebar__avatar"
          />
        ) : (
          <div
            className="sidebar__avatar sidebar__avatar--placeholder"
            style={{ backgroundColor: avatarColor }}
          >
            {userName?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        {userName && <p className="sidebar__user">{userName}</p>}
      </div>
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
};

export default Sidebar;
