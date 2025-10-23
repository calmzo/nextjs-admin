"use client";

import { Toaster as ReactHotToaster } from "react-hot-toast";

interface ToasterProps {
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  reverseOrder?: boolean;
  gutter?: number;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

const Toaster: React.FC<ToasterProps> = ({
  position = "top-center",
  reverseOrder = false,
  gutter = 8,
  containerClassName = "",
  containerStyle = {
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
  },
}) => {
  return (
    <ReactHotToaster
      position={position}
      reverseOrder={reverseOrder}
      gutter={gutter}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      toastOptions={{
        // 默认选项
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        // 成功样式
        success: {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
        // 错误样式
        error: {
          duration: 5000,
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
        // 加载样式
        loading: {
          duration: Infinity,
          style: {
            background: '#3B82F6',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
        // 警告样式
        custom: {
          duration: 4000,
          style: {
            background: '#F59E0B',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        },
      }}
    />
  );
};

export default Toaster;
