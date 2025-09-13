import { Checkbox as AntdCheckbox, CheckboxProps, Form, FormItemProps } from 'antd';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { ReactNode } from 'react';

type TFormCheckboxProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: ReactNode;
  rules?: any;
  formItemProps?: FormItemProps;
  checkboxProps?: CheckboxProps;
  children?: ReactNode;
};

const FormCheckbox = <T extends FieldValues>({
  name,
  control,
  label,
  rules,
  formItemProps,
  checkboxProps,
  children,
}: TFormCheckboxProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <Form.Item
          validateStatus={error ? 'error' : ''}
          help={error?.message}
          {...formItemProps}
        >
          <AntdCheckbox
            {...field}
            checked={field.value}
            {...checkboxProps}
          >
            {children || label}
          </AntdCheckbox>
        </Form.Item>
      )}
    />
  );
};

export default FormCheckbox;
