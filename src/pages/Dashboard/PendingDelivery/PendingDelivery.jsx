import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import useTrackingLogger from "../../../hooks/useTrackingLogger";

const PendingDelivery = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { logTracking } = useTrackingLogger();

  // Load rider's assigned parcels
  const {
    data: parcels = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rider-parcels", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get("/rider/parcels", {
        params: { email: user.email },
      });

      return res?.data?.data ?? [];
    },
  });

  // Update parcel status and then log tracking
  const statusMutation = useMutation({
    mutationFn: async ({ parcel, nextStatus }) => {
      const parcelId = parcel._id;
      const trackingId = parcel.tracking_id || parcel.trackingId;

      // Step 1: Update delivery status
      const res = await axiosSecure.patch(
        `/parcels/${parcelId}/status`,
        { status: nextStatus }
      );

      // Step 2: Save tracking event after status update succeeds
      let trackingSaved = true;

      if (!trackingId) {
        trackingSaved = false;
        console.error("Tracking ID is missing:", parcel);
      } else {
        try {
          await logTracking({
            tracking_id: trackingId,
            status: nextStatus,
            details:
              nextStatus === "in_transit"
                ? `Parcel picked up by ${user?.displayName || user?.name || user?.email}`
                : `Parcel delivered by ${user?.displayName || user?.name || user?.email}`,
            location:
              nextStatus === "in_transit"
                ? parcel.senderDistrict || ""
                : parcel.receiverDistrict || "",
            updated_by: user?.email || "",
          });
        } catch (trackingError) {
          trackingSaved = false;
          console.error(
            "Parcel status updated, but tracking could not be saved:",
            trackingError
          );
        }
      }

      return { data: res.data, nextStatus, trackingSaved };
    },

    onSuccess: async ({ nextStatus, trackingSaved }) => {
      await queryClient.invalidateQueries({
        queryKey: ["rider-parcels", user?.email],
      });

      await queryClient.invalidateQueries({
        queryKey: ["parcels"],
      });

      if (!trackingSaved) {
        await Swal.fire({
          icon: "warning",
          title: "Status updated; tracking failed",
          text:
            "The parcel status was updated, but the tracking event could not be saved. Please check the tracking API and try to resolve the missing event.",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title:
          nextStatus === "in_transit"
            ? "Parcel picked up"
            : "Parcel delivered",
        text:
          nextStatus === "in_transit"
            ? "The parcel status and tracking history have been updated."
            : "The parcel has been delivered and tracking history has been updated.",
        timer: 1800,
        showConfirmButton: false,
      });
    },

    onError: (err) => {
      console.error("Failed to update parcel status:", err);

      Swal.fire({
        icon: "error",
        title: "Update failed",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update parcel delivery status.",
      });
    },
  });

  // Status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      rider_assigned: {
        label: "Rider Assigned",
        className: "badge badge-warning badge-md text-black h-10",
      },
      in_transit: {
        label: "In Transit",
        className: "badge badge-info badge-md text-black h-10",
      },
      delivered: {
        label: "Delivered",
        className: "badge badge-success badge-md text-black h-10",
      },
    };

    const current = statusMap[status] || {
      label: "Unknown",
      className: "badge badge-neutral badge-md text-white",
    };

    return <span className={current.className}>{current.label}</span>;
  };

  // Confirm and perform pickup/delivery
  const handleDeliveryAction = async (parcel) => {
    const isPickup = parcel.delivery_status === "rider_assigned";

    const nextStatus = isPickup ? "in_transit" : "delivered";

    const result = await Swal.fire({
      title: isPickup
        ? "Pick up this parcel?"
        : "Mark this parcel as delivered?",
      text: isPickup
        ? "This parcel will be marked as picked up and in transit."
        : "This parcel will be marked as delivered.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isPickup
        ? "Yes, pick up"
        : "Yes, mark delivered",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    // Do not update status or tracking when the user cancels
    if (!result.isConfirmed) return;

    statusMutation.mutate({
      parcel,
      nextStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
        Failed to load pending deliveries.
        <div className="mt-2 text-sm">
          {error?.response?.data?.message ||
            error?.message ||
            "Please try again."}
        </div>
      </div>
    );
  }

  const activeDeliveries = parcels.filter(
    (parcel) =>
      parcel.delivery_status === "rider_assigned" ||
      parcel.delivery_status === "in_transit"
  ).length;

  return (
    <div className="w-full min-w-0 p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold md:text-3xl">
          Pending Deliveries
        </h2>
        <p className="mt-2 text-gray-500">
          Manage your assigned parcels and update their delivery progress.
        </p>
      </div>

      <div className="stats mb-6 shadow">
        <div className="stat">
          <div className="stat-title">Total Active Deliveries</div>
          <div className="stat-value text-primary">
            {activeDeliveries}
          </div>
        </div>
      </div>

      {parcels.length === 0 ? (
        <div className="rounded-xl bg-base-200 p-10 text-center">
          <h3 className="text-xl font-semibold">
            No Deliveries Found
          </h3>
          <p className="mt-2 text-gray-500">
            You don't have any assigned parcels at the moment.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-300">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>#</th>
                <th>Tracking ID</th>
                <th>Parcel</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Receiver District</th>
                <th>Delivery Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {parcels.map((parcel, index) => (
                <tr key={parcel._id}>
                  <td>{index + 1}</td>

                  <td className="whitespace-nowrap font-medium">
                    {parcel.tracking_id ||
                      parcel.trackingId ||
                      "N/A"}
                  </td>

                  <td>
                    <div className="font-semibold">
                      {parcel.parcelName ||
                        parcel.parcelTitle ||
                        "Parcel"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {parcel.parcelType || "N/A"}
                      {parcel.parcelWeight
                        ? ` • ${parcel.parcelWeight} kg`
                        : ""}
                    </div>
                  </td>

                  <td>
                    <div>{parcel.senderName || "N/A"}</div>
                    <div className="text-xs text-gray-500">
                      {parcel.senderDistrict || "N/A"}
                    </div>
                  </td>

                  <td>
                    <div>{parcel.receiverName || "N/A"}</div>
                    <div className="text-xs text-gray-500">
                      {parcel.receiverAddress || ""}
                    </div>
                  </td>

                  <td>{parcel.receiverDistrict || "N/A"}</td>

                  <td>{getStatusBadge(parcel.delivery_status)}</td>

                  <td>
                    {parcel.delivery_status === "rider_assigned" ? (
                      <button
                        className="btn btn-sm border-none bg-[#CAEB66] text-black hover:bg-[#b9dc55]"
                        disabled={statusMutation.isPending}
                        onClick={() => handleDeliveryAction(parcel)}
                      >
                        {statusMutation.isPending
                          ? "Updating..."
                          : "Pick Up"}
                      </button>
                    ) : parcel.delivery_status === "in_transit" ? (
                      <button
                        className="btn btn-sm btn-success text-white"
                        disabled={statusMutation.isPending}
                        onClick={() => handleDeliveryAction(parcel)}
                      >
                        {statusMutation.isPending
                          ? "Updating..."
                          : "Mark Delivered"}
                      </button>
                    ) : parcel.delivery_status === "delivered" ? (
                      <span className="font-medium text-success">
                        Completed
                      </span>
                    ) : (
                      <span className="text-gray-400">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingDelivery;