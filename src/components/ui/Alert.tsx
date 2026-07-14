import { useEffect, useRef, type CSSProperties } from 'react';

interface AlertProps {
  message: string;
  type: 'error' | 'success';
  className?: string;
  style?: CSSProperties;
}

export function Alert({ message, type, className, style }: Readonly<AlertProps>) {
  const ref = useRef<HTMLOutputElement>(null);

  useEffect(() => {
    if (message && ref.current) {
      const frame = globalThis.requestAnimationFrame(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        ref.current?.focus();
      });
      return () => globalThis.cancelAnimationFrame(frame);
    }

    return undefined;
  }, [message]);

  if (!message) return null;

  const cls = [type === 'error' ? 'auth-error' : 'auth-success', className]
    .filter(Boolean)
    .join(' ');

  return (
    <output ref={ref} tabIndex={-1} role={type === 'error' ? 'alert' : 'status'} className={cls} style={style}>
      {message}
    </output>
  );
}
