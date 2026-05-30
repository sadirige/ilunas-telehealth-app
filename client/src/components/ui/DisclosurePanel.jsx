const DisclosurePanel = ({
  title,
  description,
  badge,
  defaultOpen = false,
  className = '',
  children
}) => (
  <details className={`disclosure ${className}`.trim()} open={defaultOpen}>
    <summary className="disclosure__summary">
      <span className="disclosure__heading">
        <span className="disclosure__title">{title}</span>
        {badge !== undefined && badge !== null && (
          <span className="disclosure__badge">{badge}</span>
        )}
      </span>
      {description && <span className="disclosure__desc">{description}</span>}
    </summary>
    <div className="disclosure__content">{children}</div>
  </details>
);

export default DisclosurePanel;
