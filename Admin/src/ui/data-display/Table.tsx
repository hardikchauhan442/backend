import { Table as AntdTable } from "antd";
import type {
  TableProps as AntdTableProps,
  ColumnGroupType,
  ColumnType,
  TablePaginationConfig,
} from "antd/es/table";
import type {
  FilterValue,
  SorterResult,
  TableRowSelection,
} from "antd/es/table/interface";
import React, { useCallback, useMemo } from "react";

export type { ColumnGroupType, ColumnType };

export type TablePaginationPosition =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight";

// Fixed interface - remove the conflicting showTotal override
export interface TablePaginationConfigEx
  extends Omit<TablePaginationConfig, "position"> {
  position?: TablePaginationPosition[];
  // Don't override showTotal - keep it as the original type
}

export interface TableProps<T>
  extends Omit<AntdTableProps<T>, "onChange" | "pagination"> {
  columns: (ColumnGroupType<T> | ColumnType<T>)[];
  dataSource: readonly T[];
  rowKey?: string | ((record: T) => string | number);
  loading?: boolean | { delay?: number };
  pagination?: false | TablePaginationConfigEx;
  scroll?: { x?: number | string | true; y?: number | string };
  size?: "large" | "middle" | "small";
  bordered?: boolean;
  showHeader?: boolean;
  title?: (currentPageData: readonly T[]) => React.ReactNode;
  footer?: (currentPageData: readonly T[]) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  rowClassName?: string | ((record: T, index: number) => string);
  onRow?: (record: T, index?: number) => React.HTMLAttributes<HTMLElement>;
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[],
    extra: { currentDataSource: T[]; action: "paginate" | "sort" | "filter" }
  ) => void;
  rowSelection?: TableRowSelection<T>;
  showSorterTooltip?: boolean | { title?: string };
  virtual?: boolean;
  components?: any;
  sortDirections?: ("ascend" | "descend")[];
  expandable?: any;
  sticky?:
    | boolean
    | {
        offsetHeader?: number;
        offsetScroll?: number;
        getContainer?: () => HTMLElement;
      };
  summary?: (data: readonly T[]) => React.ReactNode;
}

// Optimized safe data accessor using memoization
const createSafeAccessor = () => {
  const cache = new Map<string, string[]>();

  return (obj: any, path: string, defaultValue: any = "") => {
    if (!obj || typeof obj !== "object") return defaultValue;

    let keys = cache.get(path);
    if (!keys) {
      keys = path.split(".");
      cache.set(path, keys);
    }

    let result = obj;
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined || result === null) return defaultValue;
    }
    return result ?? defaultValue;
  };
};

const safeGet = createSafeAccessor();

// Fixed default pagination function with proper return type
const getDefaultPagination = (total?: number): TablePaginationConfigEx => ({
  position: ["bottomRight"],
  defaultPageSize: 20,
  defaultCurrent: 1,
  showSizeChanger: true,
  showQuickJumper: true,
  size: "default",
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} of ${total} items`,
  pageSizeOptions: ["10", "20", "50", "100"],
  ...(total && { total }),
});

// Memoized column processor
const useProcessedColumns = <T,>(columns: any[]) => {
  return useMemo(() => {
    if (!Array.isArray(columns)) return [];

    return columns
      .map((column) => {
        if (!column || typeof column !== "object") return null;

        const processedColumn = { ...column };

        // Handle column with render function
        if (typeof column.render === "function") {
          const originalRender = column.render;
          processedColumn.render = (text: any, record: T, index: number) => {
            try {
              return originalRender(text, record, index);
            } catch (error) {
              console.error("Error in column render:", error);
              return text ?? "";
            }
          };
        }

        // Handle column with sorter
        if (typeof column.sorter === "function") {
          const originalSorter = column.sorter;
          processedColumn.sorter = (a: T, b: T) => {
            try {
              return originalSorter(a, b);
            } catch (error) {
              console.error("Error in column sorter:", error);
              return 0;
            }
          };
        }

        return processedColumn;
      })
      .filter(Boolean);
  }, [columns]);
};

function Table<T extends Record<string, any> = any>({
  columns = [],
  dataSource = [],
  rowKey = "id",
  loading = false,
  pagination = getDefaultPagination(), // Fixed: use proper default
  scroll,
  size = "middle",
  bordered = false,
  showHeader = true,
  title,
  footer,
  className = "",
  style,
  rowClassName,
  onRow,
  onChange,
  rowSelection,
  showSorterTooltip = true,
  virtual = false,
  components,
  sortDirections = ["ascend", "descend"],
  expandable,
  sticky = false,
  summary,
  ...rest
}: TableProps<T>) {
  // Memoize safe data source
  const safeDataSource = useMemo(() => {
    if (!Array.isArray(dataSource)) return [];
    return dataSource.filter((item) => item && typeof item === "object");
  }, [dataSource]);

  // Process columns with memoization
  const processedColumns = useProcessedColumns<T>(columns);

  // Memoized change handler
  const handleChange = useCallback(
    (
      paginationConfig: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<T> | SorterResult<T>[],
      extra: { currentDataSource: T[]; action: "paginate" | "sort" | "filter" }
    ) => {
      onChange?.(paginationConfig, filters, sorter, extra);
    },
    [onChange]
  );

  // Fixed pagination processing
  const processedPagination = useMemo(() => {
    if (pagination === false) return false;

    // Properly handle the pagination object
    const config: TablePaginationConfig =
      typeof pagination === "object"
        ? { ...getDefaultPagination(), ...pagination }
        : getDefaultPagination();

    // Handle position array validation and convert back to antd format
    if ("position" in config && config.position) {
      const validPositions: TablePaginationPosition[] = [
        "topLeft",
        "topCenter",
        "topRight",
        "bottomLeft",
        "bottomCenter",
        "bottomRight",
      ];

      const positions = Array.isArray(config.position)
        ? config.position.filter((pos): pos is TablePaginationPosition =>
            validPositions.includes(pos as TablePaginationPosition)
          )
        : validPositions.includes(config.position as TablePaginationPosition)
        ? [config.position as TablePaginationPosition]
        : ["bottomRight"];

      // Convert to antd's expected format (remove our custom position property)
      const { position, ...restConfig } = config;
      return {
        ...restConfig,
        // Set position in antd's expected format if needed
        ...(positions.length > 0 && { position: positions as any }),
      } as TablePaginationConfig;
    }

    // Remove our custom position property to match antd's interface
    const { position, ...restConfig } = config;
    return restConfig as TablePaginationConfig;
  }, [pagination]);

  // Error boundary for the table
  try {
    return (
      <AntdTable<T>
        columns={processedColumns}
        dataSource={safeDataSource}
        rowKey={rowKey}
        loading={loading}
        pagination={processedPagination}
        scroll={scroll}
        size={size}
        bordered={bordered}
        showHeader={showHeader}
        title={title}
        footer={footer}
        className={className}
        style={style}
        rowClassName={rowClassName}
        onRow={onRow}
        onChange={handleChange}
        rowSelection={rowSelection}
        showSorterTooltip={showSorterTooltip}
        virtual={virtual}
        components={components}
        sortDirections={sortDirections}
        expandable={expandable}
        sticky={sticky}
        summary={summary}
        {...rest}
      />
    );
  } catch (error) {
    console.error("Error rendering Table:", error);
    return (
      <div className="p-4 text-red-500 border border-red-200 rounded-md bg-red-50">
        <h4 className="font-medium mb-2">Table Error</h4>
        <p className="text-sm">
          Unable to render table. Please check the console for details.
        </p>
      </div>
    );
  }
}

// Static methods and constants
Table.SELECTION_ALL = "SELECT_ALL" as const;
Table.SELECTION_INVERT = "SELECT_INVERT" as const;
Table.SELECTION_NONE = "SELECT_NONE" as const;
Table.EXPAND_COLUMN = {} as const;
Table.INTERNAL_COL_DEFINE = "TABLE_INTERNAL_COL_DEFINE" as const;

export default Table;
