import React from "react";

/**
 * 공통 버튼 컴포넌트
 * @param {string} variant - 버튼 스타일 타입 (primary, secondary, danger)
 * @param {string} size - 버튼 크기 (sm, md, lg)
 * @param {boolean} disabled - 비활성화 여부
 * @param {function} onClick - 클릭 이벤트 핸들러
 * @param {React.ReactNode} children - 버튼 내용
 */
export default function Button({ 
  variant = "primary", 
  size = "md", 
  disabled = false,
  onClick,
  className = "",
  children 
}) {
  // 스타일 변형에 따른 클래스
  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-indigo-700",
    secondary: "bg-white hover:bg-gray-50 text-indigo-700 border-2 border-indigo-300",
    danger: "bg-red-600 hover:bg-red-700 text-white border-2 border-red-700",
  };

  // 크기에 따른 클래스
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        rounded-lg font-medium transition-colors
        ${className}
      `}
    >
      {children}
    </button>
  );
}
