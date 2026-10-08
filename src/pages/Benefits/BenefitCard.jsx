const BenefitCard = ({ benefit }) => {
  return (
    <div className="card card-side bg-base-100 shadow-md border border-base-300 hover:drop-shadow-lg">
      
      {/* Left Image */}
      <figure className="p-6 w-40">
        <img
          src={benefit.image}
          alt={benefit.title}
          className="w-24 h-24 object-contain"
        />
      </figure>

      {/* Horizontal Divider */}
      <div className="divider divider-horizontal"></div>

      {/* Right Content */}
      <div className="card-body">
        <h3 className="card-title text-2xl">
          {benefit.title}
        </h3>

        <p className="text-base-content/70">
          {benefit.description}
        </p>
      </div>

    </div>
  );
};

export default BenefitCard;