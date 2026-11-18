import { motion } from 'framer-motion';
import { cardHover } from '../../utils/motionVariants';

function Card({ children, title, icon, className = '', ...props }) {
  return (
    <motion.div 
      className={`card ${className}`}
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      {...props}
    >
      {title && (
        <h2 className="card-title">
          {icon && <i className={`fas fa-${icon}`} aria-hidden="true" />}
          {title}
        </h2>
      )}
      {children}
    </motion.div>
  );
}

export default Card;
