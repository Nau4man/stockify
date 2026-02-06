import React from 'react';
import Toast from './Toast';

const ToastContainer = ({ toasts, onRemoveToast, isDarkMode = false }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ transform: `translateY(${index * 80}px)` }}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemoveToast(toast.id)}
            isDarkMode={isDarkMode}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
