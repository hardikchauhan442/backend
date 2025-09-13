import { Button as AntButton } from "antd";
import { ButtonProps } from "antd/lib/button";

export function Button(props: ButtonProps) {
  return <AntButton {...props} />;
}
