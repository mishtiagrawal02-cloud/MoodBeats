import { useEffect } from 'react';

function Modal({ isOpen, onClose, title, children }) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal-backdrop)',
        padding: 'var(--space-lg)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--charcoal)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xl)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          zIndex: 'var(--z-modal)'
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {title && (
          <h2 
            id="modal-title" 
            style={{ 
              fontSize: 'var(--font-size-2xl)', 
              marginBottom: 'var(--space-lg)' 
            }}
          >
            {title}
          </h2>
        )}
        {children}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 'var(--space-lg)',
            right: 'var(--space-lg)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(139, 53, 255, 0.1)',
            color: 'var(--soft-lavender)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-base)'
          }}
          aria-label="Close modal"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
}

export default Modal;
