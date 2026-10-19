
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaBox,
  FaCheckCircle,
  FaShippingFast,
  FaClock,
} from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#F59E0B",
  },
  rider_assigned: {
    label: "Rider Assigned",
    color: "#8B5CF6",
  },
  in_transit: {
    label: "In Transit",
    color: "#3B82F6",
  },
  delivered: {
    label: "Delivered",
    color: "#22C55E",
  },
  not_collected: {
    label: "Not Collected",
    color: "#EF4444",
  },
};

const FALLBACK_COLOR = "#94A3B8";

const formatStatus = (status = "unknown") =>
  status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const RiderDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const {
    data: statusCounts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rider-delivery-status-count", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const response = await axiosSecure.get(
        `/parcels/rider/delivery/status-count?email=${encodeURIComponent(
          user.email
        )}`
      );

      return response.data.data;
    },
  });

  // Normalize backend data and support unknown statuses.
  const chartData = useMemo(
    () =>
      statusCounts.map((item) => ({
        status: item.status || "unknown",
        name: STATUS_CONFIG[item.status]?.label ||
          formatStatus(item.status),
        count: Number(item.count) || 0,
        color:
          STATUS_CONFIG[item.status]?.color || FALLBACK_COLOR,
      })),
    [statusCounts]
  );

  const totalParcels = chartData.reduce(
    (total, item) => total + item.count,
    0
  );

  const getCount = (status) =>
    chartData.find((item) => item.status === status)?.count || 0;

  const delivered = getCount("delivered");
  const inTransit = getCount("in_transit");
  const awaitingPickup =
    getCount("pending") + getCount("rider_assigned");

  const cards = [
    {
      title: "Total Parcels",
      count: totalParcels,
      icon: <FaBox />,
      color: "text-primary",
      background: "bg-primary/10",
    },
    {
      title: "Delivered",
      count: delivered,
      icon: <FaCheckCircle />,
      color: "text-success",
      background: "bg-success/10",
    },
    {
      title: "In Transit",
      count: inTransit,
      icon: <FaShippingFast />,
      color: "text-info",
      background: "bg-info/10",
    },
    {
      title: "Awaiting Pickup",
      count: awaitingPickup,
      icon: <FaClock />,
      color: "text-warning",
      background: "bg-warning/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <span>
          {error?.response?.data?.message ||
            "Failed to load rider dashboard."}
        </span>
        <button className="btn btn-sm" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Rider Dashboard
          </h1>
          <p className="mt-1 text-sm text-base-content/60">
            Overview of your assigned parcel deliveries.
          </p>
        </div>

        <button
          className="btn btn-outline btn-sm"
          onClick={() => refetch()}
        >
          Refresh Data
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="card border border-base-300 bg-base-100 shadow-sm"
          >
            <div className="card-body flex-row items-center justify-between p-5">
              <div>
                <p className="text-sm text-base-content/60">
                  {card.title}
                </p>
                <h2 className="mt-2 text-3xl font-bold">
                  {card.count}
                </h2>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${card.color} ${card.background}`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pie chart and status breakdown */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card border border-base-300 bg-base-100 shadow-sm xl:col-span-2">
          <div className="card-body">
            <h2 className="card-title">Delivery Status Overview</h2>
            <p className="text-sm text-base-content/60">
              Distribution of all parcels assigned to you.
            </p>

            {totalParcels === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                <FaBox className="mb-3 text-4xl text-base-content/30" />
                <p className="font-semibold">No parcels assigned yet</p>
                <p className="text-sm text-base-content/60">
                  Your chart will appear when parcels are assigned.
                </p>
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.filter((item) => item.count > 0)}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius="75%"
                      innerRadius="45%"
                      paddingAngle={3}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {chartData
                        .filter((item) => item.count > 0)
                        .map((item) => (
                          <Cell
                            key={item.status}
                            fill={item.color}
                          />
                        ))}
                    </Pie>

                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        name,
                      ]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                      }}
                    />

                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Status list */}
        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Status Breakdown</h2>
            <p className="text-sm text-base-content/60">
              Parcel count by delivery status.
            </p>

            <div className="mt-3 space-y-4">
              {chartData.length === 0 ? (
                <p className="text-sm text-base-content/60">
                  No status data available.
                </p>
              ) : (
                chartData.map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">
                          {item.name}
                        </span>
                      </div>

                      <span className="font-bold">
                        {item.count}
                      </span>
                    </div>

                    <progress
                      className="progress mt-2 w-full"
                      value={item.count}
                      max={totalParcels || 1}
                      style={{ accentColor: item.color }}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="divider" />

            <div className="flex items-center justify-between">
              <span className="font-medium">Total Parcels</span>
              <span className="text-xl font-bold">
                {totalParcels}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
