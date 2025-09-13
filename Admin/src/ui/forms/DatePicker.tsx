import React from 'react';
import { DatePicker as AntdDatePicker } from 'antd';
import type { DatePickerProps as AntdDatePickerProps, RangePickerProps } from 'antd';

const { RangePicker: AntdRangePicker } = AntdDatePicker;

export interface DatePickerProps extends Omit<AntdDatePickerProps, 'picker' | 'bordered'> {
  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year';
  showTime?: boolean;
  format?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (date: any, dateString: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  picker = 'date',
  showTime = false,
  format,
  className = '',
  style,
  disabled = false,
  placeholder,
  onChange,
  ...rest
}) => {
  const handleChange = (date: any, dateString: string) => {
    if (onChange) {
      onChange(date, dateString);
    }
  };

  return (
    <AntdDatePicker
      picker={picker}
      showTime={showTime}
      format={format}
      className={className}
      style={style}
      disabled={disabled}
      placeholder={placeholder}
      onChange={handleChange}
      {...rest}
    />
  );
};

export interface RangePickerWrapperProps extends Omit<RangePickerProps, 'bordered'> {
  showTime?: boolean;
  format?: string | string[];
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean | [boolean, boolean];
  placeholder?: [string, string];
  onChange?: (dates: any, dateStrings: [string, string]) => void;
}

export const RangePicker: React.FC<RangePickerWrapperProps> = ({
  showTime = false,
  format,
  className = '',
  style,
  disabled = false,
  placeholder = ['Start date', 'End date'],
  onChange,
  ...rest
}) => {
  const handleChange = (dates: any, dateStrings: [string, string]) => {
    if (onChange) {
      onChange(dates, dateStrings);
    }
  };

  return (
    <AntdRangePicker
      showTime={showTime}
      format={format}
      className={className}
      style={style}
      disabled={disabled}
      placeholder={placeholder}
      onChange={handleChange}
      {...rest}
    />
  );
};

export default DatePicker;
