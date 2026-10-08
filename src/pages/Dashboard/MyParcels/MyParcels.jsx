// import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import ParcelTable from "./ParcelTable";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
// import ParcelTable from "../../../components/ParcelTable/ParcelTable";

const MyParcels = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const { data: parcels = [], refetch, isLoading} = useQuery({
    queryKey: ["my-parcels", user?.email],

    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels?email=${user.email}`);

      return res.data;
    },

    enabled: !!user?.email,
  });

  // -----------------------------
  // VIEW
  // -----------------------------

  const handleView = (parcel) => {
    console.log("View parcel:", parcel);

    // Later:
    // navigate(`/dashboard/parcels/${parcel._id}`);
  };

  // -----------------------------
  // EDIT
  // -----------------------------

  const handleEdit = (parcel) => {
    console.log("Edit parcel:", parcel);

    // Later:
    // navigate(`/dashboard/parcels/edit/${parcel._id}`);
  };

  // -----------------------------
  // PAY
  // -----------------------------

  const handlePay = (id) => {
    console.log("Proceed to payment for", id);
    navigate(`/dashboard/payment/${id}`)

    // Later:
    // navigate(`/dashboard/payment/${parcel._id}`);
  };
  //*---------- DELETE------------

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
    title: "Are you sure?",
    text: `Do you want to delete "${id.parcelTitle}"?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
  });

  if(confirm.isConfirmed){
    try{
      axiosSecure.delete(`/parcels/${id}`)
      .then(res => {
        console.log(res.data);
        if(res.data.deletedCount){
          Swal.fire({
            title: "Deleted!",
            text: "Parcel has been deleted",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          })
        }

        refetch();

      })
    }catch(err){
      Swal.fire("Error", err.message || "Failed to delete parcel", "error")
    }
  }

 };
    // -----------------------------
    // LOADING
    // -----------------------------

    if (isLoading) {
      return (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      );
    }
 
  return (
    <div className="p-4 md:p-6">
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold">My Parcels</h2>

        <p className="mt-1 text-base-content/60">
          View and manage all your parcels.
        </p>
      </div>

      {/* Parcel Count */}
      <div className="mb-4">
        <p className="text-base-content/70">
          Total Parcels: <span className="font-bold">{parcels.length}</span>
        </p>
      </div>

      {/* Parcel Table */}
      <ParcelTable
        parcels={parcels}
        onView={handleView}
        onEdit={handleEdit}
        onPay={handlePay}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default MyParcels;
