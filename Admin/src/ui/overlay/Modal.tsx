import React, { ReactNode } from 'react';
import { Modal as AntdModal, Button } from 'antd';
import type { ModalProps as AntdModalProps, ModalFuncProps, ButtonProps } from 'antd';

const { confirm, info, success, error, warning } = AntdModal;

export interface ModalProps extends Omit<AntdModalProps, 'footer' | 'destroyOnClose'> {
  title?: ReactNode;
  children?: ReactNode;
  visible?: boolean;
  onOk?: (e: React.MouseEvent<HTMLElement>) => void;
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void;
  okText?: string;
  cancelText?: string;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  footer?: ReactNode | ((onCancel: (e: React.MouseEvent<HTMLElement>) => void) => ReactNode);
  width?: string | number;
  className?: string;
  style?: React.CSSProperties;
  closable?: boolean;
  maskClosable?: boolean;
  destroyOnHidden?: boolean;
  centered?: boolean;
  zIndex?: number;
}

export const Modal: React.FC<ModalProps> & {
  confirm: (props: ModalFuncProps) => ReturnType<typeof confirm>;
  info: (props: ModalFuncProps) => ReturnType<typeof info>;
  success: (props: ModalFuncProps) => ReturnType<typeof success>;
  error: (props: ModalFuncProps) => ReturnType<typeof error>;
  warning: (props: ModalFuncProps) => ReturnType<typeof warning>;
} = ({
  title,
  children,
  visible = false,
  onOk,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
  okButtonProps,
  cancelButtonProps,
  footer: customFooter,
  width = 520,
  className = '',
  style,
  closable = true,
  maskClosable = true,
  destroyOnHidden = false,
  centered = false,
  zIndex = 1000,
  ...rest
}) => {
  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    if (onOk) {
      onOk(e);
    }
  };

  const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
    if (onCancel) {
      onCancel(e);
    }
  };

  const renderFooter = () => {
    if (customFooter === null) return null;
    if (typeof customFooter === 'function') return customFooter(handleCancel);
    if (customFooter !== undefined) return customFooter;

    return (
      <>
        <Button onClick={handleCancel} {...cancelButtonProps}>
          {cancelText}
        </Button>
        <Button type="primary" onClick={handleOk} {...okButtonProps}>
          {okText}
        </Button>
      </>
    );
  };

  return (
    <AntdModal
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={width}
      className={className}
      style={style}
      closable={closable}
      maskClosable={maskClosable}
      destroyOnHidden={destroyOnHidden}
      centered={centered}
      zIndex={zIndex}
      footer={renderFooter()}
      {...rest}
    >
      {children}
    </AntdModal>
  );
};

// Attach static methods
Modal.confirm = confirm;
Modal.info = info;
Modal.success = success;
Modal.error = error;
Modal.warning = warning;

export default Modal;
