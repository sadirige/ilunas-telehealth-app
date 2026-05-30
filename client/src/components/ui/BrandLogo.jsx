const BrandLogo = ({ subtitle, compact = false }) => (
  <div className={`brand${compact ? ' brand--compact' : ''}`}>
    <span className="brand__mark" aria-label="iLunas">
      <span className="brand__i">i</span>Lunas
    </span>
    {subtitle && <span className="brand__subtitle">{subtitle}</span>}
  </div>
);

export default BrandLogo;
