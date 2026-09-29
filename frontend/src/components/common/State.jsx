export function Loading({ text = "Loading..." }) {
  return <div className="state">{text}</div>;
}
export function Empty({ text }) {
  return <div className="state">{text}</div>;
}
export function ErrorState({ text = "Something went wrong.", onRetry }) {
  return (
    <div className="state state-error">
      <p>{text}</p>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
