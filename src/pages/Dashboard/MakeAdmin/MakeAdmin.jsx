import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const MakeAdmin = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [searchEmail, setSearchEmail] = useState("");

  // Search users by email
  const {
    data: searchResult,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["search-users", searchEmail],

    queryFn: async () => {
      const res = await axiosSecure.get(
        `/users/search?email=${searchEmail}`
      );

      return res.data;
    },

    enabled: searchEmail.trim().length > 0,
  });

  const users = searchResult?.data || [];

  // Update user role
  const roleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      const res = await axiosSecure.patch(
        `/users/${id}/role`,
        { role }
      );

      return res.data;
    },

    onSuccess: (data) => {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
        timer: 1500,
        showConfirmButton: false,
      });

      queryClient.invalidateQueries({
        queryKey: ["search-users", searchEmail],
      });
    },

    onError: (error) => {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error?.response?.data?.message ||
          "Failed to update user role.",
      });
    },
  });

  // Make admin / remove admin
  const handleRoleChange = (user) => {
    const newRole =
      user.role === "admin" ? "user" : "admin";

    Swal.fire({
      title:
        newRole === "admin"
          ? "Make this user an admin?"
          : "Remove admin role?",

      text:
        newRole === "admin"
          ? "This user will get admin access."
          : "This user will lose admin access.",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText:
        newRole === "admin"
          ? "Yes, Make Admin"
          : "Yes, Remove Admin",

      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        roleMutation.mutate({
          id: user._id,
          role: newRole,
        });
      }
    });
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h2 className="text-xl font-bold sm:text-2xl">
          Make Admin
        </h2>

        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          Search for a user by email and manage their
          admin role.
        </p>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="mb-8 flex w-full max-w-xl flex-col gap-2 sm:flex-row">
        <input
          type="email"
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) =>
            setSearchEmail(e.target.value)
          }
          className="input input-bordered w-full min-w-0"
        />

        {searchEmail && (
          <button
            onClick={() => setSearchEmail("")}
            className="btn btn-outline w-full sm:w-auto"
          >
            Clear
          </button>
        )}
      </div>

      {/* ================= LOADING ================= */}
      {(isLoading || isFetching) && searchEmail && (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* ================= NO USER ================= */}
      {!isLoading &&
        !isFetching &&
        searchEmail &&
        users.length === 0 && (
          <div className="alert alert-info">
            <span>
              No user found with this email.
            </span>
          </div>
        )}

      {/* ================= RESULTS ================= */}
      {users.length > 0 && (
        <>
          {/* ==========================================
              DESKTOP TABLE
          ========================================== */}
          <div className="hidden w-full overflow-x-auto rounded-lg border border-base-300 bg-base-100 md:block">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id}>
                    {/* Number */}
                    <td>{index + 1}</td>

                    {/* Email */}
                    <td className="max-w-xs truncate">
                      {user.email}
                    </td>

                    {/* Created At */}
                    <td>
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* Role */}
                    <td>
                      <span
                        className={`badge ${
                          user.role === "admin"
                            ? "badge-success"
                            : "badge-ghost"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Action */}
                    <td>
                      <button
                        onClick={() =>
                          handleRoleChange(user)
                        }
                        disabled={
                          roleMutation.isPending
                        }
                        className={`btn btn-sm ${
                          user.role === "admin"
                            ? "btn-error"
                            : "btn-success"
                        }`}
                      >
                        {roleMutation.isPending
                          ? "Updating..."
                          : user.role === "admin"
                          ? "Remove Admin"
                          : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ==========================================
              MOBILE CARDS
          ========================================== */}
          <div className="space-y-4 md:hidden">
            {users.map((user, index) => (
              <div
                key={user._id}
                className="w-full rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm"
              >
                {/* Card Header */}
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    User #{index + 1}
                  </span>

                  <span
                    className={`badge ${
                      user.role === "admin"
                        ? "badge-success"
                        : "badge-ghost"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Email */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm font-medium">
                    {user.email}
                  </p>
                </div>

                {/* Created At */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500">
                    Created At
                  </p>

                  <p className="mt-1 text-sm">
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                {/* Action */}
                <button
                  onClick={() =>
                    handleRoleChange(user)
                  }
                  disabled={roleMutation.isPending}
                  className={`btn btn-sm w-full ${
                    user.role === "admin"
                      ? "btn-error"
                      : "btn-success"
                  }`}
                >
                  {roleMutation.isPending
                    ? "Updating..."
                    : user.role === "admin"
                    ? "Remove Admin"
                    : "Make Admin"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MakeAdmin;