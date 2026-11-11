function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  type = 'button',
  icon,
  ...props 
}) {
  const className = `btn btn-${variant}`;
  
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <i className={`fas fa-${icon}`}></i>}
      {children}
    </button>
  );
}

export default Button;
