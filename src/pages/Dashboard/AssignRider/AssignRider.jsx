import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FaArrowUp } from "react-icons/fa";
import BackToTop from "../../shared/BackToTop/BackToTopBtn";
import useTrackingLogger from "../../../hooks/useTrackingLogger";
import useAuth from "../../../hooks/useAuth";

const AssignRider = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedRider, setSelectedRider] = useState(null);
  const [riders, setRiders] = useState([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logTracking } = useTrackingLogger();
  const { user} = useAuth();

  // Load parcels
  const {
    data: parcels = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["assign-rider-parcels"],

    queryFn: async () => {
      const res = await axiosSecure.get("/parcels");

      return res.data;
    },
  });

  const { mutateAsync: assignRider } = useMutation({
    mutationFn: async ({ parcelId, rider }) => {
      setSelectedRider(rider);
      const res = await axiosSecure.patch(`/parcels/${parcelId}/assign`, {
        riderId: rider._id,
        riderEmail: rider.email,
        riderName: rider.name,
      });

      return res.data;
    },

    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["assign-rider-parcels"],
      });
      Swal.fire("Success", "Rider assigned successfully!", "success");

      // track rider assign

      await logTracking({
        tracking_id: selectedParcel.tracking_id,
        status: "rider_assigned",
        details: `Assigned to ${setSelectedRider.name}`,
        updated_by: user.email
      });

      document.getElementById("assignModal").close();
    },
  });

  // Open modal and load riders according to parcel service center
  const openAssignModal = async (parcel) => {
    setSelectedParcel(parcel);
    setRiders([]);
    setIsModalOpen(true);
    setLoadingRiders(true);

    // Your parcel service center
    const district =
      parcel.senderDistrict || parcel.senderCenter || parcel.serviceCenter;

    try {
      const res = await axiosSecure.get("/riders/eligible", {
        params: {
          district: district,
        },
      });

      setRiders(res.data);
    } catch (error) {
      console.error("Error fetching riders:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load riders.",
      });
    } finally {
      setLoadingRiders(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedParcel(null);
    setRiders([]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load parcels.
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Assign Rider</h2>

        <p className="text-gray-500 mt-1">
          View paid parcels and assign them to available riders.
        </p>
      </div>

      {/* Parcel Table */}
      <div className="w-full overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Parcel</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Delivery Area</th>
              <th>Cost</th>
              <th>Payment Status</th>
              <th>Parcel Status</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {parcels.length > 0 ? (
              parcels.map((parcel, index) => (
                <tr key={parcel._id}>
                  {/* # */}
                  <td>{index + 1}</td>

                  {/* Parcel */}
                  <td>
                    <div>
                      <p className="font-semibold">
                        {parcel.parcelTitle} {parcel.parcelName}
                      </p>

                      <p className="text-sm text-gray-500 capitalize">
                        {parcel.parcelType}
                      </p>

                      <p className="text-xs text-gray-400">
                        {parcel.trackingId}
                      </p>
                    </div>
                  </td>

                  {/* Sender */}
                  <td>
                    <p className="font-medium">{parcel.senderName}</p>

                    <p className="text-sm text-gray-500">
                      {parcel.senderCenter} {parcel.senderRegion}
                    </p>
                  </td>

                  {/* Receiver */}
                  <td>
                    <p className="font-medium">{parcel.receiverName}</p>

                    <p className="text-sm text-gray-500">
                      {parcel.receiverCenter} {parcel.receiverRegion}
                    </p>
                  </td>

                  {/* Delivery Area */}
                  <td className="text-center">
                    <p className="text-sm">
                      {parcel.senderCenter} {parcel.senderRegion}
                    </p>

                    <p className="text-xs text-gray-400">to</p>

                    <p className="text-sm">
                      {parcel.receiverCenter} {parcel.receiverRegion}
                    </p>
                  </td>

                  {/* Cost */}
                  <td>
                    <span className="font-semibold">৳{parcel.cost}</span>
                  </td>

                  {/* Payment Status */}
                  <td>
                    <span
                      className={`badge ${
                        parcel.status === "paid"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {parcel.status || "unpaid"}
                    </span>
                  </td>

                  {/* Parcel Status */}
                  <td>
                    <span className="badge badge-info">
                      {parcel.delivery_status || "not_collected"}
                    </span>
                  </td>

                  {/* Created At */}
                  <td>
                    {parcel.creation_date
                      ? new Date(parcel.creation_date).toLocaleDateString()
                      : "N/A"}
                  </td>

                  {/* Action */}
                  <td>
                    <button
                      onClick={() => openAssignModal(parcel)}
                      className="btn btn-sm bg-[#CAEB66] border-none text-black hover:bg-[#b9dc55]"
                    >
                      Assign Rider
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-10">
                  No parcels found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Rider Modal */}
      {isModalOpen && selectedParcel && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box max-w-4xl">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="font-bold text-2xl">Assign Rider</h3>

                <p className="text-gray-500 mt-1">
                  Select a rider for this parcel.
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            {/* Selected Parcel Information */}
            <div className="bg-base-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-3">Parcel Information</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500">Parcel:</span>{" "}
                  <span className="font-medium">
                    {selectedParcel.parcelTitle} {selectedParcel.parcelName}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">Tracking ID:</span>{" "}
                  <span className="font-medium">
                    {selectedParcel.trackingId}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">Service Center:</span>{" "}
                  <span className="font-medium">
                    {selectedParcel.serviceCenter ||
                      selectedParcel.senderCenter ||
                      selectedParcel.senderDistrict}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">Receiver:</span>{" "}
                  <span className="font-medium">
                    {selectedParcel.receiverName}
                  </span>
                </div>
              </div>
            </div>

            {/* Rider Section */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Available Riders</h4>

              {loadingRiders ? (
                <div className="flex justify-center items-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : riders.length === 0 ? (
                <div className="text-center bg-base-200 rounded-lg py-8">
                  <p className="text-gray-500">
                    No eligible riders found for this service center.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>District</th>
                        <th>Bike</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {riders.map((rider, index) => (
                        <tr key={rider._id}>
                          <td>{index + 1}</td>

                          <td>
                            <p className="font-semibold">{rider.name}</p>
                          </td>

                          <td>{rider.email}</td>

                          <td>{rider.phone}</td>

                          <td>{rider.region}</td>

                          <td>{rider.bikeBrand}</td>

                          <td>
                            <button
                              className="btn btn-sm bg-[#CAEB66] border-none text-black hover:bg-[#b9dc55]"
                              onClick={() => {
                                assignRider({
                                  parcelId: selectedParcel._id,
                                  rider,
                                });
                              }}
                            >
                              Assign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Close */}
            <div className="modal-action">
              <button onClick={handleCloseModal} className="btn">
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default AssignRider;
