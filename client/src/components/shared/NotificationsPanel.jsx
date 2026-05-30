import EmptyState from '../ui/EmptyState';

const NotificationsPanel = ({
  notifications,
  notificationStatus,
  notificationLoading,
  streamStatus,
  refreshNotifications,
  handleMarkRead,
  handleMarkAllRead
}) => (
  <section className="panel">
    <div className="section__header">
      <div>
        <h2>Notifications</h2>
        <p>Realtime updates for bookings and schedule changes.</p>
      </div>
      <div className="header-actions">
        <span className="pill">{streamStatus}</span>
        <button type="button" className="ghost ghost--compact" onClick={refreshNotifications}>
          Refresh
        </button>
        <button type="button" className="ghost ghost--compact" onClick={handleMarkAllRead}>
          Mark all read
        </button>
      </div>
    </div>

    {notificationStatus.type === 'error' && (
      <div className="alert alert--error" role="status">
        {notificationStatus.message}
      </div>
    )}

    {notificationLoading ? (
      <p className="hint">Loading notifications...</p>
    ) : notifications.length === 0 ? (
      <EmptyState
        title="No notifications yet"
        description="You'll see updates here when appointments are booked or schedules change."
      />
    ) : (
      <div className="notification__list">
        {notifications.map((note) => (
          <div
            key={note.id}
            className={
              note.readAt
                ? 'notification__item'
                : 'notification__item notification__item--unread'
            }
          >
            <div>
              <h4>{note.title}</h4>
              <p>{note.message}</p>
              <span className="notification__meta">
                {new Date(note.createdAt).toLocaleString()}
              </span>
            </div>
            {!note.readAt && (
              <button
                type="button"
                className="ghost ghost--compact"
                onClick={() => handleMarkRead(note.id)}
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    )}
  </section>
);

export default NotificationsPanel;
