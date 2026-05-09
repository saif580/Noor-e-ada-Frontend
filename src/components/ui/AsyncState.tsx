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
  return (
    <div className="async-state async-state-error" role="alert">
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {action && <button type="button" onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}

export function SuccessState({ title, message, action }: StateProps) {
  return (
    <div className="async-state async-state-success" role="status">
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {action && <button type="button" onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}
