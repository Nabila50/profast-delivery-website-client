import React from "react";

const ParcelTable = ({ parcels, onView, onEdit, onDelete, onPay }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl shadow bg-lime-50">
      <table className="table text-black">
        {/* Table Head */}
        <thead  className=" text-black">
          <tr>
            <th>#</th>
            <th>Parcel Title</th>
            <th>Parcel Type</th>
            <th>Created At</th>
            <th>Cost</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="text-black">
          {parcels.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-10 text-center text-black">
                No parcels found.
              </td>
            </tr>
          ) : (
            parcels.map((parcel, index) => (
              <tr key={parcel._id}>
                {/* Number */}
                <th>{index + 1}</th>

                {/* Parcel Title */}
                {/* Parcel Type */}
                <td>
                  <p className="font-medium text-black">
                    {parcel.parcelName} {parcel.parcelTitle}
                  </p>
                </td>

                {/* Parcel Type */}
                <td>
                  <p className="font-medium capitalize">{parcel.parcelType}</p>                 
                </td>

                {/* Created At */}
                <td>
                  {new Date(parcel.createdAt || parcel.creation_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                {/* Cost */}
                <td>
                  <span className="font-semibold">৳{parcel.cost}</span>
                </td>

                {/* Payment Status */}
                <td>
                  {parcel.status === "paid" ? (
                    <span className="badge badge-success">Paid</span>
                  ) : (
                    <span className="badge badge-warning">Unpaid</span>
                  )}
                </td>

                {/* Actions */}
                {/* Actions */}
                <td>
                  <div className="flex flex-wrap gap-2">
                    {/* View */}
                    <button
                      type="button"
                      onClick={() => onView?.(parcel._id)}
                      className="btn btn-sm btn-info"
                    >
                      View
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onEdit?.(parcel._id)}
                      className="btn btn-sm btn-primary text-black"
                    >
                      Edit
                    </button>

                    {/* Pay / Paid */}
                    <button
                      type="button"
                      onClick={() => onPay?.(parcel._id)}
                      className={`btn btn-sm ${
                        parcel.status === "paid" ? "btn-success" : "btn-warning"
                      }`}
                    >
                      {parcel.status === "paid" ? "Paid" : "Pay"}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDelete?.(parcel._id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ParcelTable;
