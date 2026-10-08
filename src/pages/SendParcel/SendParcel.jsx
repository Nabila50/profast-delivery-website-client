import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import { useLoaderData, useNavigate } from "react-router";

import Swal from "sweetalert2";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const generateTrackingID = () => {
  const date = new Date();
  const datePart = date.toISOString().split("T")[0].replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PCL-${datePart}-${rand}`;
};

const SendParcel = () => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm();

  const { user } = useAuth();

  const axiosSecure = useAxiosSecure();
  const serviceCenters = useLoaderData();
  const navigate = useNavigate()
  // extract unique regions

  const uniqueRegions = [...new Set(serviceCenters.map((w) => w.region))];

  // get districts by region
  const getDistrictsByRegion = (region) =>
    serviceCenters.filter((w) => w.region === region).map((w) => w.district);

  const parcelType = watch("parcelType");
  const senderRegion = watch("senderRegion");
  const receiverRegion = watch("receiverRegion");

  // const [cost, setCost] = useState(null);

  const onSubmit = (data) => {
    const weight = parseFloat(data.parcelWeight) || 0;

    // Compare district, not service center
    const isSameDistrict = data.senderDistrict === data.receiverDistrict;

    let baseCost = 0;
    let extraWeightCost = 0;
    let totalCost = 0;

    // -----------------------------
    // DOCUMENT
    // -----------------------------
    if (data.parcelType === "document") {
      baseCost = isSameDistrict ? 60 : 80;
      totalCost = baseCost;
    }

    // -----------------------------
    // NON-DOCUMENT
    // -----------------------------
    else if (data.parcelType === "non-document") {
      if (weight <= 3) {
        baseCost = isSameDistrict ? 110 : 150;
      } else {
        // Extra charge: ৳40 per kg after 3 kg
        baseCost = isSameDistrict ? 110 : 150;

        const extraKg = weight - 3;
        extraWeightCost = extraKg * 40;
      }

      totalCost = baseCost + extraWeightCost;
    }

    Swal.fire({
      title: "Delivery Cost Breakdown",

      html: `
    <div class="text-left">

      <!-- Parcel Information -->
      <div class="mb-4 border-b pb-3">
        <p class="text-lg font-semibold mb-2">
          Parcel Information
        </p>

        <div class="flex justify-between">
          <span>Parcel Type:</span>
          <strong>
            ${data.parcelType === "document" ? "Document" : "Non-Document"}
          </strong>
        </div>

        ${
          data.parcelType === "non-document"
            ? `
              <div class="flex justify-between">
                <span>Weight:</span>
                <strong>${weight} kg</strong>
              </div>
            `
            : ""
        }
      </div>

      <!-- Delivery Information -->
      <div class="mb-4 border-b pb-3">
        <p class="text-lg font-semibold mb-2">
          Delivery Information
        </p>

        <div class="flex justify-between">
          <span>From:</span>
          <strong>${data.senderDistrict}</strong>
        </div>

        <div class="flex justify-between">
          <span>To:</span>
          <strong>${data.receiverDistrict}</strong>
        </div>

        <div class="flex justify-between mt-2">
          <span>Delivery Type:</span>
          <strong>
            ${isSameDistrict ? "Within District" : "Outside District"}
          </strong>
        </div>
      </div>

      <!-- Cost Breakdown -->
      <div class="mb-4 border-b pb-3">
        <p class="text-lg font-semibold mb-2">
          Cost Breakdown
        </p>

        <div class="flex justify-between">
          <span>Base Delivery Charge:</span>
          <strong>৳${baseCost}</strong>
        </div>

        ${
          extraWeightCost > 0
            ? `
              <div class="flex justify-between">
                <span>Extra Weight Charge:</span>
                <strong>৳${extraWeightCost}</strong>
              </div>

              <p class="text-sm text-gray-500 mt-1">
                ৳40 × ${(weight - 3).toFixed(2)} kg extra
              </p>
            `
            : ""
        }
      </div>

      <!-- Total -->
      <div class="flex justify-between text-xl font-bold">
        <span>Total Delivery Cost:</span>

        <span class="text-green-600">
          ৳${totalCost}
        </span>
      </div>

    </div>
  `,

      icon: "info",

      showCancelButton: true,

      confirmButtonText: "Proceed to Payment",

      cancelButtonText: "Continue Editing",

      confirmButtonColor: "#16a34a",

      cancelButtonColor: "#6b7280",

      reverseButtons: true,

      customClass: {
        popup: "rounded-xl shadow-lg px-6 py-8",
      },
    }).then((result) => {
      // --------------------------------
      // CONTINUE EDITING
      // --------------------------------

      if (result.dismiss === Swal.DismissReason.cancel) {
        // Simply close the popup.
        // User can continue editing the form.

        return;
      }

      // --------------------------------
      // PROCEED TO PAYMENT
      // --------------------------------

      if (result.isConfirmed) {
        const parcelData = {
          ...data,
          cost: totalCost,
          createdByEmail: user.email,
          payment_status: "unpaid",
          delivery_status: "not_collected",
          creation_date: new Date().toISOString(),
          tracking_id: generateTrackingID(),
        };

        console.log("Proceeding to payment:", parcelData);

        // --------------------------------
        // PAYMENT WILL GO HERE
        // --------------------------------

        axiosSecure.post("/parcels", parcelData).then((res) => {
          console.log(res.data);
          if (res.data.insertedId) {
           
            Swal.fire({
              title: "Redirecting....",
              text: "Proceeding to payment gateway.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
             // TODO: Redirect to a payment page
             navigate('/dashboard/myParcels')
          }
        });

        // Example:
        // navigate("/payment", {
        //   state: {
        //     parcel: parcelData
        //   }
        // });
      }
    });
  };


  return (
    <div className="my-15 bg-lime-50 px-10 py-10 rounded-2xl">
      {/* <Toaster/> */}
      <h2 className="text-3xl font-bold text-black">Send A Parcel</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-12 p-4 text-black">
        {/* parcel type*/}
        <div>
          <label className="label mr-4">
            <input
              type="radio"
              {...register("parcelType")}
              value="document"
              className="radio"
              defaultChecked
            />
            Document
          </label>
          <label className="label">
            <input
              type="radio"
              {...register("parcelType")}
              value="non-document"
              className="radio"
            />
            Non-Document
          </label>
        </div>

        {/* parcel info: name, weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-8">
          <fieldset className="fieldset">
            <label className="label">Parcel Name</label>
            <input
              type="text"
              {...register("parcelName")}
              className="input w-full bg-white border-black"
              placeholder="Parcel Name"
            />
          </fieldset>
          <fieldset className="fieldset">
            <label className="label">Parcel Weight (kg)</label>
            <input
              type="number"
              {...register("parcelWeight")}
              className="input w-full bg-white border-black"
              placeholder="Parcel Weight"
            />
          </fieldset>
        </div>

        {/* two column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* sender Details */}

          <fieldset className="fieldset">
            <h4 className="text-2xl font-semibold">Sender Details</h4>
            {/* sender name */}
            <label className="label text-black">Sender Name</label>
            <input
              type="text"
              {...register("senderName")}
              defaultValue={user?.displayName}
              className="input w-full bg-white border-black"
              placeholder="Sender Name"
            />

            {/* sender email */}
            <label className="label text-black">Sender Email</label>
            <input
              type="text"
              {...register("senderEmail")}
              defaultValue={user?.email}
               className="input w-full bg-white border-black"
              placeholder="Sender Email"
            />

            {/* sender region */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-black">Sender Regions</legend>
              <select
                {...register("senderRegion")}
                defaultValue="Pick a region"
                className="select bg-white border-black"
             
                
              >
                <option disabled={true}>Pick a region</option>
                {uniqueRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* sender districts */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-black">Sender Districts</legend>
              <select
                {...register("senderDistrict")}
                defaultValue="Pick a district"
                className="select bg-white border-black"
               
              >
                <option disabled={true}>Pick a district</option>
                {getDistrictsByRegion(senderRegion).map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* sender address */}
            <label className="label mt-4 text-black">Sender Address</label>
            <input
              type="text"
              {...register("senderAddress")}
              className="input w-full bg-white border-black"
              placeholder="Sender Address"
            />
          </fieldset>
          {/* receiver Details */}
          <fieldset className="fieldset">
            <h4 className="text-2xl font-semibold">Receiver Details</h4>
            {/* receiver name */}
            <label className="label text-black">Receiver Name</label>
            <input
              type="text"
              {...register("receiverName")}
              className="input w-full bg-white border-black"
              placeholder="Receiver Name"
            />

            {/* receiver email */}
            <label className="label text-black">Receiver Email</label>
            <input
              type="text"
              {...register("receiverEmail")}
                   className="input w-full bg-white border-black"
              placeholder="Receiver Email"
            />

            {/* receiver region */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-black">Receiver Regions</legend>
              <select
                {...register("receiverRegion")}
                defaultValue="Pick a region"
                className="select bg-white border-black"
              >
                <option disabled={true}>Pick a region</option>
                {uniqueRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* receiver district */}
            <fieldset className="fieldset">
              <legend className="fieldset-legend text-black">Receiver District</legend>
              <select
                {...register("receiverDistrict")}
                defaultValue="Pick a district"
                className="select bg-white border-black"
                
              >
                <option disabled={true}>Pick a district</option>
                {getDistrictsByRegion(receiverRegion).map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </fieldset>

            {/* receiver address */}
            <label className="label mt-4 text-black">Receiver Address</label>
            <input
              type="text"
              {...register("receiverAddress")}
              className="input w-full bg-white border-black"
              placeholder="Receiver Address"
            />
          </fieldset>
        </div>

        <div className="flex justify-center mt-5">
          {/* {cost !== null && (
          <div className="text-right">
            <p className="text-lg font-semibold">
              Delivery Cost: ৳{cost}
            </p>
          </div>
        )} */}

          <button type="submit" className="btn btn-primary px-10 text-black">
            Send Parcel
          </button>
        </div>

        {/* Optional cost display */}
      </form>
    </div>
  );
};

export default SendParcel;
