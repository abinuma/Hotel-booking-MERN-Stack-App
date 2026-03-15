import HotelCard from "./HotelCard";
import Title from "./Title";
import { useAppContext } from "./context/AppContext";
import { useEffect, useState } from "react";

const RecommendedHotels = () => {
  const { rooms, searchedCities } = useAppContext();
  const [recommended, setRecommended] = useState([]);

  const filterHotels = () => {
    const normalizedCities = searchedCities.map((city) =>
      city.trim().toLowerCase(),
    );
    const filteredHotels = rooms
      .slice()
      .filter((room) =>
        normalizedCities.includes(room.hotel.city.trim().toLowerCase()),
      );
    setRecommended(filteredHotels);
  };

  useEffect(() => {
    console.log("searchedCities", searchedCities);
    console.log("rooms", rooms);
    filterHotels();
  }, [rooms, searchedCities]);

  return (
    recommended.length > 0 && (
      <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20">
        <Title
          title="Recommended Destination"
          subTitle="Discover our handpicked selection of exceptional properties around the world , offering unparalleled luxury and unforgottable expereince. "
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {recommended.length > 0 ? (
            recommended
              .slice(0, 4)
              .map((room, index) => (
                <HotelCard key={room._id} room={room} index={index} />
              ))
          ) : (
            <p>No recommended hotels available.</p>
          )}
        </div>
      </div>
    )
  );
};

export default RecommendedHotels;
