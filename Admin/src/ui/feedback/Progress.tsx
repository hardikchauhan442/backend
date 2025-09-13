import React from 'react';
import { Progress as AntdProgress } from 'antd';
import type { ProgressProps as AntdProgressProps } from 'antd';

// Define the Progress component type with static properties
type ProgressComponent = React.FC<ProgressProps> & {
  Line: typeof AntdProgress;
  Circle: typeof AntdProgress;
};

export type ProgressType = 'line' | 'circle' | 'dashboard' | 'progress';
export type ProgressStatus = 'success' | 'exception' | 'normal' | 'active';

export interface ProgressProps extends Omit<AntdProgressProps, 'type' | 'status'> {
  type?: ProgressType;
  percent: number;
  showInfo?: boolean;
  status?: ProgressStatus;
  strokeColor?: string | { from: string; to: string; direction?: string };
  trailColor?: string;
  strokeWidth?: number;
  width?: number;
  format?: (percent?: number, successPercent?: number) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  gapDegree?: number;
  gapPosition?: 'top' | 'bottom' | 'left' | 'right';
  steps?: number;
  strokeLinecap?: 'butt' | 'square' | 'round';
  success?: { percent: number; strokeColor: string };
  size?: 'default' | 'small';
}

// Create the base Progress component
const BaseProgress: React.FC<ProgressProps> = ({
  type = 'line',
  percent = 0,
  showInfo = true,
  status,
  strokeColor,
  trailColor,
  strokeWidth = 6,
  width = 132,
  format,
  className = '',
  style,
  gapDegree = 0,
  gapPosition = 'top',
  steps,
  strokeLinecap = 'round',
  success,
  size = 'default',
  ...rest
}) => {
  const renderProgress = () => {
    const commonProps = {
      percent,
      showInfo,
      status,
      strokeColor,
      trailColor,
      format,
      className,
      style,
      strokeLinecap,
      success,
      size,
      ...rest,
    };

    switch (type) {
      case 'circle':
      case 'dashboard':
        return (
          <AntdProgress
            type={type}
            width={width}
            gapDegree={gapDegree}
            gapPosition={gapPosition}
            strokeWidth={strokeWidth}
            {...commonProps}
          />
        );
      case 'line':
      default:
        // For line type, use size prop instead of strokeWidth
        return <AntdProgress 
          type="line" 
          steps={steps} 
          {...(size === 'small' ? { size: 'small' } : {})} 
          {...commonProps} 
        />;
    }
  };

  return renderProgress();
};

// Create the final Progress component with static methods
const Progress = BaseProgress as ProgressComponent;

// Attach static methods
Progress.Line = AntdProgress;
Progress.Circle = AntdProgress;

export default Progress;
