import { Radio as AntdRadio, RadioGroupProps, Form, FormItemProps } from 'antd';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { ReactNode } from 'react';

type TOption = {
  label: string;
  value: any;
  disabled?: boolean;
};

type TFormRadioProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  options: TOption[];
  rules?: any;
  formItemProps?: FormItemProps;
  radioGroupProps?: RadioGroupProps;
  direction?: 'horizontal' | 'vertical';
};

const FormRadio = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  rules,
  formItemProps,
  radioGroupProps,
  direction = 'horizontal',
}: TFormRadioProps<T>) => {
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
          <AntdRadio.Group
            {...field}
            {...radioGroupProps}
            className={`flex ${direction === 'vertical' ? 'flex-col space-y-2' : 'space-x-4'}`}
          >
            {options.map((option) => (
              <AntdRadio key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </AntdRadio>
            ))}
          </AntdRadio.Group>
        </Form.Item>
      )}
    />
  );
};

export default FormRadio;
