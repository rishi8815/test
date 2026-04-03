import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
};

export function Button({ className = '', variant = 'primary', loading, children, ...rest }: Props) {
  const classes = ['btn'];
  if (variant === 'primary') classes.push('btn-primary');
  else if (variant === 'secondary') classes.push('btn-secondary');
  else classes.push('btn-ghost');
  if (className) classes.push(className);
  return (
    <button className={classes.join(' ')} disabled={loading || rest.disabled} {...rest}>
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}