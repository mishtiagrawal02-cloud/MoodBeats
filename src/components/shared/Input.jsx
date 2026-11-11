function Input({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  required = false,
  id,
  ...props 
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span style={{ color: 'var(--bad)' }}> *</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input"
        required={required}
        {...props}
      />
    </div>
  );
}

export default Input;
