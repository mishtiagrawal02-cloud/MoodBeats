import { useEffect, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { modalBackdrop, modalContent } from '../../utils/motionVariants';

function Modal({ isOpen, onClose, title, children }) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="dialog-backdrop"
          onClick={onClose}
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="dialog-surface shared-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {title && <h2 id={titleId}>{title}</h2>}
            {children}
            <button type="button" className="btn btn-ghost btn-icon shared-dialog-close" onClick={onClose} aria-label="Close modal">
              <i className="fas fa-times" aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
