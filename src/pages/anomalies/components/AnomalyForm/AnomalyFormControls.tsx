interface FieldErrorProps {
  readonly message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <span role="alert" className="anomaly-form__error">
      {message}
    </span>
  );
}

interface TextInputProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly error?: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly hint?: string;
  readonly onChange: (value: string) => void;
}

export function TextInput({
  id,
  label,
  value,
  error,
  placeholder,
  required,
  disabled,
  hint,
  onChange
}: TextInputProps) {
  return (
    <div className="anomaly-form__field">
      <label htmlFor={id} className="anomaly-form__label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        type="text"
        className="anomaly-form__input"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? 'true' : 'false'}
        placeholder={placeholder}
      />
      {hint && <span className="anomaly-form__hint">{hint}</span>}
      <FieldError message={error} />
    </div>
  );
}

interface TextAreaProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly error?: string;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly onChange: (value: string) => void;
}

export function TextArea({
  id,
  label,
  value,
  error,
  placeholder,
  rows = 3,
  onChange
}: TextAreaProps) {
  return (
    <div className="anomaly-form__field">
      <label htmlFor={id} className="anomaly-form__label">
        {label}
      </label>
      <textarea
        id={id}
        className="anomaly-form__textarea"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? 'true' : 'false'}
        placeholder={placeholder}
      />
      <FieldError message={error} />
    </div>
  );
}
