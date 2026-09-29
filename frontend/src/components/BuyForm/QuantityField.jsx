export default function QuantityField({ value, onChange, max }) {
  const clamp = (n) => Math.max(1, max ? Math.min(max, n) : n);
  return (
    <div className="qty">
      <button type="button" className="btn btn-ghost" onClick={() => onChange(clamp(value - 1))}>−</button>
      <input
        type="number"
        min="1"
        value={value}
        onChange={(e) => onChange(clamp(parseInt(e.target.value, 10) || 1))}
      />
      <button type="button" className="btn btn-ghost" onClick={() => onChange(clamp(value + 1))}>+</button>
    </div>
  );
}
