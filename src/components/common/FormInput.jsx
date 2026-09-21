let uid = 0;

export default function FormInput({
  label,
  error,
  as = 'input',
  id,
  hint,
  rightElement,
  ...rest
}) {
  const inputId = id || `field_${++uid}`;
  const Tag = as;

  return (
    <div className="form-group">
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className={rightElement ? 'input-with-adornment' : undefined}>
        <Tag
          id={inputId}
          className={error ? 'input-error' : ''}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />
        {rightElement}
      </div>
      {hint && !error && (
        <span id={`${inputId}-hint`} className="field-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${inputId}-error`} className="error-text" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
