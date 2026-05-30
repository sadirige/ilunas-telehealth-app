const SkeletonLoader = ({ className = '', variant = 'default', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div key={index} className={`skeleton skeleton--${variant} ${className}`}></div>
  ));

  return <div className="skeleton-wrapper">{skeletons}</div>;
};

export default SkeletonLoader;
