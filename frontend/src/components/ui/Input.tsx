import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };

export function Input({ label, error, className = '', ...rest }: Props) {
  return (
    <label className="form-group">
      {label && <span className="label">{label}</span>}
      <input className={`input ${className}`} {...rest} />
      {error && <span className="text-error" style={{ color: 'var(--error)', fontSize: 12 }}>{error}</span>}
    </label>
  );
}