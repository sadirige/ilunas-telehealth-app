const FormSection = ({ title, description, children, className = '' }) => (
  <fieldset className={`form-section ${className}`.trim()}>
    <legend className="form-section__legend">
      <span className="form-section__title">{title}</span>
      {description && <span className="form-section__desc">{description}</span>}
    </legend>
    {children}
  </fieldset>
);

export default FormSection;
