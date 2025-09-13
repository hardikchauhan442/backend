import { Input, InputProps } from 'antd';
import React from 'react';

interface SearchProps extends Omit<InputProps, 'onSearch'> {
  onSearch?: (value: string) => void;
  enterButton?: React.ReactNode;
}

export const Search: React.FC<SearchProps> = ({
  onSearch,
  ...rest
}) => {
  const handleSearch = (value: string) => {
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <Input.Search
      onSearch={handleSearch}
      {...rest}
    />
  );
};

export default Search;
