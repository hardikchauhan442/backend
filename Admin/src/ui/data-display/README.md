# DataTable Component

The `DataTable` component is a powerful and customizable data grid built on top of Ant Design's Table component. It provides additional features like built-in search, filtering, and action buttons while maintaining full compatibility with Ant Design's Table API.

## Features

- 🎯 Built-in search functionality
- 🔄 Refresh button with loading state
- 🎛️ Filter controls
- 📱 Responsive design
- 📊 Pagination with customizable options
- 🎨 Customizable header and actions
- 🔍 Search status with clear option
- 🛠️ Full TypeScript support

## Installation

```bash
import { DataTable } from '@/ui/data-display/DataTable';
```

## Basic Usage

```tsx
import { DataTable } from '@/ui/data-display/DataTable';

const dataSource = [
  { id: 1, name: 'John Doe', age: 32, address: 'New York' },
  { id: 2, name: 'Jane Smith', age: 28, address: 'San Francisco' },
];

const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Age', dataIndex: 'age', key: 'age' },
  { title: 'Address', dataIndex: 'address', key: 'address' },
];

const MyComponent = () => (
  <DataTable 
    dataSource={dataSource} 
    columns={columns} 
    rowKey="id"
  />
);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string \| ReactNode` | - | Table title displayed in the header |
| `searchable` | `boolean` | `false` | Enable search functionality |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder text for the search input |
| `onSearch` | `(value: string) => void` | - | Callback when search is performed |
| `loading` | `boolean` | `false` | Loading state of the table |
| `extra` | `ReactNode` | - | Additional components to render in the header |
| `onRefresh` | `() => void` | - | Callback when refresh button is clicked |
| `showFilters` | `boolean` | `false` | Show filters button |
| `onFilterClick` | `() => void` | - | Callback when filters button is clicked |
| `pagination` | `boolean \| TablePaginationConfig` | `{ pageSize: 10 }` | Pagination configuration |
| All other Ant Design Table props | - | - | All other props are passed through to the underlying Ant Design Table |

## Advanced Usage

### With Search and Refresh

```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

const handleSearch = (value) => {
  // Implement search logic
  console.log('Searching for:', value);
};

const handleRefresh = () => {
  setLoading(true);
  // Fetch data
  fetchData().then(() => setLoading(false));
};

return (
  <DataTable
    title="Users"
    dataSource={data}
    columns={columns}
    searchable
    onSearch={handleSearch}
    loading={loading}
    onRefresh={handleRefresh}
    rowKey="id"
  />
);
```

### With Custom Actions

```tsx
const handleAddUser = () => {
  // Handle add user
};

return (
  <DataTable
    title="Users"
    dataSource={data}
    columns={columns}
    extra={
      <Button type="primary" onClick={handleAddUser}>
        Add User
      </Button>
    }
    rowKey="id"
  />
);
```

## Styling

The component uses Tailwind CSS for styling. You can customize the appearance by:

1. Adding custom classes to the wrapper div
2. Using the `className` prop to style the table
3. Overriding Ant Design's default styles with CSS-in-JS or global styles

## Accessibility

The component includes proper ARIA attributes and keyboard navigation:
- Search input is properly labeled
- Buttons have appropriate ARIA labels
- Table includes proper row and column headers
- Pagination controls are keyboard accessible

## Performance Tips

1. Use `rowKey` prop for efficient row updates
2. For large datasets, implement server-side pagination and filtering
3. Use `shouldUpdate` or `useMemo` to prevent unnecessary re-renders
4. Consider using `virtual` prop for very large datasets (requires additional configuration)

## Troubleshooting

### Search not working
- Make sure `searchable` prop is set to `true`
- Ensure `onSearch` callback is properly implemented
- Check browser console for any errors

### Table not updating
- Verify that the `dataSource` prop is updating correctly
- Ensure `rowKey` is set to a unique identifier
- Check for any error messages in the console

## Browser Support

The component supports all modern browsers and IE11 (with polyfills).
