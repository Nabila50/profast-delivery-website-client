import { useState } from "react";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { FaCheck, FaEye, FaTimes } from "react-icons/fa";

const PendingRiders = () => {
  const [selectedRider, setSelectedRider] = useState(null);
  const axiosSecure = useAxiosSecure();

  const {
    isPending,
    data: riders = [],
    refetch,
  } = useQuery({
    queryKey: ["pending-riders"],
    queryFn: async () => {
      const res = await axiosSecure.get(
        "/riders/pending-riders"
      );
      return res.data;
    },
  });

  if (isPending) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const handleDecision = async (id, action, email) => {
    const confirm = await Swal.fire({
      title: `${
        action === "approve" ? "Approve" : "Reject"
      } Application?`,

      icon: "warning",

      showCancelButton: true,

      confirmButtonText:
        action === "approve"
          ? "Yes, Approve"
          : "Yes, Reject",

      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      const status =
        action === "approve"
          ? "active"
          : "rejected";

      await axiosSecure.patch(`/riders/${id}/status`, {
        status,
        email,
      });

      await refetch();

      Swal.fire(
        "Success",
        `Rider ${action} successfully`,
        "success"
      );
    } catch (err) {
      console.error(err);

      Swal.fire(
        "Error",
        "Could not update rider status",
        "error"
      );
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Pending Riders
        </h2>

        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          Review and manage rider applications.
        </p>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {riders.length === 0 ? (
        <div className="rounded-lg bg-base-200 px-4 py-12 text-center sm:py-16">
          <h3 className="text-lg font-semibold sm:text-xl">
            No Pending Riders
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 sm:text-base">
            There are currently no rider applications
            waiting for approval.
          </p>
        </div>
      ) : (
        <>
          {/* =================================================
              DESKTOP / TABLET TABLE
          ================================================== */}
          <div className="hidden overflow-x-auto rounded-lg bg-base-100 shadow md:block">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Bike</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {riders.map((rider, index) => (
                  <tr key={rider._id}>
                    {/* Number */}
                    <td>{index + 1}</td>

                    {/* Name */}
                    <td>
                      <div className="font-semibold">
                        {rider.name}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="max-w-xs">
                      <div className="break-all">
                        {rider.email}
                      </div>
                    </td>

                    {/* Phone */}
                    <td>{rider.phone}</td>

                    {/* Location */}
                    <td>
                      <div>{rider.region}</div>

                      <div className="text-sm text-gray-500">
                        {rider.district}
                      </div>
                    </td>

                    {/* Bike */}
                    <td>{rider.bikeBrand}</td>

                    {/* Experience */}
                    <td>
                      {rider.ridingExperience} years
                    </td>

                    {/* Status */}
                    <td>
                      <span className="badge badge-warning">
                        {rider.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex gap-2">
                        {/* View */}
                        <button
                          className="btn btn-sm bg-blue-500 text-black hover:bg-blue-600"
                          onClick={() =>
                            setSelectedRider(rider)
                          }
                          title="View"
                        >
                          <FaEye />
                        </button>

                        {/* Approve */}
                        <button
                          className="btn btn-sm bg-lime-600 text-black hover:bg-lime-700"
                          onClick={() =>
                            handleDecision(
                              rider._id,
                              "approve",
                              rider.email
                            )
                          }
                          title="Approve"
                        >
                          <FaCheck />
                        </button>

                        {/* Reject */}
                        <button
                          className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                          onClick={() =>
                            handleDecision(
                              rider._id,
                              "reject",
                              rider.email
                            )
                          }
                          title="Reject"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* =================================================
              MOBILE CARDS
          ================================================== */}
          <div className="space-y-4 md:hidden">
            {riders.map((rider, index) => (
              <div
                key={rider._id}
                className="w-full rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm"
              >
                {/* Card Header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">
                      Rider #{index + 1}
                    </p>

                    <h3 className="mt-1 break-words text-base font-bold">
                      {rider.name}
                    </h3>
                  </div>

                  <span className="badge badge-warning shrink-0">
                    {rider.status}
                  </span>
                </div>

                {/* Information */}
                <div className="space-y-3">
                  {/* Email */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Email
                    </p>

                    <p className="break-all text-sm font-medium">
                      {rider.email}
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Phone
                    </p>

                    <p className="text-sm font-medium">
                      {rider.phone}
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Location
                    </p>

                    <p className="text-sm font-medium">
                      {rider.region}, {rider.district}
                    </p>
                  </div>

                  {/* Bike */}
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500">
                        Bike
                      </p>

                      <p className="text-sm font-medium">
                        {rider.bikeBrand}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Experience
                      </p>

                      <p className="text-sm font-medium">
                        {rider.ridingExperience} years
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {/* View */}
                  <button
                    className="btn btn-sm bg-blue-500 text-black hover:bg-blue-600"
                    onClick={() =>
                      setSelectedRider(rider)
                    }
                  >
                    <FaEye />
                    <span className="hidden xs:inline">
                      View
                    </span>
                  </button>

                  {/* Approve */}
                  <button
                    className="btn btn-sm bg-lime-600 text-black hover:bg-lime-700"
                    onClick={() =>
                      handleDecision(
                        rider._id,
                        "approve",
                        rider.email
                      )
                    }
                  >
                    <FaCheck />
                    <span className="hidden xs:inline">
                      Approve
                    </span>
                  </button>

                  {/* Reject */}
                  <button
                    className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                    onClick={() =>
                      handleDecision(
                        rider._id,
                        "reject",
                        rider.email
                      )
                    }
                  >
                    <FaTimes />
                    <span className="hidden xs:inline">
                      Reject
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* =====================================================
          RIDER DETAILS MODAL
      ====================================================== */}
      {selectedRider && (
        <dialog
          open
          className="modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedRider(null);
            }
          }}
        >
          <div className="modal-box max-h-[90vh] w-11/12 max-w-3xl overflow-y-auto p-4 sm:p-6">
            {/* Modal Header */}
            <div className="mb-5">
              <h3 className="text-xl font-bold sm:text-2xl">
                Rider Application Details
              </h3>
            </div>

            {/* ================= PERSONAL ================= */}
            <div className="mb-6">
              <h4 className="mb-4 border-b pb-2 text-base font-semibold sm:text-lg">
                Personal Information
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Name
                  </p>
                  <p className="break-words font-medium">
                    {selectedRider.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Email
                  </p>
                  <p className="break-all font-medium">
                    {selectedRider.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Age
                  </p>
                  <p className="font-medium">
                    {selectedRider.age}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Phone
                  </p>
                  <p className="font-medium">
                    {selectedRider.phone}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">
                    National ID Card Number
                  </p>

                  <p className="break-all font-medium">
                    {selectedRider.nid}
                  </p>
                </div>
              </div>
            </div>

            {/* ================= LOCATION ================= */}
            <div className="mb-6">
              <h4 className="mb-4 border-b pb-2 text-base font-semibold sm:text-lg">
                Location Information
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Region
                  </p>

                  <p className="font-medium">
                    {selectedRider.region}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    District
                  </p>

                  <p className="font-medium">
                    {selectedRider.district}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">
                    Current Address
                  </p>

                  <p className="break-words font-medium">
                    {selectedRider.address}
                  </p>
                </div>
              </div>
            </div>

            {/* ================= BIKE ================= */}
            <div className="mb-6">
              <h4 className="mb-4 border-b pb-2 text-base font-semibold sm:text-lg">
                Bike Information
              </h4>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Bike Brand
                  </p>

                  <p className="font-medium">
                    {selectedRider.bikeBrand}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Registration Number
                  </p>

                  <p className="break-all font-medium">
                    {
                      selectedRider.bikeRegistrationNumber
                    }
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Driving License Number
                  </p>

                  <p className="break-all font-medium">
                    {
                      selectedRider.drivingLicenseNumber
                    }
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Riding Experience
                  </p>

                  <p className="font-medium">
                    {selectedRider.ridingExperience} years
                  </p>
                </div>
              </div>
            </div>

            {/* ================= ADDITIONAL ================= */}
            <div className="mb-6">
              <h4 className="mb-4 border-b pb-2 text-base font-semibold sm:text-lg">
                Additional Information
              </h4>

              <p className="break-words text-sm text-gray-700 sm:text-base">
                {selectedRider.additionalInfo ||
                  "No additional information provided."}
              </p>
            </div>

            {/* ================= APPLICATION ================= */}
            <div>
              <h4 className="mb-4 border-b pb-2 text-base font-semibold sm:text-lg">
                Application Information
              </h4>

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <span className="badge badge-warning mt-1">
                  {selectedRider.status}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-sm text-gray-500">
                  Applied At
                </p>

                <p className="break-words font-medium">
                  {selectedRider.created_at
                    ? new Date(
                        selectedRider.created_at
                      ).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* ================= MODAL ACTIONS ================= */}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                className="btn w-full sm:w-auto"
                onClick={() =>
                  setSelectedRider(null)
                }
              >
                Close
              </button>

              <button
                className="btn btn-success w-full text-white sm:w-auto"
                onClick={() =>
                  handleDecision(
                    selectedRider._id,
                    "approve",
                    selectedRider.email
                  )
                }
              >
                Approve Rider
              </button>

              <button
                className="btn btn-error w-full text-white sm:w-auto"
                onClick={() =>
                  handleDecision(
                    selectedRider._id,
                    "reject",
                    selectedRider.email
                  )
                }
              >
                Cancel Application
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default PendingRiders;