import { Table as AntdTable, TableProps, Space, Button, Input, Typography } from 'antd';
import { ReactNode, useState, useCallback } from 'react';
import { SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import React from 'react';

const { Search } = Input;
const { Text } = Typography;

type TDataTableProps<T> = TableProps<T> & {
  /** Table title */
  title?: string | ReactNode;
  
  /** Enable search functionality */
  searchable?: boolean;
  
  /** Search input placeholder */
  searchPlaceholder?: string;
  
  /** Callback when search is performed */
  onSearch?: (value: string) => void;
  
  /** Table loading state */
  loading?: boolean;
  
  /** Additional actions or components to render in the header */
  extra?: ReactNode;
  
  /** Callback when refresh button is clicked */
  onRefresh?: () => void;
  
  /** Show filters button */
  showFilters?: boolean;
  
  /** Callback when filters button is clicked */
  onFilterClick?: () => void;
};

const DataTable = <T extends Record<string, any>>({
  title,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  loading = false,
  extra,
  onRefresh,
  showFilters = false,
  onFilterClick,
  pagination = { pageSize: 10 },
  ...props
}: TDataTableProps<T>) => {
  const [searchText, setSearchText] = useState('');
  
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    onSearch?.(value);
  }, [onSearch]);
  
  const handleClearSearch = useCallback(() => {
    setSearchText('');
    onSearch?.('');
  }, [onSearch]);
  return (
    <div className="space-y-4">
      {/* Header with title, search, and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {title && (
          <div className="text-lg font-semibold">
            {typeof title === 'string' ? <h2>{title}</h2> : title}
          </div>
        )}
        
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          {searchable && (
            <Search
              placeholder={searchPlaceholder}
              allowClear
              enterButton
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              className="w-full sm:w-64"
              loading={loading}
            />
          )}
          
          <div className="flex items-center gap-2">
            {/* Filters Button */}
            {showFilters && (
              <Button
                icon={<FilterOutlined />}
                onClick={onFilterClick}
                className="flex items-center"
              >
                Filters
              </Button>
            )}
            
            {/* Refresh Button */}
            {onRefresh && (
              <Button
                icon={<ReloadOutlined spin={loading} />}
                onClick={onRefresh}
                loading={loading}
                className="flex items-center"
                title="Refresh data"
              />
            )}
            
            {/* Extra Actions */}
            {extra}
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <AntdTable<T>
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
            ...(typeof pagination === 'object' ? pagination : {})
          }}
          scroll={{ x: 'max-content' }}
          {...props}
        />
      </div>
      
      {/* Search Status */}
      {searchText && (
        <div className="text-right">
          <Text type="secondary">
            Showing results for: <Text strong>"{searchText}"</Text>
            <Button 
              type="link" 
              size="small" 
              onClick={handleClearSearch}
              className="ml-2"
            >
              Clear search
            </Button>
          </Text>
        </div>
      )}
    </div>
  );
};

export default DataTable;
