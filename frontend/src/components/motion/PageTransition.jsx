import { motion } from 'framer-motion';
import { pageTransition } from '../../utils/motionVariants';

/**
 * PageTransition wrapper for smooth page entrance animations
 * Wraps route content for fade-in effect on navigation
 */
function PageTransition({ children }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      className="page-transition"
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
