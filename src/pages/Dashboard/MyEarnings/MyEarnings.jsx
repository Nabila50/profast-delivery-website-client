
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FaWallet,
  FaMoneyBillWave,
  FaClock,
  FaChartLine,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaCalendarCheck,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  isAfter,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";

import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

const MyEarnings = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const [period, setPeriod] = useState("week");

  // Load completed deliveries for the logged-in rider.
  const {
    data: parcels = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["riderEarnings", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get("/rider/completed-parcels", {
        params: { email: user.email },
      });

      const responseData = res.data;
      const parcelList = Array.isArray(responseData)
        ? responseData
        : responseData?.data;

      if (!Array.isArray(parcelList)) {
        throw new Error(
          "The completed-parcels API did not return a parcel array."
        );
      }

      return parcelList;
    },
  });

  // Calculate the rider's share of a delivery.
  // Prefer riderEarning if it has already been saved by the backend.
  const calculateEarning = (parcel) => {
    if (
      parcel.riderEarning !== undefined &&
      parcel.riderEarning !== null &&
      parcel.riderEarning !== ""
    ) {
      const savedEarning = Number(parcel.riderEarning);

      if (Number.isFinite(savedEarning)) {
        return savedEarning;
      }
    }

    // Fallback to your existing delivery-fee calculation.
    const cost = Number(parcel.cost);

    if (!Number.isFinite(cost)) return 0;

    return parcel.sender_center === parcel.receiver_center
      ? cost * 0.8
      : cost * 0.3;
  };

  // Use the current date when calculating time-based earnings.
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const yearStart = startOfYear(now);

  const stats = useMemo(() => {
    const totals = {
      totalEarnings: 0,
      totalCashedOut: 0,
      totalPending: 0,
      availableBalance: 0,
      today: 0,
      week: 0,
      month: 0,
      year: 0,
      overall: 0,
    };

    parcels.forEach((parcel) => {
      const earning = calculateEarning(parcel);

      const status = String(parcel.cashout_status || "")
        .trim()
        .toLowerCase();

      // Total earnings from all completed deliveries.
      totals.totalEarnings += earning;

      // Cash-out status calculations.
      if (["paid", "cashed_out"].includes(status)) {
        totals.totalCashedOut += earning;
      } else if (["pending", "approved"].includes(status)) {
        totals.totalPending += earning;
      } else {
        // No active cash-out request, or a rejected request.
        totals.availableBalance += earning;
      }

      // Support the completion timestamp field names.
      const deliveredValue =
        parcel.delivered_at ||
        parcel.service_center_delivered_at ||
        parcel.delivery_completed_at;

      if (!deliveredValue) return;

      const deliveredAt = new Date(deliveredValue);

      if (Number.isNaN(deliveredAt.getTime())) return;

      if (!isAfter(deliveredAt, todayStart) &&
          deliveredAt.getTime() !== todayStart.getTime()) {
        // Delivery was before today's start.
      } else {
        totals.today += earning;
      }

      if (isAfter(deliveredAt, weekStart) ||
          deliveredAt.getTime() === weekStart.getTime()) {
        totals.week += earning;
      }

      if (isAfter(deliveredAt, monthStart) ||
          deliveredAt.getTime() === monthStart.getTime()) {
        totals.month += earning;
      }

      if (isAfter(deliveredAt, yearStart) ||
          deliveredAt.getTime() === yearStart.getTime()) {
        totals.year += earning;
      }
    });

    totals.overall = totals.totalEarnings;

    return totals;
  }, [parcels, todayStart, weekStart, monthStart, yearStart]);

  // Format amounts in Bangladeshi taka.
  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 2,
    }).format(amount);

  const summaryCards = [
    {
      title: "Total Earnings",
      value: stats.totalEarnings,
      description: "Earnings from completed deliveries",
      icon: <FaWallet />,
      color: "bg-lime-100 text-lime-700",
    },
    {
      title: "Total Cashed Out",
      value: stats.totalCashedOut,
      description: "Cash-outs marked as paid",
      icon: <FaMoneyBillWave />,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Total Pending",
      value: stats.totalPending,
      description: "Cash-outs awaiting payment",
      icon: <FaClock />,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Available Balance",
      value: stats.availableBalance,
      description: "Earnings not yet cashed out",
      icon: <FaChartLine />,
      color: "bg-blue-100 text-blue-700",
    },
  ];

  const analysisOptions = [
    {
      id: "today",
      label: "Today",
      icon: <FaCalendarDay />,
      value: stats.today,
    },
    {
      id: "week",
      label: "This Week",
      icon: <FaCalendarWeek />,
      value: stats.week,
    },
    {
      id: "month",
      label: "This Month",
      icon: <FaCalendarAlt />,
      value: stats.month,
    },
    {
      id: "year",
      label: "This Year",
      icon: <FaCalendarCheck />,
      value: stats.year,
    },
    {
      id: "overall",
      label: "Overall",
      icon: <FaChartLine />,
      value: stats.overall,
    },
  ];

  const selectedOption = analysisOptions.find(
    (option) => option.id === period
  );

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-lime-600" />
        <span className="ml-3">Loading your earnings...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h2 className="font-semibold">
          Unable to load your earnings.
        </h2>

        <p className="mt-2 text-sm">
          {error?.response?.data?.message ||
            error?.message ||
            "Please try again."}
        </p>

        <button
          onClick={() => refetch()}
          className="btn btn-sm mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-lime-200 md:text-3xl">
            My Earnings
          </h1>

          <p className="mt-2 text-sm text-gray-100">
            Track your delivery income, cash-outs, and earnings
            over time.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="btn btn-primary border-gray-200  hover:bg-gray-50 text-black"
        >
          Refresh Earnings
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <h2 className="mt-3 break-words text-2xl font-bold text-gray-800">
                  {formatMoney(card.value)}
                </h2>
              </div>

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${card.color}`}
              >
                {card.icon}
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Earnings Analysis */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Earnings Analysis
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select a period to analyze your earnings.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {analysisOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setPeriod(option.id)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                period === option.id
                  ? "border-[#CAEB66] bg-[#CAEB66] text-gray-900"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-gray-50 p-6">
          <p className="text-sm text-gray-500">
            {selectedOption?.label} Earnings
          </p>

          <h3 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
            {formatMoney(selectedOption?.value || 0)}
          </h3>

          <p className="mt-3 text-sm text-gray-500">
            Based on your completed delivery records.
          </p>
        </div>

        {/* Comparison Bars */}
        <div className="mt-6 space-y-5">
          {analysisOptions.map((option) => {
            const maximum = Math.max(
              ...analysisOptions.map((item) => item.value),
              1
            );

            const percentage =
              (option.value / maximum) * 100;

            return (
              <div key={option.id}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-600">
                    {option.label}
                  </span>

                  <span className="font-semibold text-gray-800">
                    {formatMoney(option.value)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#CAEB66] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cash-out Overview */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">
          Cash-out Overview
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-sm text-green-700">Paid</p>
            <p className="mt-2 text-xl font-bold text-green-800">
              {formatMoney(stats.totalCashedOut)}
            </p>
          </div>

          <div className="rounded-xl bg-yellow-50 p-4">
            <p className="text-sm text-yellow-700">Pending</p>
            <p className="mt-2 text-xl font-bold text-yellow-800">
              {formatMoney(stats.totalPending)}
            </p>
          </div>

          <div className="rounded-xl bg-lime-50 p-4">
            <p className="text-sm text-lime-700">Available</p>
            <p className="mt-2 text-xl font-bold text-lime-800">
              {formatMoney(stats.availableBalance)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
          <FaExclamationCircle className="mt-0.5 shrink-0" />

          <p>
            Paid cash-outs are counted as cashed out. Pending
            and approved cash-outs remain pending until payment.
            Rejected requests return to the available balance.
          </p>
        </div>
      </section>

      {/* Completed Deliveries */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">
          Total Completed Deliveries
        </p>

        <p className="mt-2 text-2xl font-bold text-gray-800">
          {parcels.length}
        </p>
      </div>
    </div>
  );
};

export default MyEarnings;