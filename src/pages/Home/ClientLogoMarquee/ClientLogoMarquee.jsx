import { default as Marquee } from "react-fast-marquee";
// import Marquee from "react-fast-marquee/dist/index.es.js";
import amazon_vector from "../../../assets/brands/amazon_vector.png";
import amazon from "../../../assets/brands/amazon.png";
import casio from "../../../assets/brands/casio.png";
import moonstar from "../../../assets/brands/moonstar.png";
import randstad from "../../../assets/brands/randstad.png";
import star from "../../../assets/brands/star.png";
import people from "../../../assets/brands/start_people.png";

const logos = [amazon_vector, amazon, casio, moonstar, randstad, star, people];

const ClientLogoMarquee = () => {
  return (
    <section className="py-20 bg-base-100">
      <div className="max-w-7xl mx-auto px-5">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary">Trusted By</h2>

          <p className="mt-4 text-lg text-base-content/70">
            We are proud to work with leading companies across Bangladesh.
          </p>
        </div>

        {/* Logo Marquee */}
        <Marquee
          speed={50}
          direction="left"
          gradient={false}
          pauseOnHover={true}
          autoFill={true}
        >
          {logos.map((logo, index) => (
            <div key={index} className="mx-12 flex items-center justify-center">
              <img
                src={logo}
                alt={`Company ${index + 1}`}
                className="h-20 w-auto object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              />
            </div>
          ))}
        </Marquee>

        {/* <div className="flex gap-10">
          {logos.map((logo, index) => (
            <img key={index} src={logo} className="h-20" />
          ))}
        </div> */}
      </div>
    </section>
  );
};

export default ClientLogoMarquee;
