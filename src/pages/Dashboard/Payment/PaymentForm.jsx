import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
import Swal from "sweetalert2";
import useTrackingLogger from "../../../hooks/useTrackingLogger";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { parcelId } = useParams();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const { logTracking } = useTrackingLogger();
  console.log(parcelId);
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  // *----load data----
  const {
    isPending,
    isError,
    error: queryError,
    data: parcelInfo = {}
  } = useQuery({
    queryKey: ["parcels", parcelId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/parcels/${parcelId}`);
      return res.data;
    },
  });

  if (isPending) {
    return "....loading";
  }

  if (isError) {
    return <span>Error: {queryError?.message}</span>;
  }

  console.log(parcelInfo);
  const amount = parcelInfo.data.cost;
  const amountInCents = amount * 100;
  console.log(amountInCents);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    const card = elements.getElement(CardElement);

    if (!card) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      setError(error.message);
    } else {
      setError("");
      console.log("Payment Method", paymentMethod);

      // ! create payment intent----
      // step-2: create payment intent
      const res = await axiosSecure.post("/create-payment-intent", {
        amountInCents,
        parcelId,
      });
      const clientSecret = res.data.clientSecret;

      // step-3: Confirm Payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.displayName,
            email: user.email,
          },
        },
      });
      if (result.error) {
        setError(result.error.message);
      } else {
        setError("");
        if (result.paymentIntent.status === "succeeded") {
          console.log("Payment succeeded!!!!");
          const transactionId = result.paymentIntent.id;

          // ´step-4 marks parel paid also create payment history.
          const paymentData = {
            parcelId,
            email: user.email,
            amount,
            transactionId: transactionId,
            paymentMethod: result.paymentIntent.payment_method_types,
          };

          const paymentRes = await axiosSecure.post("/payments", paymentData);
          if (paymentRes.data.insertedId) {
            // shwo sweetalert with transation id
            await Swal.fire({
              icon: "success",
              title: "Payment Successful!",
              html: `<strong> Transation Id: </strong> <code>${transactionId}</code>`,
              confirmButtonText: "Go to My Parcels",
            });

            await logTracking({
              tracking_id: parcelInfo.data?.tracking_id,
              status: "Payment_done",
              details: `paid by ${user.name}`,
              updated_by: user.email,
            });

            // redirect to myparcels
            navigate("/dashboard/myParcels");
          }
        }
      }
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-lime-50 p-6 rounded-xl shadow-md w-200 mx-auto"
      >
        <CardElement className="p-2 border rounded w-full mx-auto"></CardElement>
        <button
          type="submit"
          disabled={!stripe}
          className="btn btn-primary w-full mt-5 text-black"
        >
          Pay ${amount}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};
export default PaymentForm;
