import React from 'react';
import { Dropdown as AntdDropdown, Menu, Button } from 'antd';
import type { DropdownProps as AntdDropdownProps, MenuProps } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface DropdownProps extends Omit<AntdDropdownProps, 'overlay' | 'menu'> {
  items: DropdownItem[];
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  placement?: 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight';
  children?: React.ReactNode;
  showActionIcon?: boolean;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  items,
  trigger = ['click'],
  placement = 'bottomRight',
  children,
  showActionIcon = true,
  className = '',
  ...rest
}) => {
  const menu: MenuProps = {
    items: items.map(item => ({
      key: item.key,
      label: item.label,
      icon: item.icon,
      danger: item.danger,
      disabled: item.disabled,
      onClick: item.onClick,
    })),
  };

  return (
    <AntdDropdown
      menu={menu}
      trigger={trigger}
      placement={placement}
      className={className}
      {...rest}
    >
      {children || (
        <Button type="text" icon={showActionIcon ? <MoreOutlined /> : null}>
          {!showActionIcon ? 'Actions' : null}
        </Button>
      )}
    </AntdDropdown>
  );
};

export default Dropdown;
