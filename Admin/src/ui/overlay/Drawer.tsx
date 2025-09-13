import { Drawer as AntdDrawer, DrawerProps as AntdDrawerProps } from 'antd';
import React from 'react';

export interface DrawerProps extends AntdDrawerProps {
  title?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  closable?: boolean;
  mask?: boolean;
  keyboard?: boolean;
  className?: string;
  style?: React.CSSProperties;
  styles?: AntdDrawerProps['styles']; // ✅ Support new v5 styles API
  destroyOnHidden?: boolean; // ✅ Use correct prop
  footer?: React.ReactNode;
  loading?: boolean;
}

const Drawer: React.FC<DrawerProps> = ({
  title,
  open,
  onClose,
  children,
  width = 720,
  placement = 'right',
  closable = true,
  mask = true,
  keyboard = true,
  className = '',
  style,
  styles,
  destroyOnClose = true, // ✅ Correct prop
  footer,
  loading = false,
  ...restProps
}) => {
  return (
    <AntdDrawer
      title={title}
      open={open}
      onClose={onClose}
      width={width}
      placement={placement}
      closable={closable}
      mask={mask}
      keyboard={keyboard}
      className={`custom-drawer ${className}`}
      style={style}
      styles={styles} // ✅ Pass new styles API
      destroyOnHidden={destroyOnClose} // ✅ Correct prop name
      footer={footer}
      {...restProps}
    >
      {loading ? <div className="p-4">Loading...</div> : children}
    </AntdDrawer>
  );
};

export default Drawer;
