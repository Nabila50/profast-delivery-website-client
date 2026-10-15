import { NavLink, Outlet } from "react-router";
import ProFastLogo from "../pages/shared/ProFastLogo/ProFastLogo";
import {
  FiHome,
  FiPackage,
  FiCreditCard,
  FiMapPin,
  FiUser,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import {
  FaCheckCircle,
  FaMoneyBillWave,
  FaMotorcycle,
  FaTruckLoading,
  FaUserShield,
} from "react-icons/fa";
import useUserRole from "../hooks/useUserRole";

const DashboardLayout = () => {
  const { role, roleLoading } = useUserRole();
  console.log("Role is here: ", role);

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col w-full min-w-0">
        {/* Page content here */}
        <div className="navbar bg-base-300 w-full lg:hidden">
          <div className="flex-none">
            <label
              htmlFor="my-drawer-2"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost drawer-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div className="mx-2 flex-1 px-2 lg:hidden">Dashboard</div>
        </div>
        {/*page content here*/}
        <Outlet></Outlet>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 min-h-full w-80 p-4">
          {/* Sidebar content here */}
          <ProFastLogo></ProFastLogo>
          <li>
            <NavLink to="/dashboard">
              <FiHome />
              <span>Home</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/myParcels">
              <FiPackage />
              <span>My Parcels</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/paymentHistory">
              <FiCreditCard />
              <span>Payment History</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/track">
              <FiMapPin />
              <span>Track a Package</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/dashboard/profile">
              <FiUser />
              <span>Update Profile</span>
            </NavLink>
          </li>

          {/* Riders Links */}
          {!roleLoading && role === "rider" && (
            <>
              <li>
                <NavLink to="/dashboard/pending-deliveries">
                  <FaTruckLoading />
                  <span>Pending Deliveries</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/completed-deliveries">
                  <FaCheckCircle />
                  <span>Completed Deliveries</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/my-earnings">
                  <FaMoneyBillWave />
                  <span>My Earnings</span>
                </NavLink>
              </li>
            </>
          )}

          {/* admin Links */}
          {!roleLoading && role === "admin" && (
            <>
              <li>
                <NavLink to="/dashboard/assign-rider">
                  <FaMotorcycle />
                  <span>Assign Riders</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/active-riders">
                  <FiUsers />
                  <span>Active Riders</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/dashboard/pending-riders">
                  <FiUserCheck />
                  <span>Pending Riders</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/makeAdmin">
                  <FaUserShield className="inline-block mr-3" />
                  <span>Make admin</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardLayout;
