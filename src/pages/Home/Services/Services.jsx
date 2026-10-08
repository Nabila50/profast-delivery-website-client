import ServiceCard from "./ServiceCard";

import {
  FaShippingFast,
  FaGlobeAsia,
  FaWarehouse,
  FaMoneyBillWave,
  FaBuilding,
  FaUndoAlt,
} from "react-icons/fa";

const OurServices = () => {
  return (
    <section className="py-20 bg-base-100">
      <div className="max-w-7xl mx-auto px-5">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-4xl font-bold mb-5 text-primary">
            Our Services
          </h2>

          <p className="text-base-content/70 text-lg leading-8">
            Enjoy fast, reliable parcel delivery with real-time tracking and
            zero hassle. From personal packages to business shipments—we
            deliver on time, every time.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          <ServiceCard
            icon={<FaShippingFast />}
            title="Express & Standard Delivery"
            description="We deliver parcels within 24–72 hours in Dhaka, Chittagong, Sylhet, Khulna, and Rajshahi. Express delivery available in Dhaka within 4–6 hours from pick-up to drop-off."
          />

          <ServiceCard
            icon={<FaGlobeAsia />}
            title="Nationwide Delivery"
            description="We deliver parcels nationwide with home delivery in every district, ensuring your products reach customers within 48–72 hours."
          />

          <ServiceCard
            icon={<FaWarehouse />}
            title="Fulfillment Solution"
            description="We also offer customized service with inventory management support, online order processing, packaging, and after sales support."
          />

          <ServiceCard
            icon={<FaMoneyBillWave />}
            title="Cash on Home Delivery"
            description="100% cash on delivery anywhere in Bangladesh with guaranteed safety of your product."
          />

          <ServiceCard
            icon={<FaBuilding />}
            title="Corporate Service / Contract In Logistics"
            description="Customized corporate services which includes warehouse and inventory management support."
          />

          <ServiceCard
            icon={<FaUndoAlt />}
            title="Parcel Return"
            description="Through our reverse logistics facility we allow end customers to return or exchange their products with online business merchants."
          />

        </div>
      </div>
    </section>
  );
};

export default OurServices;