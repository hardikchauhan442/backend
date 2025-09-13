import { Form, Input as AntdInput, InputProps, FormItemProps } from 'antd';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { ReactNode } from 'react';

type TFormInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  rules?: any;
  formItemProps?: FormItemProps;
  inputProps?: InputProps;
  suffix?: ReactNode;
  prefix?: ReactNode;
};

const FormInput = <T extends FieldValues>({
  name,
  control,
  label,
  rules,
  formItemProps,
  inputProps,
  suffix,
  prefix,
}: TFormInputProps<T>) => {
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
          <AntdInput
            {...field}
            {...inputProps}
            suffix={suffix}
            prefix={prefix}
          />
        </Form.Item>
      )}
    />
  );
};

export default FormInput;
