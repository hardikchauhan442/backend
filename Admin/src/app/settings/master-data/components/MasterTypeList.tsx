"use client";

import { appConfig } from "@/config/app.config";
import {
  apiCreateMaster,
  apiDeleteMaster,
  apiGetMasters,
  apiUpdateMaster,
  apiUpdateSequenceMaster,
} from "@/services/ProjectService";
import { Card } from "@/ui";
import { Table } from "@/ui/data-display";
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
  MoreOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { UploadProps } from "antd";
import {
  Button,
  Checkbox,
  Col,
  Drawer,
  Dropdown,
  Form,
  Input,
  MenuProps,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Upload,
} from "antd";
import { isArray } from "chart.js/helpers";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const { Search } = Input;
const { Option } = Select;

interface Master {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  parentCode?: string;
  likeKeyword?: string;
  imageUrl?: string;
  isDefault?: boolean;
  isDisplay?: boolean;
  sequence?: number;
  groupName?: string;
  subMasters?: Submaster[];
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

interface Submaster {
  id: string;
  name: string;
  code: string;
  sequence?: number;
  isActive: boolean;
  isDisplay?: boolean;
  isDefault?: boolean;
  description?: string;
  parentId: string;
  parentCode?: string;
  imageUrl?: string;
  likeKeyword?: string;
  groupName?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

// Draggable Row Component
const DraggableRow = ({ children, ...props }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props["data-row-key"],
  });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "move",
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if (child.key === "dragHandle") {
          return React.cloneElement(child, {
            children: (
              <div
                {...listeners}
                style={{ cursor: "grab", padding: "4px" }}
                className="flex justify-center"
              >
                <HolderOutlined />
              </div>
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

const MasterDataManagement = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [masters, setMasters] = useState<Master[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isMasterMode, setIsMasterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<"master" | "submaster">(
    "master"
  );
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [form] = Form.useForm();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Function to generate code from name
  const generateCodeFromName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, "") // Replace spaces with underscores
      .replace(/_{2,}/g, "") // Replace multiple underscores with single
      .replace(/^_|_$/g, "")
      .toUpperCase(); // Remove leading/trailing underscores
  };

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const currentData: any = isMasterMode
      ? masters
      : selectedMaster?.subMasters || [];
    const oldIndex = currentData.findIndex(
      (item: any) => item.id === active.id
    );
    const newIndex = currentData.findIndex((item: any) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newData = arrayMove(currentData, oldIndex, newIndex);

    // Update sequences
    const updatedData = newData.map((item: any, index: number) => ({
      ...item,
      sequence: index + 1,
    }));

    try {
      setTableLoading(true);

      // Update UI optimistically first
      if (isMasterMode) {
        setMasters(updatedData);
      } else if (selectedMaster) {
        const updatedMaster = {
          ...selectedMaster,
          subMasters: updatedData,
        };
        setSelectedMaster(updatedMaster);

        const updatedMasters = masters.map((master) =>
          master.id === selectedMaster.id ? updatedMaster : master
        );
        setMasters(updatedMasters);
      }

      // Prepare payload for bulk sequence update API
      const sequenceUpdatePayload = updatedData.map(
        (item: any, index: number) => ({
          id: item.id,
          sequence: index + 1,
        })
      );

      // Call single API to update all sequences
      await apiUpdateSequenceMaster({
        items: sequenceUpdatePayload,
      });

      messageApi.success("Sequence updated successfully");
    } catch (error) {
      console.error("Error updating sequences:", error);
      messageApi.error("Failed to update sequence");
      // Revert changes on error
      fetchMasters();
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchMasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (masters.length > 0 && !selectedMaster) {
      setSelectedMaster(masters[0]);
    }
  }, [masters, selectedMaster]);

  const fetchMasters = async () => {
    try {
      setLoading(true);
      const response: any = await apiGetMasters<{ data: Master[] }>();

      if (response && response.data) {
        const mastersData = response.data.data || response.data;
        // Sort by sequence
        const sortedMasters = mastersData
          .map((master: Master) => ({
            ...master,
            subMasters:
              master.subMasters?.sort(
                (a, b) => (a.sequence || 0) - (b.sequence || 0)
              ) || [],
          }))
          .sort(
            (a: Master, b: Master) => (a.sequence || 0) - (b.sequence || 0)
          );

        setMasters(sortedMasters);

        if (selectedMaster) {
          const updatedSelectedMaster = sortedMasters.find(
            (master: Master) => master.id === selectedMaster.id
          );
          if (updatedSelectedMaster) {
            setSelectedMaster(updatedSelectedMaster);
          } else {
            setSelectedMaster(
              sortedMasters.length > 0 ? sortedMasters[0] : null
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching masters:", error);
      messageApi.error("Failed to fetch masters");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      setUploadLoading(true);

      const formData = new FormData();
      formData.append("file", file as File);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        form.setFieldsValue({ imageUrl: data.imageUrl });
        onSuccess?.(data, file as File);
        messageApi.success("Image uploaded successfully");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      onError?.(error as Error);
      messageApi.error("Image upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleMasterSelect = (master: Master) => {
    setSelectedMaster(master);
  };

  const handleAddMaster = () => {
    setDrawerType("master");
    setEditMode(false);
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      isDefault: false,
      isDisplay: true,
      likeKeyword: "",
    });
    setDrawerVisible(true);
  };

  const handleAddSubMaster = () => {
    setDrawerType("submaster");
    setEditMode(false);
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      isDisplay: true,
      isDefault: false,
      parentId: selectedMaster?.id,
      parentCode: selectedMaster?.code,
      likeKeyword: "",
    });
    setDrawerVisible(true);
  };

  const handleEdit = (record: any, type?: "master" | "submaster") => {
    const actualType = type || (isMasterMode ? "master" : "submaster");

    setDrawerType(actualType);
    setEditingItem(record);
    setEditMode(true);

    const formData = {
      ...record,
      likeKeyword: record.likeKeyword || "",
    };

    form.setFieldsValue(formData);
    setDrawerVisible(true);
  };

  const handleDelete = (record: any) => {
    setSelectedItem(record);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);

      await apiDeleteMaster(selectedItem.id);

      if (drawerType === "master" || isMasterMode) {
        const updatedMasters = masters.filter(
          (master) => master.id !== selectedItem.id
        );
        setMasters(updatedMasters);

        if (selectedMaster?.id === selectedItem.id) {
          setSelectedMaster(
            updatedMasters.length > 0 ? updatedMasters[0] : null
          );
        }
      } else {
        if (selectedMaster) {
          const updatedSubMasters =
            selectedMaster.subMasters?.filter(
              (sub) => sub.id !== selectedItem.id
            ) || [];

          const updatedMaster = {
            ...selectedMaster,
            subMasters: updatedSubMasters,
          };

          setSelectedMaster(updatedMaster);

          const updatedMasters = masters.map((master) =>
            master.id === selectedMaster.id ? updatedMaster : master
          );
          setMasters(updatedMasters);
        }
      }

      messageApi.success(`${selectedItem.name} deleted successfully`);
      fetchMasters();
      setIsDeleteModalVisible(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      messageApi.error("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    form.resetFields();
    setEditingItem(null);
    setEditMode(false);
  };

  function normalizeLikeKeyword(
    likeKeyword: string | string[] | undefined | null
  ): string[] {
    if (!likeKeyword) return [];

    if (isArray(likeKeyword)) {
      return likeKeyword.map((keyword) => keyword.trim()).filter(Boolean);
    }

    if (typeof likeKeyword === "string") {
      return likeKeyword
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean);
    }

    return [];
  }

  const handleFormSubmit = async (values: any) => {
    try {
      setLoading(true);

      const likeKeywordsArray = normalizeLikeKeyword(values.likeKeyword);

      // Get next sequence number
      let nextSequence = 1;
      if (drawerType === "master") {
        nextSequence = Math.max(...masters.map((m) => m.sequence || 0)) + 1;
      } else if (selectedMaster?.subMasters) {
        nextSequence =
          Math.max(...selectedMaster.subMasters.map((s) => s.sequence || 0)) +
          1;
      }

      const payload = {
        name: values.name,
        code: values.code,
        description: values.description || "",
        isActive: values.isActive ?? true,
        likeKeyword: likeKeywordsArray,
        imageUrl: values.imageUrl || undefined,
        isDefault: values.isDefault ?? false,
        isDisplay: values.isDisplay ?? true,
        sequence: editMode ? values.sequence : nextSequence,
      };

      if (drawerType === "submaster") {
        Object.assign(payload, {
          parentId: selectedMaster?.id,
          parentCode: selectedMaster?.code,
          groupName: selectedMaster?.name,
        });
      }

      if (editMode && editingItem) {
        const response: any = await apiUpdateMaster(editingItem.id, payload);

        if (response && response.data) {
          const updatedData = response.data;

          if (drawerType === "master") {
            const updatedMasters = masters.map((master) =>
              master.id === editingItem.id
                ? { ...master, ...updatedData }
                : master
            );
            setMasters(updatedMasters);

            if (selectedMaster?.id === editingItem.id) {
              setSelectedMaster({ ...selectedMaster, ...updatedData });
            }
          } else {
            if (selectedMaster) {
              const updatedSubMasters =
                selectedMaster.subMasters?.map((sub) =>
                  sub.id === editingItem.id ? { ...sub, ...updatedData } : sub
                ) || [];

              const updatedMaster = {
                ...selectedMaster,
                subMasters: updatedSubMasters,
              };

              setSelectedMaster(updatedMaster);

              const updatedMasters = masters.map((master) =>
                master.id === selectedMaster.id ? updatedMaster : master
              );
              setMasters(updatedMasters);
            }
          }
        }
        messageApi.success(
          `${
            drawerType === "master" ? "Master" : "Submaster"
          } updated successfully`
        );
      } else {
        const response: any = await apiCreateMaster(payload);

        if (response && response.data) {
          const newData = response.data;

          if (drawerType === "master") {
            const newMaster = { ...newData, subMasters: [] };
            const updatedMasters = [...masters, newMaster];
            setMasters(updatedMasters);
            setSelectedMaster(newMaster);
          } else {
            if (selectedMaster) {
              const updatedSubMasters = [
                ...(selectedMaster.subMasters || []),
                newData,
              ];

              const updatedMaster = {
                ...selectedMaster,
                subMasters: updatedSubMasters,
              };

              setSelectedMaster(updatedMaster);

              const updatedMasters = masters.map((master) =>
                master.id === selectedMaster.id ? updatedMaster : master
              );
              setMasters(updatedMasters);
            }
          }
        }
        messageApi.success(
          `${
            drawerType === "master" ? "Master" : "Submaster"
          } created successfully`
        );
      }

      handleDrawerClose();
      fetchMasters();
    } catch (error) {
      console.error("Error saving data:", error);
      messageApi.error(
        `Failed to ${editMode ? "update" : "create"} ${drawerType}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = async (
    recordId: string,
    field: "isActive" | "isDisplay" | "isDefault",
    checked: boolean
  ) => {
    try {
      if (selectedMaster) {
        const updatedSubMasters =
          selectedMaster.subMasters?.map((sub) =>
            sub.id === recordId ? { ...sub, [field]: checked } : sub
          ) || [];

        const updatedMaster = {
          ...selectedMaster,
          subMasters: updatedSubMasters,
        };

        setSelectedMaster(updatedMaster);

        const updatedMasters = masters.map((master) =>
          master.id === selectedMaster.id ? updatedMaster : master
        );
        setMasters(updatedMasters);
      }

      await apiUpdateMaster(recordId, { [field]: checked });

      console.log(`Updated ${field} for record ${recordId}:`, checked);
    } catch (error) {
      console.error("Error updating field:", error);
      messageApi.error("Failed to update");
      fetchMasters();
    }
  };

  const getMasterMenuItems = (record: any): MenuProps["items"] => [
    {
      key: "edit",
      label: "Edit",
      icon: <EditOutlined />,
      onClick: () => handleEdit(record, "master"),
    },
    {
      key: "delete",
      label: "Delete",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record),
    },
  ];

  const primaryColor = appConfig.theme.primaryColor;
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const submasterColumns: any = [
    {
      title: "",
      key: "dragHandle",
      width: 40,
      render: () => null, // Content will be handled by DraggableRow
    },
    {
      title: "Sr No",
      dataIndex: "sequence",
      key: "sequence",
      width: 80,
      render: (sequence: number, _: any, index: number) =>
        sequence || index + 1,
      sorter: (a: any, b: any) => (a.sequence || 0) - (b.sequence || 0),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: "Image",
      key: "image",
      width: 80,
      render: (record: any) => (
        <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
          {record.imageUrl ? (
            <Image
              src={record.imageUrl}
              alt={record.name}
              width={32}
              height={32}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <span className="text-gray-400 text-xs">IMG</span>
          )}
        </div>
      ),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a: any, b: any) => a.code.localeCompare(b.code),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 80,
      render: (isActive: boolean, record: any) => (
        <Checkbox
          checked={isActive}
          onChange={(e) =>
            handleCheckboxChange(record.id, "isActive", e.target.checked)
          }
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record, "submaster");
            }}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record);
            }}
          />
        </Space>
      ),
    },
  ];

  const masterColumns: any = [
    {
      title: "",
      key: "dragHandle",
      width: 40,
      render: () => null,
    },
    {
      title: "Sr No",
      dataIndex: "sequence",
      key: "sequence",
      width: 80,
      render: (sequence: number, _: any, index: number) =>
        sequence || index + 1,
      sorter: (a: any, b: any) => (a.sequence || 0) - (b.sequence || 0),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a: any, b: any) => a.code.localeCompare(b.code),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Sub Masters",
      key: "subMastersCount",
      width: 120,
      render: (record: any) => (
        <Tag color="blue">{record.subMasters?.length || 0} items</Tag>
      ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record, "master")}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const currentData = isMasterMode ? masters : selectedMaster?.subMasters || [];
  const filteredData = currentData.filter(
    (item: any) =>
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handle name change to auto-generate code
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedCode = generateCodeFromName(name);

    // Only set code if not in edit mode (codes should not be changed when editing)
    if (!editMode) {
      form.setFieldsValue({ code: generatedCode });
    }
  };

  if (loading && masters.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Left Sidebar - Masters List */}
      {!isMasterMode && (
        <div className="col-span-1 bg-white flex flex-col">
          <Card className="!h-full">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">
                  {masters.length} Results
                </span>
                <Button
                  type="primary"
                  size="middle"
                  icon={<PlusOutlined />}
                  onClick={handleAddMaster}
                >
                  Master
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 overflow-auto">
              {masters?.map((master) => (
                <Card
                  styles={{
                    body: {
                      width: "100%",
                      padding: "8px",
                      cursor: "pointer",
                    },
                  }}
                  key={master.id}
                  onClick={() => handleMasterSelect(master)}
                  className="flex transition-all duration-200 ease-in-out justify-between items-center"
                  style={{
                    backgroundColor:
                      selectedMaster?.id === master.id
                        ? hexToRgba(primaryColor, 1)
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMaster?.id !== master.id) {
                      e.currentTarget.style.backgroundColor = hexToRgba(
                        primaryColor,
                        0.1
                      );
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMaster?.id !== master.id) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div className="flex w-full justify-between items-center">
                    <div className="flex flex-col">
                      <div
                        className={`font-medium text-sm ${
                          selectedMaster?.id === master.id
                            ? "text-gray-700"
                            : "text-gray-700"
                        }`}
                        style={{
                          color:
                            selectedMaster?.id === master.id
                              ? "white"
                              : undefined,
                        }}
                      >
                        {master.name}
                      </div>
                      <div
                        className={`text-xs ${
                          selectedMaster?.id === master.id
                            ? "text-gray-200"
                            : "text-gray-500"
                        }`}
                      >
                        {master.subMasters?.length || 0} items
                      </div>
                    </div>
                    <Dropdown
                      menu={{ items: getMasterMenuItems(master) }}
                      trigger={["click"]}
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                        className={`${
                          selectedMaster?.id === master.id
                            ? "!text-white"
                            : "text-gray-700"
                        } opacity-60 hover:opacity-100`}
                      />
                    </Dropdown>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Main Content Area */}
      <div className="col-span-3 flex flex-col">
        {/* Header */}
        <Card
          styles={{
            body: {
              width: "100%",
              padding: "8px",
            },
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {!isMasterMode && selectedMaster && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {selectedMaster.name}
                  </span>
                  <Tag color={selectedMaster.isActive ? "green" : "red"}>
                    {selectedMaster.isActive ? "Active" : "Inactive"}
                  </Tag>
                  <Tag color="blue">
                    {selectedMaster.subMasters?.length || 0} Sub Masters
                  </Tag>
                </div>
              )}
            </div>

            <Space>
              <Search
                placeholder="Search..."
                allowClear
                className="w-64"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={isMasterMode ? handleAddMaster : handleAddSubMaster}
                loading={loading}
                disabled={!isMasterMode && !selectedMaster}
              >
                {isMasterMode ? "Master" : "Sub Master"}
              </Button>
            </Space>
          </div>
        </Card>

        {/* Table Content with Drag and Drop */}
        <div className="mt-3">
          <Card className="h-full">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredData.map((item: any) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <Table
                  columns={isMasterMode ? masterColumns : submasterColumns}
                  dataSource={filteredData}
                  rowKey="id"
                  size="small"
                  loading={tableLoading}
                  components={{
                    body: {
                      row: DraggableRow,
                    },
                  }}
                  pagination={{
                    pageSize: 50,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                    pageSizeOptions: ["20", "50", "100"],
                  }}
                  scroll={{ y: "calc(100vh - 300px)" }}
                  rowClassName="hover:bg-gray-50"
                  locale={{
                    emptyText:
                      !isMasterMode && !selectedMaster
                        ? "Select a master to view sub masters"
                        : "No data available",
                  }}
                />
              </SortableContext>
            </DndContext>
          </Card>
        </div>
      </div>

      {/* Master/Submaster Fields Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span>
              {editMode ? "Edit" : "Add"}{" "}
              {drawerType === "master" ? "Master" : "Submaster"}
              {drawerType === "submaster" &&
                !isMasterMode &&
                ` - ${selectedMaster?.name}`}
            </span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={handleDrawerClose}
            />
          </div>
        }
        placement="right"
        width={700}
        open={drawerVisible}
        onClose={handleDrawerClose}
        closable={false}
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            {/* Basic Information */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input placeholder="Enter name" onChange={handleNameChange} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="code"
                  label="Code"
                  rules={[{ required: true, message: "Please enter code" }]}
                >
                  <Input
                    placeholder="Auto-generated from name"
                    disabled={true} // Always disabled - auto-generated
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={3} placeholder="Enter description" />
                </Form.Item>
              </Col>
            </Row>

            {/* Like Keywords Field */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="likeKeyword"
                  label="Like Keywords"
                  help="Enter keywords separated by commas"
                >
                  <Input placeholder="Enter search keywords separated by commas (e.g., keyword1, keyword2, keyword3)" />
                </Form.Item>
              </Col>
            </Row>

            {/* Parent Master for Submaster */}
            {drawerType === "submaster" && (
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item name="parentId" label="Parent Master">
                    <Select placeholder="Select parent master" disabled>
                      <Option value={selectedMaster?.id}>
                        {selectedMaster?.name}
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* Image Upload */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="imageUrl" label="Image">
                  <div className="flex flex-col gap-1">
                    <Upload
                      customRequest={handleImageUpload}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />} loading={uploadLoading}>
                        Upload Image
                      </Button>
                    </Upload>
                    <Input
                      placeholder="Or enter image URL directly"
                      value={form.getFieldValue("imageUrl")}
                      onChange={(e) =>
                        form.setFieldsValue({ imageUrl: e.target.value })
                      }
                    />
                    {form.getFieldValue("imageUrl") && (
                      <div className="mt-2">
                        <Image
                          src={form.getFieldValue("imageUrl")}
                          alt="Preview"
                          width={100}
                          height={100}
                          className="object-cover rounded border"
                          onError={() => {
                            messageApi.warning("Invalid image URL");
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>

            {/* Boolean Fields */}
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="isActive"
                  label="Active"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end space-x-2 mt-6">
              <Button onClick={handleDrawerClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editMode ? "Update" : "Save"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={isDeleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        okType="danger"
        confirmLoading={loading}
      >
        <p>{`Are you sure you want to delete "${selectedItem?.name}"?`}</p>
        <p className="text-red-500">This action cannot be undone.</p>
      </Modal>
      {contextHolder}
    </div>
  );
};

export default MasterDataManagement;
