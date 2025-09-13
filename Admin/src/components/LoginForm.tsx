import { login } from "@/store/userSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Form, Input } from "antd";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as yup from "yup";

const schema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup.string().min(6).required("Password is required"),
});

interface LoginFormInputs {
  username: string;
  password: string;
}

export function LoginForm() {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: LoginFormInputs) => {
    dispatch(login({ id: "1", name: data.username, roles: "admin" }));
  };

  return (
    <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
      <Form.Item
        label="Username"
        validateStatus={errors.username ? "error" : ""}
        help={errors.username?.message}
      >
        <Input {...register("username")} />
      </Form.Item>
      <Form.Item
        label="Password"
        validateStatus={errors.password ? "error" : ""}
        help={errors.password?.message}
      >
        <Input.Password {...register("password")} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Login
        </Button>
      </Form.Item>
    </Form>
  );
}
