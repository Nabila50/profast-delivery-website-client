// src/components/CoverageMap.jsx

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";


function FlyToDistrict({coords}){
  const map = useMap();
  if(coords){
    map.flyTo(coords, 12, {duration: 2.0})
  }
  return null;
}

const BangladeshMap = ({wareHouses}) => {

  const [searchText, setSearchText] = useState('');
  const [activeCoords, setActiveCoords] = useState(null);
  const [activeDistrict, setActiveDistrict] = useState(null);

  const handleSearch = (e) =>{
    e.preventDefault();
    const district = wareHouses.find(d => d.district.toLowerCase().includes(searchText.toLowerCase()));

    if(district) {
      setActiveCoords([district.latitude, district.longitude]);
      setActiveDistrict(district.district)
    };
  }



  const bangladeshCenter = [23.685, 90.3563];

  return (
    <div className="w-full overflow-hidden rounded-2xl relative">
      {/* search bar */}
      <form onSubmit={handleSearch} className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-md px-4 flex ">

      <input 
        type="text"
        placeholder="search district..."
        className="flex-1 px-4 py-2 border rounded-1-md outline-none bg-sky-400"
        value={searchText}
        onChange={(e)=> setSearchText(e.target.value)}

       />
       <button
          type="submit"
          className="bg-primary text-black px-4 py-2 rounded-r-md hover:bg-blue-700">
            Go
       </button>
        
      </form>


      {/* Map container */}
      <MapContainer
        center={bangladeshCenter}
        zoom={7}
        scrollWheelZoom={false}
        className="h-[600px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToDistrict coords={activeCoords}/>


        {
            wareHouses.map((house, index) => <Marker 
                key={index}
            position={[house.latitude, house.longitude]}>
          <Popup autoOpen={house.distric === activeDistrict}>
            <div className="text-center">
              <h3 className="font-bold">{house.district}</h3>
              <p>{house.covered_area.join(', ')}</p>
            </div>
          </Popup>
        </Marker>)
        }
        
      </MapContainer>
    </div>
  );
};

export default BangladeshMap;