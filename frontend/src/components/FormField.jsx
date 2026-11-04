import { useId } from 'react';

export default function FormField({ label, error, as: Control = 'input', ...props }) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Control
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && <span id={errorId} className="field-error">{error}</span>}
    </div>
  );
}
