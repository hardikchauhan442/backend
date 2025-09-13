import React, { ReactNode } from 'react';
import { Select as AntdSelect } from 'antd';
import type { SelectProps as AntdSelectProps, SelectValue, RefSelectProps } from 'antd/es/select';

const { Option: AntdOption, OptGroup: AntdOptGroup } = AntdSelect;

export interface SelectOptionProps {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface SelectOptionGroupProps {
  label: string;
  options: SelectOptionProps[];
  key?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Option: React.FC<SelectOptionProps> = ({
  value,
  label,
  disabled = false,
  title,
  className = '',
  style,
  ...rest
}) => {
  return (
    <AntdOption
      value={value}
      disabled={disabled}
      title={title}
      className={className}
      style={style}
      {...rest}
    >
      {label}
    </AntdOption>
  );
};

export const OptGroup: React.FC<SelectOptionGroupProps> = ({
  label,
  options,
  key,
  className = '',
  style,
}) => {
  return (
    <AntdOptGroup label={label} key={key} className={className} style={style}>
      {options.map((option) => (
        <Option
          key={option.value}
          value={option.value}
          label={option.label}
          disabled={option.disabled}
          title={option.title}
          className={option.className}
          style={option.style}
        />
      ))}
    </AntdOptGroup>
  );
};

export interface SelectProps<T = any> extends Omit<AntdSelectProps<T>, 'onChange' | 'onSearch' | 'options'> {
  options?: Array<{ label: ReactNode; value: any; disabled?: boolean }>;
  mode?: 'multiple' | 'tags';
  size?: 'large' | 'middle' | 'small';
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  dropdownClassName?: string;
  dropdownStyle?: React.CSSProperties;
  filterOption?: boolean | ((inputValue: string, option?: any) => boolean);
  labelInValue?: boolean;
  onChange?: (value: T, option: any) => void;
  onSearch?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onDropdownVisibleChange?: (open: boolean) => void;
  notFoundContent?: ReactNode;
  suffixIcon?: ReactNode;
  showArrow?: boolean;
  bordered?: boolean;
  status?: 'error' | 'warning';
}

const Select = React.forwardRef<RefSelectProps, SelectProps>(({
  options,
  mode,
  size = 'middle',
  placeholder = 'Please select',
  disabled = false,
  allowClear = false,
  showSearch = false,
  loading = false,
  className = '',
  style,
  dropdownClassName,
  dropdownStyle,
  filterOption = true,
  labelInValue = false,
  onChange,
  onSearch,
  onFocus,
  onBlur,
  onDropdownVisibleChange,
  notFoundContent = 'No options',
  suffixIcon,
  showArrow = true,
  bordered = true,
  status,
  children,
  ...rest
}, ref) => {
  const handleChange = (value: any, option: any) => {
    if (onChange) {
      onChange(value, option);
    }
  };

  const handleSearch = (value: string) => {
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFocus = () => {
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    if (onBlur) onBlur();
  };

  const handleDropdownVisibleChange = (open: boolean) => {
    if (onDropdownVisibleChange) onDropdownVisibleChange(open);
  };

  // Render options from options prop if provided
  const renderOptions = () => {
    if (options) {
      return options.map((option) => (
        <Option
          key={option.value}
          value={option.value}
          label={option.label}
          disabled={option.disabled}
        />
      ));
    }
    return children;
  };

  return (
    <AntdSelect
      ref={ref}
      mode={mode}
      size={size}
      placeholder={placeholder}
      disabled={disabled}
      allowClear={allowClear}
      showSearch={showSearch}
      loading={loading}
      className={className}
      style={style}
      dropdownClassName={dropdownClassName}
      dropdownStyle={dropdownStyle}
      filterOption={filterOption}
      labelInValue={labelInValue}
      onChange={handleChange}
      onSearch={showSearch ? handleSearch : undefined}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      notFoundContent={notFoundContent}
      suffixIcon={suffixIcon}
      showArrow={showArrow}
      bordered={bordered}
      status={status}
      {...rest}
    >
      {renderOptions()}
    </AntdSelect>
  );
}) as <T = any>(
  props: SelectProps<T> & { ref?: React.Ref<RefSelectProps> }
) => React.ReactElement;

// Attach static methods
Select.Option = Option;
Select.OptGroup = OptGroup;

export default Select;
