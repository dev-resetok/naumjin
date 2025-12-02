import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

/**
 * 토스트 타입별 스타일 및 아이콘
 */
const toastStyles = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: XCircle,
    iconColor: "text-red-600",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: AlertCircle,
    iconColor: "text-yellow-600",
  },
  info: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-800",
    icon: Info,
    iconColor: "text-indigo-600",
  },
};

/**
 * Toast 컴포넌트
 */
function Toast({ id, message, type = "info", onClose }) {
  const style = toastStyles[type];
  const Icon = style.icon;

  return (
    <div
      className={`
        ${style.bg} ${style.border} ${style.text}
        border-2 rounded-xl p-4 shadow-lg
        flex items-start gap-3 min-w-[320px] max-w-md
      `}
      style={{
        animation: "slideInRight 0.3s ease-out",
      }}
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${style.iconColor}`} />
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className={`flex-shrink-0 ${style.iconColor} hover:opacity-70 transition-opacity`}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

/**
 * ToastProvider 컴포넌트
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    // 자동 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => showToast(message, "success", duration),
    error: (message, duration) => showToast(message, "error", duration),
    warning: (message, duration) => showToast(message, "warning", duration),
    info: (message, duration) => showToast(message, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container with Animation */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * useToast Hook
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
