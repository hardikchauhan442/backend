import { Tag as AntdTag } from 'antd';
import type { TagProps as AntdTagProps } from 'antd/es/tag';
import React, { ReactNode } from 'react';

const { CheckableTag: AntdCheckableTag } = AntdTag;

export type TagType = 'success' | 'processing' | 'error' | 'warning' | 'default';

export interface TagProps extends Omit<AntdTagProps, 'onClose' | 'icon'> {
  type?: TagType;
  color?: string;
  closable?: boolean;
  closeIcon?: ReactNode;
  icon?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClose?: (e: React.MouseEvent<HTMLElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const Tag: React.FC<TagProps> & {
  CheckableTag: typeof CheckableTag;
} = ({
  type,
  color,
  closable = false,
  closeIcon,
  icon,
  className = '',
  style,
  onClose,
  onClick,
  children,
  ...rest
}) => {
  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (onClose) {
      onClose(e);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  const getColor = () => {
    if (color) return color;
    switch (type) {
      case 'success':
        return 'success';
      case 'processing':
        return 'processing';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <AntdTag
      color={getColor()}
      closable={closable}
      closeIcon={closeIcon}
      icon={icon}
      className={className}
      style={style}
      onClose={handleClose}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </AntdTag>
  );
};

export interface CheckableTagProps {
  checked: boolean;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (checked: boolean) => void;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    children?: ReactNode;
}

export const CheckableTag: React.FC<CheckableTagProps> = ({
  checked,
  className = '',
  style,
  onChange,
  onClick,
  children,
  ...rest
}) => {
  const handleChange = (newChecked: boolean) => {
    if (onChange) {
      onChange(newChecked);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <AntdCheckableTag
      checked={checked}
      className={className}
      style={style}
      onChange={handleChange}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </AntdCheckableTag>
  );
};

// Attach static methods
Tag.CheckableTag = CheckableTag;

export default Tag;
