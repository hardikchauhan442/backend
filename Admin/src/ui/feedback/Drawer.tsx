import { Drawer as AntdDrawer, DrawerProps, Button, Space } from 'antd';
import { ReactNode } from 'react';

type TDrawerProps = Omit<DrawerProps, 'onClose'> & {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;
  loading?: boolean;
  width?: string | number;
};

const Drawer = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Save',
  cancelText = 'Cancel',
  showFooter = true,
  loading = false,
  width = 500,
  ...props
}: TDrawerProps) => {
  const footer = showFooter ? (
    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
      <Button onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      {onConfirm && (
        <Button
          type="primary"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      )}
    </div>
  ) : null;

  return (
    <AntdDrawer
      open={isOpen}
      title={title}
      onClose={onClose}
      width={width}
      footer={footer}
      {...props}
    >
      {children}
    </AntdDrawer>
  );
};

export default Drawer;
