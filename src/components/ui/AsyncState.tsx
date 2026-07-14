import { useEffect, useRef } from 'react';

interface StateProps {
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function LoadingState({ title = 'Loading', message }: Partial<StateProps>) {
  return (
    <div className="async-state" role="status" aria-live="polite">
      <span className="async-spinner" aria-hidden="true" />
      <strong>{title}</strong>
      {message && <p>{message}</p>}
    </div>
  );
}

export function EmptyState({ title, message, action }: StateProps) {
  return (
    <div className="async-state">
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {action && <button type="button" onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}

export function ErrorState({ title, message, action }: StateProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = globalThis.requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ref.current?.focus();
    });
    return () => globalThis.cancelAnimationFrame(frame);
  }, [title, message]);

  return (
    <div ref={ref} className="async-state async-state-error" role="alert" tabIndex={-1}>
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {action && <button type="button" onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}

export function SuccessState({ title, message, action }: StateProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = globalThis.requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ref.current?.focus();
    });
    return () => globalThis.cancelAnimationFrame(frame);
  }, [title, message]);

  return (
    <div ref={ref} className="async-state async-state-success" role="status" tabIndex={-1}>
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {action && <button type="button" onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}
