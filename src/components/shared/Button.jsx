import { motion } from 'framer-motion';
import { buttonHover } from '../../utils/motionVariants';

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
    <motion.button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      variants={buttonHover}
      initial="rest"
      whileHover={disabled ? undefined : 'hover'}
      whileTap={disabled ? undefined : 'tap'}
      {...props}
    >
      {icon && <i className={`fas fa-${icon}`} aria-hidden="true" />}
      {children}
    </motion.button>
  );
}

export default Button;
