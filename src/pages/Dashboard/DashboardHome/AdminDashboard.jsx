
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiPackage,
  FiCheckCircle,
  FiTruck,
  FiClock,
  FiActivity,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import useAxiosSecure from "../../../hooks/useAxiosSecure";

const STATUS_CONFIG = {
  delivered: {
    label: "Delivered",
    color: "#65A30D",
    icon: FiCheckCircle,
    description: "Successfully delivered",
  },
  not_collected: {
    label: "Not Collected",
    color: "#FBBF24",
    icon: FiClock,
    description: "Waiting for pickup",
  },
  in_transit: {
    label: "In Transit",
    color: "#60A5FA",
    icon: FiTruck,
    description: "Currently on the way",
  },
  rider_assigned: {
    label: "Rider Assigned",
    color: "#A78BFA",
    icon: FiTruck,
    description: "Waiting for rider pickup",
  },
  pending: {
    label: "Pending",
    color: "#FB7185",
    icon: FiClock,
    description: "Awaiting processing",
  },
};

const getStatusConfig = (status) => {
  if (STATUS_CONFIG[status]) {
    return STATUS_CONFIG[status];
  }

  return {
    label: String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    color: "#94A3B8",
    icon: FiActivity,
    description: "Current parcel status",
  };
};

const AdminDashboard = () => {
  const axiosSecure = useAxiosSecure();

  const {
    data: statusData = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-delivery-status-count"],
    queryFn: async () => {
      const res = await axiosSecure.get(
        "/parcels/delivery/status-count"
      );

      const result = Array.isArray(res.data)
        ? res.data
        : res.data?.data;

      if (!Array.isArray(result)) {
        throw new Error(
          "Unexpected response format from delivery status API."
        );
      }

      return result;
    },
  });

  // Normalize statuses and combine duplicate entries.
  const normalizedData = Object.values(
    statusData.reduce((acc, item) => {
      const status = String(
        item?.status || "unknown"
      ).toLowerCase();

      const rawCount = Number(item?.count);
      const count = Number.isFinite(rawCount)
        ? Math.max(0, rawCount)
        : 0;

      if (!acc[status]) {
        acc[status] = { status, count: 0 };
      }

      acc[status].count += count;

      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count);

  const total = normalizedData.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const getCount = (status) =>
    normalizedData.find(
      (item) => item.status === status
    )?.count || 0;

  // Summary cards.
  const stats = [
    {
      title: "Total Parcels",
      count: total,
      icon: FiPackage,
      iconBg: "#CAEB66",
      iconColor: "#37451B",
      description: "Across all delivery statuses",
    },
    {
      title: "Delivered",
      count: getCount("delivered"),
      icon: FiCheckCircle,
      iconBg: "#DCFCE7",
      iconColor: "#15803D",
      description: "Successfully completed",
    },
    {
      title: "In Transit",
      count: getCount("in_transit"),
      icon: FiTruck,
      iconBg: "#DBEAFE",
      iconColor: "#1D4ED8",
      description: "Currently on the way",
    },
    {
      title: "Not Collected",
      count: getCount("not_collected"),
      icon: FiClock,
      iconBg: "#FEF3C7",
      iconColor: "#B45309",
      description: "Waiting for pickup",
    },
  ];

  // Only positive counts should create pie slices.
  const chartData = normalizedData.filter(
    (item) => item.count > 0
  );

  // Loading state.
  if (isLoading) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center gap-4">
        <span className="loading loading-spinner loading-lg text-[#8AAC20]" />

        <p className="text-sm text-base-content/60">
          Loading delivery statistics...
        </p>
      </div>
    );
  }

  // Error state.
  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-error/20 bg-base-100 p-6 text-center">
        <FiAlertCircle className="text-4xl text-error" />

        <h3 className="text-xl font-bold">
          Could not load delivery statistics
        </h3>

        <p className="max-w-md text-sm text-base-content/60">
          {error?.response?.data?.message ||
            error?.message ||
            "Please check your connection and try again."}
        </p>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn border-none bg-[#CAEB66] text-black hover:bg-[#b9dc55]"
        >
          <FiRefreshCw
            className={isFetching ? "animate-spin" : ""}
          />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Delivery Overview
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            Monitor parcel progress across your delivery network.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn w-fit border-none bg-[#CAEB66] text-black hover:bg-[#b9dc55]"
        >
          <FiRefreshCw
            className={isFetching ? "animate-spin" : ""}
          />
          {isFetching ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const percentage =
            total > 0 ? (stat.count / total) * 100 : 0;

          return (
            <div
              key={stat.title}
              className="card border border-base-300 bg-base-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="card-body gap-4 p-5">
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: stat.iconBg,
                    }}
                  >
                    <Icon
                      size={24}
                      style={{ color: stat.iconColor }}
                    />
                  </div>

                  <span className="text-xs font-medium text-base-content/50">
                    {percentage.toFixed(1)}%
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-base-content/60">
                    {stat.title}
                  </p>

                  <h3 className="mt-1 text-3xl font-extrabold">
                    {stat.count.toLocaleString()}
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="h-2 overflow-hidden rounded-full bg-base-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: stat.iconColor,
                      }}
                    />
                  </div>

                  <p className="text-xs text-base-content/55">
                    {stat.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Status Breakdown */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Recharts Pie Chart */}
        <div className="card min-w-0 border border-base-300 bg-base-100 shadow-sm xl:col-span-2">
          <div className="card-body">
            <h3 className="text-lg font-bold">
              Parcel Distribution
            </h3>

            <p className="text-sm text-base-content/60">
              Share of parcels by delivery status
            </p>

            <div className="grid grid-cols-1 items-center gap-5 py-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {/* Pie Chart */}
              <div className="h-64 min-w-0 w-full">
                {total > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                       
                        outerRadius={88}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {chartData.map((item) => (
                          <Cell
                            key={item.status}
                            fill={
                              getStatusConfig(item.status).color
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value, name) => [
                          `${Number(value).toLocaleString()} parcels`,
                          getStatusConfig(name).label,
                        ]}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          backgroundColor: "#ffffff",
                          color: "#111827",
                          padding: "10px 14px",
                        }}
                      />

                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        formatter={(value) => (
                          <span className="text-xs text-base-content">
                            {getStatusConfig(value).label}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl bg-base-200/40">
                    <p className="text-sm text-base-content/50">
                      No delivery data available.
                    </p>
                  </div>
                )}
              </div>

              {/* Chart Summary */}
              <div className="space-y-4">
                <div className="rounded-xl bg-base-200/60 p-4 text-center">
                  <p className="text-sm text-base-content/60">
                    Total Parcels
                  </p>

                  <h4 className="mt-1 text-3xl font-extrabold">
                    {total.toLocaleString()}
                  </h4>
                </div>

                {chartData.map((item) => {
                  const config = getStatusConfig(item.status);
                  const percentage =
                    total > 0
                      ? (item.count / total) * 100
                      : 0;

                  return (
                    <div
                      key={item.status}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-3 w-3 shrink-0 rounded-sm"
                            style={{
                              backgroundColor: config.color,
                            }}
                          />

                          <span className="truncate text-sm font-medium">
                            {config.label}
                          </span>
                        </div>

                        <span className="text-sm font-bold">
                          {item.count.toLocaleString()}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-base-200">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: config.color,
                          }}
                        />
                      </div>

                      <p className="text-xs text-base-content/50">
                        {percentage.toFixed(1)}% of all parcels
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Status Breakdown */}
        <div className="card min-w-0 border border-base-300 bg-base-100 shadow-sm xl:col-span-3">
          <div className="card-body">
            <div>
              <h3 className="text-lg font-bold">
                Status Breakdown
              </h3>

              <p className="text-sm text-base-content/60">
                Parcel counts and progress
              </p>
            </div>

            <div className="mt-2 divide-y divide-base-200">
              {normalizedData.map((item) => {
                const config = getStatusConfig(item.status);
                const Icon = config.icon;
                const percentage =
                  total > 0
                    ? (item.count / total) * 100
                    : 0;

                return (
                  <div
                    key={item.status}
                    className="flex items-center gap-3 py-4"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${config.color}30`,
                        color: config.color,
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        {config.label}
                      </p>

                      <p className="text-xs text-base-content/55">
                        {config.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-extrabold">
                        {item.count.toLocaleString()}
                      </p>

                      <p className="text-xs text-base-content/55">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}

              {normalizedData.length === 0 && (
                <p className="py-10 text-center text-base-content/60">
                  No parcels to display yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
