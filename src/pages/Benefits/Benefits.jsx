import tracking from "../../assets/live-tracking.png";
import delivery from "../../assets/safe-delivery.png";
import support from "../../assets/safe-delivery.png";
import BenefitCard from "./BenefitCard";

const benefits = [
  {
    id: 1,
    image: tracking,
    title: "Live Parcel Tracking",
    description:
      "Stay updated in real-time with our live parcel tracking feature. From pick-up to delivery, monitor your shipment's journey and get instant status updates for complete peace of mind.",
  },
  {
    id: 2,
    image: delivery,
    title: "100% Safe Delivery",
    description:
      "We ensure your parcels are handled with the utmost care and delivered securely to their destination. Our reliable process guarantees safe and damage-free delivery every time.",
  },
  {
    id: 3,
    image: support,
    title: "24/7 Call Center Support",
    description:
      "Our dedicated support team is available around the clock to assist you with any questions, updates, or delivery concerns—anytime you need us.",
  },
];

const Benefits = () => {
  return (
    <div data-aos="zoom-out" className="py-16 bg-base-200">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 font-urbanist text-[#CAEB66]">
          Why Choose Us
        </h2>

        <div className="space-y-6">
          {benefits.map((benefit) => (
            <BenefitCard 
              key={benefit.id} 
              benefit={benefit} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Benefits;