const ServiceCard = ({ icon, title, description }) => {
  return (
    <div
      className="
        group
        card
        bg-white
        border
        border-gray-200
        shadow-md
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-xl
        hover:bg-[#CAEB66]
        hover:border-[#CAEB66]
      "
    >
      <div className="card-body">
        {/* Icon */}
        <div
          className="
            w-16
            h-16
            rounded-xl
            flex
            items-center
            justify-center
            text-3xl
            mb-5
            bg-[#CAEB66]
            text-gray-900
            transition-all
            duration-300
            group-hover:bg-white
            group-hover:scale-110
          "
        >
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-700 leading-7">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard;