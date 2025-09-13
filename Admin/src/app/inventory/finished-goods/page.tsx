"use client";

import {
  apiGetProductionCounts,
  apiGetProductionTrackers,
} from "@/services/ProjectService";
import { Card } from "@/ui";
import { Table } from "@/ui/data-display";
import { Drawer } from "@/ui/overlay";
import { formatDate } from "@/utils/formatDate";
import { Status } from "@/utils/status";
import {
  CheckCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  DatePicker,
  Descriptions,
  Divider,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useCallback, useEffect, useState } from "react";

const { useApp } = App;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const priorityColors = {
  High: "red",
  Medium: "orange",
  Low: "green",
};

interface FilterState {
  priorities: string[];
  assignees: string[];
  dateRange: [string, string] | null;
}

interface FinishedGood {
  job_code: any;
  id: string;
  job_id: string;
  jobId: string;
  product: string;
  productId: string;
  quantity: number;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  assignedTo: string;
  manufacturerName: string;
  progress: number;
  currentStage: string;
  completedDate?: string;
  materials?: any[];
  stages?: any[];
  jobData?: any;
  wastageMaterials?: any[];
}

interface FinishedGoodsCounts {
  total: number;
}

export default function FinishedGoodsPage() {
  const [finishedGoods, setFinishedGoods] = useState<FinishedGood[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGood, setSelectedGood] = useState<FinishedGood | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Add state for counts
  const [counts, setCounts] = useState<FinishedGoodsCounts>({
    total: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);

  const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    priorities: [],
    assignees: [],
    dateRange: null,
  });

  const { message } = useApp();

  // Function to fetch counts for completed items only
  const fetchFinishedGoodsCounts = useCallback(async () => {
    try {
      setCountsLoading(true);

      const apiParams: Record<string, unknown> = {
        status: Status.Completed, // Only get completed items
      };

      // Apply the same filters to counts as to the main data
      if (searchText) {
        apiParams.search = searchText;
      }

      if (filters.priorities.length > 0) {
        apiParams.priorities = filters.priorities.join(",");
      }
      if (filters.assignees.length > 0) {
        apiParams.assignees = filters.assignees.join(",");
      }
      if (filters.dateRange) {
        apiParams.startDate = filters.dateRange[0];
        apiParams.endDate = filters.dateRange[1];
      }

      const response: any = await apiGetProductionCounts<{
        data: {
          statusCounts: any;
          total: number;
        };
        success: boolean;
        message?: string;
      }>(apiParams);

      if (response.data.data) {
        setCounts({
          total: response.data.data.statusCounts?.[Status.Completed] || 0,
        });
      } else {
        message.error(
          response.message || "Failed to fetch finished goods counts"
        );
        setCounts({ total: 0 });
      }
    } catch (error) {
      console.error("Error fetching finished goods counts:", error);
      message.error("Failed to load finished goods counts.");
      setCounts({ total: 0 });
    } finally {
      setCountsLoading(false);
    }
  }, [searchText, filters, message]);

  const fetchFinishedGoodsData = useCallback(async () => {
    try {
      setLoading(true);

      const apiParams: Record<string, unknown> = {
        status: Status.Completed, // Only fetch completed items
      };

      if (searchText) {
        apiParams.search = searchText;
      }

      if (filters.priorities.length > 0) {
        apiParams.priorities = filters.priorities.join(",");
      }
      if (filters.assignees.length > 0) {
        apiParams.assignees = filters.assignees.join(",");
      }
      if (filters.dateRange) {
        apiParams.startDate = filters.dateRange[0];
        apiParams.endDate = filters.dateRange[1];
      }

      const response: any = await apiGetProductionTrackers<{
        data: {
          data: FinishedGood[];
        };
        success: boolean;
        message?: string;
      }>(apiParams);

      if (response.data.data) {
        setFinishedGoods(response.data.data);
      } else {
        message.error(
          response.message || "Failed to fetch finished goods data"
        );
        setFinishedGoods([]);
      }
    } catch (error) {
      console.error("Error fetching finished goods data:", error);
      message.error("Failed to load finished goods data. Please try again.");
      setFinishedGoods([]);
    } finally {
      setLoading(false);
    }
  }, [searchText, filters, message]);

  // Function to fetch both data and counts
  const fetchAllData = useCallback(async () => {
    await Promise.all([fetchFinishedGoodsData(), fetchFinishedGoodsCounts()]);
  }, [fetchFinishedGoodsData, fetchFinishedGoodsCounts]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText !== "") {
        fetchAllData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  // Filter data based on current filters (client-side filtering as backup)
  const filteredData = finishedGoods.filter((good) => {
    const matchesSearch =
      !searchText ||
      good.id.toLowerCase().includes(searchText.toLowerCase()) ||
      good.product.toLowerCase().includes(searchText.toLowerCase()) ||
      good.assignedTo.toLowerCase().includes(searchText.toLowerCase()) ||
      good.manufacturerName.toLowerCase().includes(searchText.toLowerCase());

    return matchesSearch;
  });

  const handleViewDetails = (record: FinishedGood) => {
    setSelectedGood(record);
    setIsDetailModalVisible(true);
  };

  const handleExport = (record: FinishedGood) => {
    // TODO: Implement export functionality
    message.info(`Exporting details for ${record.jobData?.job_code}`);
  };

  const handleOpenFilters = () => {
    setIsFilterDrawerVisible(true);
  };

  const clearFilters = () => {
    setFilters({
      priorities: [],
      assignees: [],
      dateRange: null,
    });
  };

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Apply filters and close drawer
  const applyFilters = () => {
    setIsFilterDrawerVisible(false);
    fetchAllData();
  };

  // Update refresh function to fetch both data and counts
  const handleRefresh = () => {
    fetchAllData();
  };

  // Table columns
  const columns = [
    {
      title: "Job ID",
      key: "id",
      render: (record: FinishedGood) => (
        <span className="font-medium">{record.jobData?.job_code}</span>
      ),
    },
    {
      title: "Product",
      key: "product",
      render: (record: FinishedGood) => (
        <div>{record?.jobData?.product_name}</div>
      ),
    },
    {
      title: "Manufacturer Name",
      key: "manufacturer",
      render: (record: FinishedGood) => (
        <div>{record?.jobData?.manufacturer?.manufacturerName}</div>
      ),
    },
    {
      title: "Quantity",
      key: "quantity",
      render: (record: FinishedGood) => (
        <span>{record?.jobData?.quantity || record.quantity}</span>
      ),
    },
    {
      title: "Priority",
      key: "priority",
      render: (record: FinishedGood) => (
        <Tag
          color={
            priorityColors[
              record.jobData?.priority as keyof typeof priorityColors
            ]
          }
        >
          {record.jobData?.priority}
        </Tag>
      ),
    },
    {
      title: "Completed Date",
      key: "completedDate",
      render: (record: FinishedGood) => (
        <div>
          {record.completedDate
            ? formatDate(record.completedDate)
            : formatDate(
                record.jobData?.updated_at || record.jobData?.due_date
              )}
        </div>
      ),
      sorter: (a: FinishedGood, b: FinishedGood) => {
        const dateA =
          a.completedDate || a.jobData?.updated_at || a.jobData?.due_date;
        const dateB =
          b.completedDate || b.jobData?.updated_at || b.jobData?.due_date;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: () => (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Completed
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: FinishedGood) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View Details
          </Button>
          <Button
            type="default"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleExport(record)}
          >
            Export
          </Button>
        </Space>
      ),
      width: 200,
      fixed: "right",
    },
  ];

  return (
    <div className="">
      <div className="flex justify-between items-center mb-2">
        <Title level={4} className="mb-0">
          Finished Goods
        </Title>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {countsLoading ? (
              <span>
                <Spin size="small" style={{ marginRight: 8 }} />
                Total: -
              </span>
            ) : (
              `Total: ${counts.total}`
            )}
          </span>
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            loading={loading || countsLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Search
              placeholder="Search by job ID, product, assignee, or manufacturer..."
              allowClear
              enterButton={
                <Button type="primary">
                  <SearchOutlined />
                </Button>
              }
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full"
            />
          </div>
          <Button icon={<FilterOutlined />} onClick={handleOpenFilters}>
            Filters
            {(filters.priorities.length + filters.assignees.length > 0 ||
              filters.dateRange) && (
              <span className="ml-1 bg-red-500 text-white rounded-full w-2 h-2 inline-block"></span>
            )}
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns as []}
            dataSource={filteredData}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            scroll={{ x: 1500 }}
            className="mt-4"
          />
        </Spin>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Finished Good Details - ${selectedGood?.jobData?.product_name}`}
        width={800}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedGood(null);
        }}
        open={isDetailModalVisible}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsDetailModalVisible(false);
              setSelectedGood(null);
            }}
          >
            Close
          </Button>,
          <Button
            key="export"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => selectedGood && handleExport(selectedGood)}
          >
            Export Details
          </Button>,
        ]}
      >
        {selectedGood && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="font-medium mb-3 text-lg">Basic Information</h4>
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Job Code">
                  {selectedGood.jobData?.job_code}
                </Descriptions.Item>
                <Descriptions.Item label="Product Name">
                  {selectedGood.jobData?.product_name}
                </Descriptions.Item>
                <Descriptions.Item label="Manufacturer">
                  {selectedGood.jobData?.manufacturer?.manufacturerName}
                </Descriptions.Item>
                <Descriptions.Item label="Quantity">
                  {selectedGood.jobData?.quantity || selectedGood.quantity}
                </Descriptions.Item>
                <Descriptions.Item label="Priority">
                  <Tag
                    color={
                      priorityColors[
                        selectedGood.jobData
                          ?.priority as keyof typeof priorityColors
                      ]
                    }
                  >
                    {selectedGood.jobData?.priority}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    Completed
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  {formatDate(selectedGood.jobData?.start_date)}
                </Descriptions.Item>
                <Descriptions.Item label="Due Date">
                  {formatDate(selectedGood.jobData?.due_date)}
                </Descriptions.Item>
                <Descriptions.Item label="Completed Date">
                  {formatDate(
                    selectedGood.completedDate ||
                      selectedGood.jobData?.updated_at ||
                      selectedGood.jobData?.due_date
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Materials Used */}
            {selectedGood.materials && selectedGood.materials.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-lg">Materials Used</h4>
                <div className="border border-gray-200 rounded-lg p-4">
                  {selectedGood.materials.map(
                    (material: any, index: number) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <span className="font-medium">{material.name}: </span>
                        <span>
                          {material.quantity} {material.unit}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Wastage Materials */}
            {selectedGood.wastageMaterials &&
              selectedGood.wastageMaterials.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-lg">
                    Wastage Materials
                  </h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    {selectedGood.wastageMaterials.map(
                      (wastage: any, index: number) => (
                        <div key={index} className="mb-2 last:mb-0">
                          <span className="font-medium">
                            {wastage.material_type}:{" "}
                          </span>
                          <span>
                            {wastage.weight
                              ? `${wastage.weight} gm`
                              : `${wastage.quantity} pcs`}
                          </span>
                          {wastage.notes && (
                            <span className="text-gray-500 ml-2">
                              ({wastage.notes})
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Production Stages */}
            {selectedGood.stages && selectedGood.stages.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-lg">Production Stages</h4>
                <div className="border border-gray-200 rounded-lg p-4">
                  {selectedGood.stages.map((stage: any, index: number) => (
                    <div
                      key={index}
                      className="mb-2 last:mb-0 flex justify-between"
                    >
                      <span className="font-medium">{stage.name}</span>
                      <Tag color="success">
                        <CheckCircleOutlined /> Completed
                      </Tag>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Filter Drawer */}
      <Drawer
        title="Filters"
        width={400}
        onClose={() => setIsFilterDrawerVisible(false)}
        open={isFilterDrawerVisible}
        footer={
          <div className="flex justify-between">
            <Button onClick={clearFilters}>Clear All</Button>
            <div className="flex gap-2">
              <Button onClick={() => setIsFilterDrawerVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <Select
              mode="multiple"
              placeholder="Select priority"
              value={filters.priorities}
              onChange={(value) =>
                setFilters({ ...filters, priorities: value })
              }
              style={{ width: "100%" }}
            >
              {Object.keys(priorityColors).map((priority) => (
                <Option key={priority} value={priority}>
                  <Tag
                    color={
                      priorityColors[priority as keyof typeof priorityColors]
                    }
                  >
                    {priority}
                  </Tag>
                </Option>
              ))}
            </Select>
          </div>

          <Divider />

          <div>
            <label className="block text-sm font-medium mb-2">
              Completion Date Range
            </label>
            <RangePicker
              style={{ width: "100%" }}
              onChange={(dates, dateStrings) =>
                setFilters({
                  ...filters,
                  dateRange:
                    dateStrings[0] && dateStrings[1]
                      ? [dateStrings[0], dateStrings[1]]
                      : null,
                })
              }
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
}
