import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";

const TrackParcel = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [searchId, setSearchId] = useState(trackingId || "");

  // Get tracking information
  const {
    data: trackingUpdates = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tracking", trackingId],

    queryFn: async () => {
      const res = await axiosSecure.get(
        `/tracking/${trackingId}`
      );

      return res.data;
    },

    enabled: !!trackingId,
  });

  // Search tracking ID
  const handleSearch = (e) => {
    e.preventDefault();

    const id = searchId.trim();

    if (!id) {
      Swal.fire({
        icon: "warning",
        title: "Tracking ID Required",
        text: "Please enter a tracking ID.",
      });

      return;
    }

    navigate(`/dashboard/track/${id}`);
  };

  return (
    <div className="min-h-screen bg-base-200 px-4 py-8 md:px-6">

      {/* Page Header */}
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          Track Your Parcel
        </h1>

        <p className="mt-2 text-base-content/60">
          Enter your tracking ID to see the latest status
          and delivery updates of your parcel.
        </p>
      </div>

      {/* Search Box */}
      <div className="mx-auto mt-8 max-w-2xl">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter tracking ID"
            className="input input-bordered w-full"
          />

          <button
            type="submit"
            className="btn btn-primary sm:px-8"
          >
            Track Parcel
          </button>
        </form>
      </div>

      {/* Tracking Result */}
      {trackingId && (
        <div className="mx-auto mt-10 max-w-4xl">

          {/* Tracking ID Card */}
          <div className="mb-6 rounded-xl bg-base-100 p-5 shadow">
            <p className="text-sm text-base-content/60">
              Tracking ID
            </p>

            <h2 className="mt-1 font-mono text-xl font-bold">
              {trackingId}
            </h2>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="alert alert-error">
              <span>
                Tracking information could not be found.
              </span>
            </div>
          )}

          {/* No Updates */}
          {!isLoading &&
            !isError &&
            trackingUpdates.length === 0 && (
              <div className="rounded-xl bg-base-100 p-10 text-center shadow">
                <h3 className="text-xl font-semibold">
                  No Tracking Updates
                </h3>

                <p className="mt-2 text-base-content/60">
                  No tracking information is available
                  for this parcel yet.
                </p>
              </div>
            )}

          {/* Timeline */}
          {!isLoading &&
            !isError &&
            trackingUpdates.length > 0 && (
              <div className="rounded-xl bg-base-100 p-6 shadow md:p-8">

                <h2 className="mb-8 text-2xl font-bold">
                  Parcel Tracking
                </h2>

                <ul className="timeline timeline-vertical">

                  {trackingUpdates.map(
                    (update, index) => (
                      <li key={update._id}>

                        {/* Top line */}
                        {index !== 0 && (
                          <hr />
                        )}

                        {/* Timeline Icon */}
                        <div className="timeline-start">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                              index ===
                              trackingUpdates.length - 1
                                ? "bg-success"
                                : "bg-primary"
                            }`}
                          >
                            {index + 1}
                          </div>
                        </div>

                        {/* Timeline Content */}
                        <div className="timeline-end mb-10 w-full">

                          <div className="rounded-lg border border-base-300 p-4">

                            {/* Status */}
                            <div className="flex flex-wrap items-center justify-between gap-2">

                              <h3 className="text-lg font-bold">
                                {update.title}
                              </h3>

                              <span className="badge badge-primary capitalize">
                                {update.status.replace(
                                  /_/g,
                                  " "
                                )}
                              </span>

                            </div>

                            {/* Description */}
                            <p className="mt-2 text-base-content/70">
                              {update.description}
                            </p>

                            {/* Location */}
                            {update.location && (
                              <p className="mt-3 text-sm">
                                <span className="font-semibold">
                                  Location:
                                </span>{" "}
                                {update.location}
                              </p>
                            )}

                            {/* Date */}
                            <p className="mt-1 text-sm text-base-content/50">
                              {new Date(
                                update.updatedAt
                              ).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}{" "}
                              •{" "}
                              {new Date(
                                update.updatedAt
                              ).toLocaleTimeString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>

                          </div>

                        </div>

                        {/* Bottom line */}
                        {index !==
                          trackingUpdates.length - 1 && (
                          <hr />
                        )}

                      </li>
                    )
                  )}

                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TrackParcel;