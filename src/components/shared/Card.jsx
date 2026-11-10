function Card({ children, title, icon, className = '', ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {title && (
        <h2 className="card-title">
          {icon && <i className={`fas fa-${icon}`}></i>}
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export default Card;
