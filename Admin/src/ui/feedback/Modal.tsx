import { Modal as AntdModal, ModalProps, Button, Space } from 'antd';
import { ReactNode } from 'react';

type TModalProps = Omit<ModalProps, 'onOk' | 'onCancel'> & {
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

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showFooter = true,
  loading = false,
  width = 520,
  ...props
}: TModalProps) => {
  const footer = showFooter ? (
    <div className="flex justify-end space-x-2">
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
    <AntdModal
      open={isOpen}
      title={title}
      onCancel={onClose}
      footer={footer}
      width={width}
      {...props}
    >
      {children}
    </AntdModal>
  );
};

export default Modal;
