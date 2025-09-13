import { Form, Select as AntdSelect, SelectProps, FormItemProps } from 'antd';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { ReactNode } from 'react';

type TOption = {
  label: string;
  value: any;
  disabled?: boolean;
};

type TFormSelectProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  options: TOption[];
  rules?: any;
  formItemProps?: FormItemProps;
  selectProps?: SelectProps;
  mode?: 'multiple' | 'tags';
  showSearch?: boolean;
};

const FormSelect = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  rules,
  formItemProps,
  selectProps,
  mode,
  showSearch = true,
}: TFormSelectProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <Form.Item
          label={label}
          validateStatus={error ? 'error' : ''}
          help={error?.message}
          {...formItemProps}
        >
          <AntdSelect
            {...field}
            showSearch={showSearch}
            optionFilterProp="label"
            filterOption={(input, option) => {
              const label = option?.label;
              const labelStr = typeof label === 'string' ? label : String(label || '');
              return labelStr.toLowerCase().includes(input.toLowerCase());
            }}
            options={options}
            mode={mode}
            style={{ width: '100%' }}
            {...selectProps}
          />
        </Form.Item>
      )}
    />
  );
};

export default FormSelect;
