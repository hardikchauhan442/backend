import type { InputProps as AntdInputProps, InputRef } from "antd";
import { Input as AntdInput } from "antd";
import React from "react";

const {
  TextArea: AntdTextArea,
  Search: AntdSearch,
  Password: AntdPassword,
} = AntdInput;

export interface InputProps extends Omit<AntdInputProps, "size"> {
  size?: "small" | "middle" | "large";
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  allowClear?: boolean | { clearIcon?: React.ReactNode };
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  status?: "error" | "warning";
}

export const Input = React.forwardRef<InputRef, InputProps>(
  (
    {
      size = "middle",
      className = "",
      style,
      disabled = false,
      placeholder,
      onChange,
      onPressEnter,
      allowClear = false,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      status,
      ...rest
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (onPressEnter) {
        onPressEnter(e);
      }
    };

    return (
      <AntdInput
        ref={ref}
        size={size}
        className={className}
        style={style}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleChange}
        onPressEnter={handlePressEnter}
        allowClear={allowClear}
        prefix={prefix}
        suffix={suffix}
        addonBefore={addonBefore}
        addonAfter={addonAfter}
        status={status}
        {...rest}
      />
    );
  }
);

Input.displayName = "Input";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPressEnter?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  allowClear?: boolean | { clearIcon?: React.ReactNode };
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  showCount?:
    | boolean
    | { formatter: (info: { count: number; maxLength?: number }) => string };
  maxLength?: number;
  status?: "error" | "warning";
}

export const TextArea: React.FC<TextAreaProps> = ({
  className = "",
  style,
  disabled = false,
  placeholder,
  onChange,
  onPressEnter,
  allowClear = false,
  autoSize = { minRows: 3, maxRows: 5 },
  showCount = false,
  maxLength,
  status,
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onPressEnter) {
      onPressEnter(e);
    }
  };

  return (
    <AntdTextArea
      className={className}
      style={style}
      disabled={disabled}
      placeholder={placeholder}
      onChange={handleChange}
      onPressEnter={handlePressEnter}
      allowClear={allowClear}
      autoSize={autoSize}
      showCount={showCount}
      maxLength={maxLength}
      status={status}
      {...rest}
    />
  );
};

export interface SearchInputProps extends Omit<unknown, "onSearch"> {
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  onSearch?: (
    value: string,
    event?:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => void;
  loading?: boolean;
  enterButton?: boolean | React.ReactNode;
  size?: "small" | "middle" | "large";
  allowClear?: boolean | { clearIcon?: React.ReactNode };
  disabled?: boolean;
}

export const Search: React.FC<SearchInputProps> = ({
  className = "",
  style,
  placeholder = "Search...",
  onSearch,
  loading = false,
  enterButton = false,
  size = "middle",
  allowClear = true,
  disabled = false,
  ...rest
}) => {
  const handleSearch = (
    value: string,
    event?:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (onSearch) {
      onSearch(value, event);
    }
  };

  return (
    <AntdSearch
      className={className}
      style={style}
      placeholder={placeholder}
      onSearch={handleSearch}
      loading={loading}
      enterButton={enterButton}
      size={size}
      allowClear={allowClear}
      disabled={disabled}
      {...rest}
    />
  );
};

export interface PasswordProps extends Omit<AntdInputProps, "size"> {
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  visibilityToggle?:
    | boolean
    | { visible?: boolean; onVisibleChange?: (visible: boolean) => void };
  iconRender?: (visible: boolean) => React.ReactNode;
  disabled?: boolean;
  status?: "error" | "warning";
}

export const Password: React.FC<PasswordProps> = ({
  className = "",
  style,
  placeholder = "Enter password",
  visibilityToggle = true,
  iconRender,
  disabled = false,
  status,
  ...rest
}) => {
  return (
    <AntdPassword
      className={className}
      style={style}
      placeholder={placeholder}
      visibilityToggle={visibilityToggle}
      iconRender={iconRender}
      disabled={disabled}
      status={status}
      {...rest}
    />
  );
};

export default Input;
