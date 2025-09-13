import { Row as AntdRow, Col as AntdCol, Space as AntdSpace } from 'antd';
import { RowProps, ColProps, SpaceProps } from 'antd';

export const Row: React.FC<RowProps> = (props) => {
  return <AntdRow gutter={[16, 16]} {...props} />;
};

export const Col: React.FC<ColProps> = (props) => {
  return <AntdCol {...props} />;
};

export const Space: React.FC<SpaceProps> = (props) => {
  return <AntdSpace {...props} />;
};

export default { Row, Col, Space };
