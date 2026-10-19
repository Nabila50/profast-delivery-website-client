import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home/Home/Home";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";
import Coverage from "../pages/Coverage/Coverage";
import PrivateRoute from "../routes/PrivateRoute";
import SendParcel from "../pages/SendParcel/SendParcel";
import DashboardLayout from "../layouts/DashboardLayout";
import MyParcels from "../pages/Dashboard/MyParcels/MyParcels";
import Payment from "../pages/Dashboard/Payment/Payment";
import PaymentHistory from "../pages/Dashboard/PaymentHistory/PaymentHistory";
import TrackParcel from "../pages/Dashboard/TrackParcel/TrackParcel";
import BeARider from "../pages/Dashboard/BeARider/BeARider";
import PendingRiders from "../pages/Dashboard/PendingRiders/PendingRiders";
import ActiveRiders from "../pages/Dashboard/ActiveRiders/ActiveRiders";
import MakeAdmin from "../pages/Dashboard/MakeAdmin/MakeAdmin";
import Forbidden from "../pages/Forbidden/Forbidden";
import AdminRoute from "../routes/AdminRoute";
import AssignRider from "../pages/Dashboard/AssignRider/AssignRider";
import RiderRoute from "../routes/RiderRoute";
import PendingDelivery from "../pages/Dashboard/PendingDelivery/PendingDelivery";
import CompletedDeliveries from "../pages/Dashboard/CompletedDeliveries/CompletedDeliveries";
import MyEarnings from "../pages/Dashboard/MyEarnings/MyEarnings";
import DashboardHome from "../pages/Dashboard/DashboardHome/DashboardHome";
// import AssignRider from "../pages/Dashboard/AssignRider/AssignRider";


export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children:[
        {
            index: true,
            Component: Home
        },
        {
          path: 'coverage',
          Component: Coverage,
          loader: ()=> fetch('./warehouses.json')
        },
        {
          path: 'beARider',
          element: <PrivateRoute><BeARider></BeARider></PrivateRoute>,
          loader: () => fetch("./warehouses.json")
        },
        {
          path: 'sendParcel',
          element: <PrivateRoute>
            <SendParcel></SendParcel>
          </PrivateRoute>,
          loader: ()=> fetch("./warehouses.json")
        },
        {
          path: 'forbidden',
          Component: Forbidden
        }
    ]
  },
  {
    path: '/',
    Component: AuthLayout,
    children: [
      {
        path: 'login',
        Component: Login
        
      },
      {
        path: 'register',
        Component: Register
      }
    ]
  },
  {
    path: "/dashboard",
    element: <PrivateRoute>
      <DashboardLayout></DashboardLayout>
    </PrivateRoute>,
    children: [
      {
        index: true,
        Component: DashboardHome

      },
      {
        path: 'myParcels',
        Component: MyParcels
      },
      {
        path: 'payment/:parcelId',
        Component: Payment
      },
      {
        path: 'paymentHistory',
        Component: PaymentHistory
      },
      {
        path: 'track',
        Component: TrackParcel
      },
      {
        path: "track/:trackingId",
        Component: TrackParcel
      },

      //! rider only routes
      {
        path: 'pending-deliveries',
        element: <RiderRoute><PendingDelivery></PendingDelivery></RiderRoute>
      },
      {
        path: 'completed-deliveries',
        element: <RiderRoute><CompletedDeliveries></CompletedDeliveries></RiderRoute>

      },
      {
        path: 'my-earnings',
        element: <RiderRoute><MyEarnings></MyEarnings></RiderRoute>

      },

      // ! Admin Only routes
      {
        path: 'assign-rider',
        element: <AdminRoute><AssignRider></AssignRider></AdminRoute>

      },
      {
        path: "pending-riders",
        element: <AdminRoute><PendingRiders></PendingRiders></AdminRoute>
      },
      {
        path: 'active-riders',
        element: <AdminRoute><ActiveRiders></ActiveRiders></AdminRoute>
      },
      {
        path: 'makeAdmin',
        element: <AdminRoute><MakeAdmin></MakeAdmin></AdminRoute>

      }
    ]
  }
]);