function RangeInput({ min = 0, max = 1, value, className = '', style, ...props }) {
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <input
      {...props}
      type="range"
      min={min}
      max={max}
      value={value}
      className={`range-input ${className}`}
      style={{ ...style, '--range-fill': `${Math.min(100, Math.max(0, percent))}%` }}
    />
  );
}

export default RangeInput;
