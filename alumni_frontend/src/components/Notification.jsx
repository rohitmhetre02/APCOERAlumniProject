import { useEffect, useState, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Notification = ({ type = 'success', message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const entranceTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(entranceTimer);
  }, []);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for exit animation
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-500',
          iconBg: 'bg-green-100'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-500',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-500',
          iconBg: 'bg-yellow-100'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-500',
          iconBg: 'bg-blue-100'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-500',
          iconBg: 'bg-gray-100'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'error':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'warning':
        return <ExclamationCircleIcon className="w-5 h-5" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5" />;
      default:
        return <InformationCircleIcon className="w-5 h-5" />;
    }
  };

  const styles = getNotificationStyles();

  const animationClasses = `
    transform transition-all duration-300 ease-out
    ${isVisible && !isLeaving 
      ? 'translate-x-0 opacity-100 scale-100' 
      : isLeaving 
        ? 'translate-x-full opacity-0 scale-95' 
        : 'translate-x-full opacity-0 scale-95'
    }
  `;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`
          max-w-md w-full 
          ${styles.bg} 
          border ${styles.border} 
          rounded-lg shadow-xl 
          p-4 
          ${animationClasses}
          hover:shadow-2xl
          backdrop-blur-sm
        `}
      >
        <div className="flex items-start">
          <div className={`
            flex-shrink-0 
            ${styles.iconBg} 
            rounded-full p-2 
            transform transition-transform duration-200
            ${isVisible ? 'scale-100' : 'scale-0'}
          `}>
            <div className={styles.icon}>
              {getIcon()}
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className={`
              text-sm font-medium ${styles.text}
              transform transition-all duration-300
              ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
            `}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`
                inline-flex ${styles.text} 
                hover:opacity-75 hover:scale-110 
                focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-offset-transparent focus:ring-opacity-50 
                rounded-md p-1 
                transform transition-all duration-200
                ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
              `}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Progress bar for auto-dismiss */}
        {duration > 0 && (
          <div className="mt-3">
            <div className={`
              w-full bg-gray-200 rounded-full h-1 overflow-hidden
              ${isVisible ? 'opacity-100' : 'opacity-0'}
            `}>
              <div 
                className={`
                  ${styles.bg.replace('bg-', 'bg-')} h-full rounded-full
                  transform transition-transform duration-100 ease-linear
                `}
                style={{
                  animation: isVisible ? `shrink ${duration}ms linear forwards` : 'none',
                  transformOrigin: 'left'
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Add custom styles for animation */}
      <style>{`
        @keyframes shrink {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Notification;
