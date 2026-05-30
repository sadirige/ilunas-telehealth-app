const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', variant: 'scheduled' },
  completed: { label: 'Completed', variant: 'success' },
  canceled: { label: 'Canceled', variant: 'muted' },
  in_progress: { label: 'In progress', variant: 'progress' },
  no_show: { label: 'No show', variant: 'warning' }
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    variant: 'muted'
  };

  return (
    <span className={`status-badge status-badge--${config.variant}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
