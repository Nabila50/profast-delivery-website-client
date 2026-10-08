import React from 'react';
import BangladeshMap from './BangladeshMap';
import { useLoaderData } from 'react-router';
// import BangladeshMap from "../components/CoverageMap";

const Coverage = () => {
    const wareHouses = useLoaderData();

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4">

        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold">
            We are available in 64 districts
          </h1>

          <p className="mt-3 text-gray-500">
            Find your district and check our delivery coverage.
          </p>
        </div>

        {/* Search box - we can add this later */}

        {/* Map */}
        <BangladeshMap wareHouses={wareHouses} />

      </div>
   
    </div>
  );
};

export default Coverage;