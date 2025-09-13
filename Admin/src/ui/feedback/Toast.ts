import { notification } from 'antd';
import { NotificationPlacement } from 'antd/es/notification/interface';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

interface ToastProps {
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
  placement?: NotificationPlacement;
}

export const showToast = ({
  type,
  message,
  description,
  duration = 4.5,
  placement = 'topRight',
}: ToastProps) => {
  notification[type]({
    message,
    description,
    duration,
    placement,
  });
};

// Convenience methods
export const Toast = {
  success: (message: string, description?: string) =>
    showToast({ type: 'success', message, description }),
  error: (message: string, description?: string) =>
    showToast({ type: 'error', message, description }),
  info: (message: string, description?: string) =>
    showToast({ type: 'info', message, description }),
  warning: (message: string, description?: string) =>
    showToast({ type: 'warning', message, description }),
};
