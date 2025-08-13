"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowUp, ArrowDown, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ToastNotification {
  id: string;
  type: 'success' | 'upvote' | 'downvote';
  message: string;
  duration?: number;
}

interface ToastProps {
  notifications: ToastNotification[];
  removeNotification: (id: string) => void;
}

export function ToastContainer({ notifications, removeNotification }: ToastProps) {
  useEffect(() => {
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration || 3000);

      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} className="text-green-400" />;
      case 'upvote': return <ArrowUp size={18} className="text-green-400" />;
      case 'downvote': return <ArrowDown size={18} className="text-red-400" />;
      
      default: return <CheckCircle size={18} className="text-green-400" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/90 border-green-400/50';
      case 'upvote': return 'bg-green-500/90 border-green-400/50';
      case 'downvote': return 'bg-red-500/90 border-red-400/50';
      
      default: return 'bg-white/10 border-white/20';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
              ${getColors(notification.type)}
              backdrop-blur-md border rounded-xl p-4 min-w-[280px] max-w-sm
              shadow-lg flex items-center gap-3
            `}
          >
            {getIcon(notification.type)}
            <span className="text-white text-sm font-medium flex-1">
              {notification.message}
            </span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing toast notifications
export function useToast() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addNotification = (notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification
  };
}