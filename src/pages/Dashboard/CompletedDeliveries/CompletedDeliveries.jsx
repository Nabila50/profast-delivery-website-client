 
import React, { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Swal from "sweetalert2";

import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const CompletedDeliveries = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");

  // Load completed deliveries
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["completed-parcels", user?.email],
    enabled: !!user?.email,

    queryFn: async () => {
      const response = await axiosSecure.get(
        "/rider/completed-parcels",
        {
          params: {
            email: user.email,
          },
        }
      );

      return response.data;
    },
  });

  const parcels = data?.data || [];

  // Format date and time
  const formatDate = (value) => {
    if (!value) return "Not recorded";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not recorded";
    }

    return date.toLocaleString();
  };

  // Format money
  const formatMoney = (amount) => {
    return `৳${(Number(amount) || 0).toFixed(2)}`;
  };

  // Determine same-district delivery
  const isSameDistrict = (parcel) => {
    const sender = (parcel.senderDistrict || "")
      .trim()
      .toLowerCase();

    const receiver = (parcel.receiverDistrict || "")
      .trim()
      .toLowerCase();

    return Boolean(sender && receiver && sender === receiver);
  };

  // Get earning rate
  const getEarningRate = (parcel) => {
    if (typeof parcel.riderEarningRate === "number") {
      return parcel.riderEarningRate * 100;
    }

    return isSameDistrict(parcel) ? 80 : 30;
  };

  // Get rider earning
  const getRiderEarning = (parcel) => {
    if (typeof parcel.riderEarning === "number") {
      return parcel.riderEarning;
    }

    // Fallback for older parcels without saved earnings.
    const fee = Number(parcel.cost) || 0;

    return Math.round(
      fee * (getEarningRate(parcel) / 100) * 100
    ) / 100;
  };

  // Search completed parcels
  const filteredParcels = parcels.filter((parcel) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return true;

    const searchableValues = [
      parcel.tracking_id,
      parcel.trackingId,
      parcel.parcelName,
      parcel.parcelTitle,
      parcel.senderDistrict,
      parcel.receiverDistrict,
      parcel.delivery_status,
      parcel.cashout_status,
    ];

    return searchableValues.some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  // Summary values
  const totalEarnings = parcels.reduce(
    (total, parcel) => total + getRiderEarning(parcel),
    0
  );

  const sameDistrictCount = parcels.filter(
    isSameDistrict
  ).length;

  const pendingCashouts = parcels.filter(
    (parcel) => parcel.cashout_status === "pending"
  ).length;

  // Submit cash-out request
  const cashoutMutation = useMutation({
    mutationFn: async (parcelId) => {
      const response = await axiosSecure.patch(
        `/parcels/${parcelId}/cashout`,
        {
          email: user.email,
        }
      );

      return response.data;
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: ["completed-parcels", user?.email],
      });

      Swal.fire({
        icon: "success",
        title: "Cash-out Requested!",
        text:
          response.message ||
          "Your cash-out request was submitted successfully.",
        confirmButtonColor: "#65a30d",
      });
    },

    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Cash-out Failed",
        text:
          error?.response?.data?.message ||
          "Could not submit your cash-out request. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    },
  });

  // Handle cash-out button
  const handleCashout = async (parcel) => {
    const status = parcel.cashout_status;

    if (status === "pending" || status === "paid") {
      return;
    }

    const earning = getRiderEarning(parcel);

    if (earning <= 0) {
      Swal.fire({
        icon: "warning",
        title: "No Earnings Available",
        text:
          "This delivery does not have a valid earning amount.",
      });

      return;
    }

    const result = await Swal.fire({
      title: "Request Cash Out?",
      html: `
        <p>You are requesting payment for this delivery.</p>
        <p style="margin-top: 12px; font-size: 24px; font-weight: bold;">
          ${formatMoney(earning)}
        </p>
        <p style="margin-top: 8px; color: #6b7280; font-size: 13px;">
          Your request must be processed before payment is completed.
        </p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Cash Out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#65a30d",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
      cashoutMutation.mutate(parcel._id);
    }
  };

  // Cash-out status badge
  const getCashoutStatus = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          className: "bg-amber-100 text-amber-800",
        };

      case "paid":
        return {
          label: "Paid",
          className: "bg-green-100 text-green-800",
        };

      case "rejected":
        return {
          label: "Rejected",
          className: "bg-red-100 text-red-800",
        };

      case "approved":
        return {
          label: "Approved",
          className: "bg-blue-100 text-blue-800",
        };

      default:
        return {
          label: "Not Requested",
          className: "bg-gray-100 text-gray-700",
        };
    }
  };

  // Cash-out action
  const renderCashoutAction = (parcel) => {
    const status = parcel.cashout_status;

    if (status === "paid") {
      return (
        <span className="font-semibold text-green-700">
          Payment Completed
        </span>
      );
    }

    if (status === "pending") {
      return (
        <span className="text-sm font-medium text-amber-700">
          Awaiting Approval
        </span>
      );
    }

    if (status === "approved") {
      return (
        <span className="text-sm font-medium text-blue-700">
          Approved — Awaiting Payment
        </span>
      );
    }

    return (
      <button
        onClick={() => handleCashout(parcel)}
        disabled={cashoutMutation.isPending}
        className="rounded-lg bg-[#CAEB66] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#b9dc52] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cashoutMutation.isPending
          ? "Processing..."
          : status === "rejected"
            ? "Request Again"
            : "Cash Out"}
      </button>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3">
        <span className="loading loading-spinner loading-lg" />
        <span>Loading completed deliveries...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-red-700">
          Failed to load completed deliveries
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          {error?.response?.data?.message ||
            error?.message ||
            "Please try again."}
        </p>

        <button
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-[#CAEB66] px-5 py-2 font-semibold text-black hover:bg-[#b9dc52]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          Completed Deliveries
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          View your delivery history, track earnings, and request
          payment for completed deliveries.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed Deliveries
          </p>

          <h2 className="mt-2 text-3xl font-bold text-lime-700">
            {data?.count ?? parcels.length}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Rider Earnings
          </p>

          <h2 className="mt-2 text-3xl font-bold text-lime-700">
            {formatMoney(totalEarnings)}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Same-District Deliveries
          </p>

          <h2 className="mt-2 text-3xl font-bold text-lime-700">
            {sameDistrictCount}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Earning rate: 80%
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Pending Cash-out Requests
          </p>

          <h2 className="mt-2 text-3xl font-bold text-amber-600">
            {pendingCashouts}
          </h2>
        </div>
      </div>

      {/* Earnings rule information */}
      <div className="rounded-xl border border-lime-200 bg-lime-50 p-4">
        <h2 className="font-semibold text-gray-900">
          Rider Earning Rules
        </h2>

        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
          <p>Same district: 80% of parcel fee</p>
          <p>Different district: 30% of parcel fee</p>
        </div>
      </div>

      {/* Search and history heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">
          Delivery History
        </h2>

        <input
          type="text"
          placeholder="Search tracking ID, parcel, district..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-lime-500 sm:max-w-sm"
        />
      </div>

      {/* Empty state */}
      {filteredParcels.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h3 className="text-lg font-semibold">
            {parcels.length === 0
              ? "No completed deliveries yet"
              : "No matching deliveries found"}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {parcels.length === 0
              ? "Your completed deliveries will appear here."
              : "Try another tracking ID, parcel name, or district."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border bg-white shadow-sm lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-4">Parcel</th>
                  <th className="px-4 py-4">Route</th>
                  {/* <th className="px-4 py-4">Pickup Time</th>
                  <th className="px-4 py-4">Delivered Time</th> */}
                  <th className="px-4 py-4">Parcel Fee</th>
                  <th className="px-4 py-4">Rate</th>
                  <th className="px-4 py-4">Your Earnings</th>
                  <th className="px-4 py-4">Cash-out Status</th>
                  <th className="px-4 py-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredParcels.map((parcel) => {
                  const status = getCashoutStatus(
                    parcel.cashout_status
                  );

                  const rate = getEarningRate(parcel);
                  const earning = getRiderEarning(parcel);

                  return (
                    <tr
                      key={parcel._id}
                      className="border-t hover:text-black"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-black">
                          {parcel.parcelName ||
                            parcel.parcelTitle ||
                            "Parcel"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {parcel.tracking_id ||
                            parcel.trackingId ||
                            "No tracking ID"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-black">
                        <p>
                          {parcel.senderDistrict || "Unknown"}
                        </p>

                        <p className="my-1 text-xs text-gray-400">
                          to
                        </p>

                        <p className="text-black">
                          {parcel.receiverDistrict || "Unknown"}
                        </p>
                      </td>

                      {/* <td className="min-w-40 px-4 py-4">
                        {formatDate(parcel.pickedUpAt)}
                      </td>

                      <td className="min-w-40 px-4 py-4">
                        {formatDate(parcel.deliveredAt)}
                      </td> */}

                      <td className="whitespace-nowrap px-4 py-4 text-black">
                        {formatMoney(parcel.cost)}
                      </td>

                      <td className="px-4 py-4 text-black">
                        {rate}%
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-bold text-green-700">
                        {formatMoney(earning)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="min-w-40 px-4 py-4">
                        {renderCashoutAction(parcel)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile and tablet cards */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredParcels.map((parcel) => {
              const status = getCashoutStatus(
                parcel.cashout_status
              );

              const rate = getEarningRate(parcel);
              const earning = getRiderEarning(parcel);

              return (
                <div
                  key={parcel._id}
                  className="space-y-4 rounded-xl border bg-white p-4 shadow-sm"
                >
                  {/* Parcel header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">
                        {parcel.parcelName ||
                          parcel.parcelTitle ||
                          "Parcel"}
                      </h3>

                      <p className="mt-1 break-all text-xs text-gray-500">
                        {parcel.tracking_id ||
                          parcel.trackingId ||
                          "No tracking ID"}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      {parcel.delivery_status ===
                      "service_center_delivered"
                        ? "Service Center Delivered"
                        : "Delivered"}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">
                      Delivery Route
                    </p>

                    <p className="mt-1 font-medium">
                      {parcel.senderDistrict || "Unknown"} →{" "}
                      {parcel.receiverDistrict || "Unknown"}
                    </p>
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">
                        Picked Up
                      </p>

                      <p className="mt-1 text-sm">
                        {formatDate(parcel.pickedUpAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Delivered
                      </p>

                      <p className="mt-1 text-sm">
                        {formatDate(parcel.deliveredAt)}
                      </p>
                    </div>
                  </div>

                  {/* Fees and earnings */}
                  <div className="grid grid-cols-3 gap-2 border-t pt-3">
                    <div>
                      <p className="text-xs text-gray-500">
                        Parcel Fee
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {formatMoney(parcel.cost)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Rider Rate
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {rate}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        You Earned
                      </p>

                      <p className="mt-1 text-sm font-bold text-green-700">
                        {formatMoney(earning)}
                      </p>
                    </div>
                  </div>

                  {/* Cash-out */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Cash-out Status
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div>{renderCashoutAction(parcel)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default CompletedDeliveries;
 
