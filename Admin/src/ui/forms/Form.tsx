import React from 'react';
import { Form as AntdForm } from 'antd';
import type { FormProps as AntdFormProps, FormItemProps as AntdFormItemProps } from 'antd';

const { useForm, useWatch, useFormInstance } = AntdForm;

type InternalFormItemType = typeof AntdForm.Item;

const FormItem: InternalFormItemType = AntdForm.Item;

interface FormItemProps extends Omit<AntdFormItemProps, 'children'> {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface FormProps<Values = any> extends Omit<AntdFormProps<Values>, 'form'> {
  form?: ReturnType<typeof useForm<Values>>[0];
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  layout?: 'horizontal' | 'vertical' | 'inline';
  onFinish?: (values: Values) => void;
  onFinishFailed?: (errorInfo: any) => void;
}

// Extend the FormComponentType to include static methods
interface FormComponentType<Values = any> extends React.FC<FormProps<Values>> {
  Item: typeof FormItem;
  useForm: typeof useForm;
  useWatch: typeof useWatch;
  useFormInstance: typeof useFormInstance;
  List: typeof AntdForm.List;
  ErrorList: typeof AntdForm.ErrorList;
  Provider: typeof AntdForm.Provider;
}

const InternalForm = React.forwardRef<any, FormProps>(({
  form,
  children,
  className = '',
  style,
  layout = 'vertical',
  onFinish,
  onFinishFailed,
  ...rest
}, ref) => {
  const handleFinish = (values: any) => {
    if (onFinish) {
      onFinish(values);
    }
  };

  const handleFinishFailed = (errorInfo: any) => {
    if (onFinishFailed) {
      onFinishFailed(errorInfo);
    }
  };

  return (
    <AntdForm
      ref={ref}
      form={form}
      className={className}
      style={style}
      layout={layout}
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
      {...rest}
    >
      {children}
    </AntdForm>
  );
});

// Create a typed Form component with static methods
const Form = InternalForm as unknown as FormComponentType;

// Attach static methods
Form.Item = FormItem;
Form.useForm = useForm;
Form.useWatch = useWatch;
Form.useFormInstance = useFormInstance;
Form.List = AntdForm.List;
Form.ErrorList = AntdForm.ErrorList;
Form.Provider = AntdForm.Provider;

export { Form as default };
export type { FormProps, FormItemProps };
