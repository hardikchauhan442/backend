import { Button as AntdButton } from "antd";
import { ReactNode } from "react";

// Define our custom button variants
type ButtonVariant =
  | "primary"
  | "default"
  | "dashed"
  | "text"
  | "link"
  | "ghost";

// Props for our custom Button component
type ButtonProps = {
  children?: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: "small" | "middle" | "large";
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
  htmlType?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLElement>;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  danger?: boolean;
  // Add other common button props as needed
};

// Helper to get the appropriate Ant Design button props
const getAntdButtonProps = (variant: ButtonVariant = "default") => {
  if (variant === "ghost") {
    return { type: "default" as const, ghost: true };
  }

  // Ensure we're only returning valid Ant Design button types
  switch (variant) {
    case "primary":
    case "dashed":
    case "text":
    case "link":
      return { type: variant, ghost: false };
    case "default":
    default:
      return { type: "default" as const, ghost: false };
  }
};

const Button = ({
  children,
  variant = "primary",
  size = "middle",
  fullWidth = false,
  block = false,
  style,
  className = "",
  htmlType = "button",
  danger = false,
  loading = false,
  disabled = false,
  icon,
  ...rest
}: ButtonProps) => {
  const { type, ghost } = getAntdButtonProps(variant);

  const buttonStyle = {
    ...(fullWidth || block ? { width: "100%" } : {}),
    ...style,
  };

  const buttonClasses = [className, fullWidth ? "w-full" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <AntdButton
      type={type}
      size={size}
      style={buttonStyle}
      block={block}
      className={buttonClasses}
      htmlType={htmlType}
      ghost={ghost}
      danger={danger}
      loading={loading}
      disabled={disabled}
      icon={icon}
      {...rest}
    >
      {children}
    </AntdButton>
  );
};

export default Button;
