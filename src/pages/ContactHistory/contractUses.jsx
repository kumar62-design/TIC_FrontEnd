import React, { useEffect, useState } from "react";
import { Space, Table, ConfigProvider, Empty, Spin, Tag } from "antd";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import { ContractUsesApiService } from "services/api/ContractApiService";
import {
  API_ERROR_MESSAGE,
  GENERIC_DATA_LABEL,
} from "shared/constants";

const STATUS_COLORS = {
  SUCCESS: "green",
  FAILED: "red",
  PENDING: "gold",
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString();
};

const ContractUses = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    document.title = "Contract Uses History";
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await ContractUsesApiService.getContractUsesHistory(
        user.user_id
      );

      console.log("Contract History Response:", response.data);

      // Supports both response structures
      const historyData =
        response?.data?.details?.history ||
        response?.data?.history ||
        [];

      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (errResponse) {
      setSnackData({
        show: true,
        message:
          errResponse?.response?.data?.message ||
          API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Project",
      dataIndex: "project_name",
      key: "project_name",
    },
    {
      title: "User",
      dataIndex: "user_name",
      key: "user_name",
    },
    {
      title: "Assessment",
      dataIndex: "assessment_type",
      key: "assessment_type",
    },
    {
      title: "Used",
      dataIndex: "contracts_used",
      key: "contracts_used",
      align: "center",
    },
    {
      title: "Previous",
      dataIndex: "previous_count",
      key: "previous_count",
      align: "center",
    },
    {
      title: "Current",
      dataIndex: "current_count",
      key: "current_count",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      ellipsis: true,
    },
    {
      title: "Created On",
      dataIndex: "created_date",
      key: "created_date",
      render: formatDate,
    },
  ];

  return (
    <Spin spinning={loading} tip="Loading..." size="large">
      <ConfigProvider
        renderEmpty={() => (
          <Empty description={GENERIC_DATA_LABEL.NO_DATA} />
        )}
      >
        <Space
          direction="vertical"
          style={{
            width: "100%",
            background: "#fff",
            padding: 20,
            borderRadius: 10,
            boxShadow: "6px 12px 20px #e4e4e4",
          }}
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={history}
            pagination={{
              current: currentPage,
              pageSize,
              total: history.length,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
          />
        </Space>

        <Snackbar
          style={{ top: 80 }}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={snackData.show}
          autoHideDuration={6000}
          onClose={() =>
            setSnackData((prev) => ({
              ...prev,
              show: false,
            }))
          }
        >
          <Alert
            severity={snackData.type}
            onClose={() =>
              setSnackData((prev) => ({
                ...prev,
                show: false,
              }))
            }
          >
            {snackData.message}
          </Alert>
        </Snackbar>
      </ConfigProvider>
    </Spin>
  );
};

export default ContractUses;