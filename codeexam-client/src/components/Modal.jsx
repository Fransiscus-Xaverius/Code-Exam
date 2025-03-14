import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';

export const ModalType = {
  DANGER: 'danger',
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning'
};

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md',
  type = 'info',
  closeOnOutsideClick = true,
  showCloseButton = true,
  preventClose = false
}) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen && !preventClose) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, preventClose]);
  
  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && !preventClose && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  const typeStyles = {
    danger: 'border-red-500',
    success: 'border-green-500',
    info: 'border-blue-500',
    warning: 'border-yellow-500'
  };

  const modalSizeClass = sizeClasses[size] || sizeClasses.md;
  const modalTypeClass = typeStyles[type] || typeStyles.info;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleOutsideClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={`${modalSizeClass} w-full bg-white rounded-lg shadow-xl overflow-hidden animate-scaleIn border-t-4 ${modalTypeClass}`}
      >
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {showCloseButton && !preventClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {children}
        </div>
        
        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  preventClose = false
}) => {
  const icons = {
    danger: <AlertTriangle className="h-6 w-6 text-red-500" />,
    success: <CheckCircle className="h-6 w-6 text-green-500" />,
    info: <Info className="h-6 w-6 text-blue-500" />,
    warning: <AlertCircle className="h-6 w-6 text-yellow-500" />
  };

  const buttonVariants = {
    danger: 'danger',
    success: 'success',
    info: 'primary',
    warning: 'warning'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
      preventClose={preventClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={preventClose}>
            {cancelText}
          </Button>
          <Button variant={buttonVariants[type]} onClick={onConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <p className="text-gray-700">{message}</p>
      </div>
    </Modal>
  );
};

export default Modal;