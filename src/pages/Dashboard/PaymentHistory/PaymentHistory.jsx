import React from 'react';
import useAuth from '../../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';


const PaymentHistory = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();

    const {isPending, data: payments = []} = useQuery({
        queryKey: ['payments', user.email],
        queryFn: async() =>{
            const res = await axiosSecure.get(`/payments?email=${user.email}`);
            return res.data;
        }
    })

    if(isPending){
        return '............Loading..........'
    }

  return (
     <div className="w-full overflow-x-auto rounded-xl bg-base-100 shadow">
      <table className="table">

        {/* Table Head */}
        <thead>
          <tr>
            <th>#</th>
            <th>Payment Date</th>
            <th>Parcel ID</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Transaction ID</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="py-10 text-center"
              >
                No payment history found.
              </td>
            </tr>
          ) : (
            payments.map((payment, index) => (
              <tr key={payment._id}>

                {/* Serial */}
                <th>{index + 1}</th>

                {/* Payment Date */}
                <td>
                  <p className="font-medium">
                    {new Date(
                      payment.paid_at
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  <p className="text-xs text-base-content/60">
                    {new Date(
                      payment.paid_at
                    ).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </td>

                {/* Parcel ID */}
                <td>
                  <span className="font-mono text-sm">
                    {payment.parcelId}
                  </span>
                </td>
 
                {/* Amount */}
                <td>
                  <span className="font-semibold">
                    ৳{payment.amount}
                  </span>
                </td>

                {/* Payment Method */}
                <td>
                  <span className="badge badge-primary text-black capitalize">
                    {payment.paymentMethod}
                  </span>
                </td>

                {/* Transaction ID */}
                <td>
                  <span className="font-mono text-sm">
                    {payment.transactionId}
                  </span>
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};


export default PaymentHistory;