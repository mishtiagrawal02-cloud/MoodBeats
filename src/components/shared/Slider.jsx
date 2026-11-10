function Slider({ 
  label, 
  value, 
  onChange, 
  min = 1, 
  max = 10, 
  step = 1,
  showValue = true,
  description,
  id,
  ...props 
}) {
  const sliderId = id || `slider-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="slider-container">
      <div className="slider-header">
        <label htmlFor={sliderId} className="slider-label" title={description}>
          {label}
        </label>
        {showValue && (
          <output className="slider-value" htmlFor={sliderId}>
            {value} / {max}
          </output>
        )}
      </div>
      <input
        id={sliderId}
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={description || label}
        {...props}
      />
      {description && (
        <p style={{ 
          fontSize: 'var(--font-size-sm)', 
          color: 'var(--muted-grey)', 
          marginTop: 'var(--space-xs)' 
        }}>
          {description}
        </p>
      )}
    </div>
  );
}

export default Slider;
