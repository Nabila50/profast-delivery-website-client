 
import { useState } from "react";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ActiveRiders = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const axiosSecure = useAxiosSecure();

  // Load active riders
  const {
    data: riders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["activeRiders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/riders/active-riders");
      return res.data;
    },
  });

  // Deactivate rider
  const deactivateMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.patch(
        `/riders/${id}/status`,
        {
          status: "inactive",
        }
      );

      return res.data;
    },

    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Rider Deactivated",
        text: "The rider has been deactivated successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      // Reload active riders
      queryClient.invalidateQueries({
        queryKey: ["activeRiders"],
      });
    },

    onError: (error) => {
      console.error("Deactivate rider error:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to deactivate rider.",
      });
    },
  });

  // Deactivate confirmation
  const handleDeactivate = (rider) => {
    Swal.fire({
      title: "Deactivate Rider?",
      text: `Are you sure you want to deactivate ${rider.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Deactivate",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        deactivateMutation.mutate(rider._id);
      }
    });
  };

  // Search by name
  const filteredRiders = riders.filter((rider) =>
    rider.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Active Riders</h2>

        <p className="text-gray-500 mt-1">
          View and manage all currently active riders.
        </p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search rider by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full md:w-96"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="alert alert-error">
          <span>Failed to load active riders.</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filteredRiders.length === 0 && (
        <div className="rounded-lg bg-base-200 px-4 py-12 text-center sm:py-16">
          <h3 className="text-xl font-semibold">
            {search ? "No Rider Found" : "No Active Riders"}
          </h3>

          <p className="text-gray-500 mt-2">
            {search
              ? "No active rider matches your search."
              : "There are currently no active riders."}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && filteredRiders.length > 0 && (
        <div className="overflow-x-auto bg-base-100 rounded-lg shadow py-12 sm:py-16">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Bike</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRiders.map((rider, index) => (
                <tr key={rider._id}>
                  {/* Number */}
                  <td>{index + 1}</td>

                  {/* Name + Email */}
                  <td>
                    <div className="font-semibold">{rider.name}</div>
                    <div className="text-sm text-gray-500">
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
                  <td>
                    <div>{rider.bikeBrand}</div>
                    <div className="text-sm text-gray-500">
                      {rider.bikeRegistrationNumber}
                    </div>
                  </td>

                  {/* Experience */}
                  <td>{rider.ridingExperience || 0} years</td>

                  {/* Status */}
                  <td>
                    <span className="badge badge-success text-white">
                      {rider.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td>
                    <button
                      onClick={() => handleDeactivate(rider)}
                      disabled={deactivateMutation.isPending}
                      className="btn btn-sm btn-error text-white"
                    >
                      {deactivateMutation.isPending
                        ? "Deactivating..."
                        : "Deactivate"}
                    </button>
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

export default ActiveRiders;
 