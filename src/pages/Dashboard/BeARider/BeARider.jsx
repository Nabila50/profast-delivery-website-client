import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import { useLoaderData } from "react-router";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const BeARider = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const serviceCenters = useLoaderData();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [selectedRegion, setSelectedRegion] = useState("");
  // Get unique regions
  const regions = [...new Set(serviceCenters.map((s) => s.region))];

  // get districts based on selected region
  const districts = serviceCenters
    .filter((s) => s.region === selectedRegion)
    .map((s) => s.district);

  // When region changes, find related districts
  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  const onSubmit = async (data) => {
    const riderData = {
      ...data,

      // Firebase user information
      name: user?.displayName || "",
      email: user?.email || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    console.log("Rider Application:", riderData);

    // sending data to the backend
    axiosSecure.post("/riders", riderData).then((res) => {
      if (res.data.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Application Submitted",
          text: "Your rider application has been submitted and is pending approval.",
        });
      }
    });

    reset();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Be a Rider</h2>

        <p className="mt-2 text-gray-500">
          Join our delivery team and earn by delivering parcels.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Personal Information */}
        <div className="card bg-base-100 shadow-md border border-base-200">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Name</span>
                </label>

                <input
                  type="text"
                  // value={user?.displayName || ""}
                  // readOnly
                  className="input input-bordered w-full bg-base-200 text-white"
                />
              </div>

              {/* Email */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>

                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="input input-bordered w-full bg-base-200"
                />
              </div>

              {/* Age */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Age</span>
                </label>

                <input
                  type="number"
                  placeholder="Enter your age"
                  className="input input-bordered w-full"
                  {...register("age", {
                    required: "Age is required",
                    min: {
                      value: 18,
                      message: "You must be at least 18 years old",
                    },
                  })}
                />

                {errors.age && (
                  <p className="text-error text-sm mt-1">
                    {errors.age.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Phone Number</span>
                </label>

                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="input input-bordered w-full"
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
                />

                {errors.phone && (
                  <p className="text-error text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* NID */}
              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">
                    National ID Card Number
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="Enter your NID number"
                  className="input input-bordered w-full"
                  {...register("nid", {
                    required: "NID number is required",
                  })}
                />

                {errors.nid && (
                  <p className="text-error text-sm mt-1">
                    {errors.nid.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="card bg-base-100 shadow-md border border-base-200 mt-6">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-4">Location Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Region */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Region</span>
                </label>

                <select
                  className="select select-bordered w-full"
                  {...register("region", {
                    required: "Region is required",
                  })}
                  onChange={handleRegionChange}
                >
                  <option value="">Select Region</option>

                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>

                {errors.region && (
                  <p className="text-error text-sm mt-1">
                    {errors.region.message}
                  </p>
                )}
              </div>

              {/* District */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">District</span>
                </label>

                <select
                  className="select select-bordered w-full"
                  {...register("district", {
                    required: "District is required",
                  })}
                >
                  <option value="">Select District</option>

                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>

                {errors.district && (
                  <p className="text-error text-sm mt-1">
                    {errors.district.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">
                    Current Address
                  </span>
                </label>

                <textarea
                  placeholder="Enter your current address"
                  className="textarea textarea-bordered w-full"
                  rows="3"
                  {...register("address", {
                    required: "Address is required",
                  })}
                />

                {errors.address && (
                  <p className="text-error text-sm mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bike Information */}
        <div className="card bg-base-100 shadow-md border border-base-200 mt-6">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-4">Bike Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Bike Brand */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">Bike Brand</span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. Honda, Yamaha"
                  className="input input-bordered w-full"
                  {...register("bikeBrand", {
                    required: "Bike brand is required",
                  })}
                />

                {errors.bikeBrand && (
                  <p className="text-error text-sm mt-1">
                    {errors.bikeBrand.message}
                  </p>
                )}
              </div>

              {/* Bike Registration */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Bike Registration Number
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="Enter registration number"
                  className="input input-bordered w-full"
                  {...register("bikeRegistrationNumber", {
                    required: "Bike registration number is required",
                  })}
                />

                {errors.bikeRegistrationNumber && (
                  <p className="text-error text-sm mt-1">
                    {errors.bikeRegistrationNumber.message}
                  </p>
                )}
              </div>

              {/* Driving License */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Driving License Number
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="Enter driving license number"
                  className="input input-bordered w-full"
                  {...register("drivingLicenseNumber", {
                    required: "Driving license number is required",
                  })}
                />

                {errors.drivingLicenseNumber && (
                  <p className="text-error text-sm mt-1">
                    {errors.drivingLicenseNumber.message}
                  </p>
                )}
              </div>

              {/* Years of Riding Experience */}
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Riding Experience (Years)
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 3"
                  className="input input-bordered w-full"
                  {...register("ridingExperience", {
                    required: "Riding experience is required",
                    min: {
                      value: 0,
                      message: "Experience cannot be negative",
                    },
                  })}
                />

                {errors.ridingExperience && (
                  <p className="text-error text-sm mt-1">
                    {errors.ridingExperience.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card bg-base-100 shadow-md border border-base-200 mt-6">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-4">
              Additional Information
            </h3>

            <div>
              <label className="label">
                <span className="label-text font-medium">
                  Additional Information
                </span>
              </label>

              <textarea
                placeholder="Tell us anything else that may be relevant to your rider application..."
                className="textarea textarea-bordered w-full"
                rows="4"
                {...register("additionalInfo")}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button type="submit" className="btn btn-primary px-8 text-black">
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default BeARider;
