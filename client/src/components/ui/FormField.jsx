const FormField = ({
  label,
  required = false,
  hint,
  error,
  htmlFor,
  children,
  className = ''
}) => (
  <label className={`field ${className}`.trim()} htmlFor={htmlFor}>
    <span className="field__label">
      {label}
      {required && <span className="field__required" aria-hidden="true">*</span>}
    </span>
    {children}
    {hint && !error && <span className="field__hint">{hint}</span>}
    {error && <span className="field__error" role="alert">{error}</span>}
  </label>
);

export default FormField;
