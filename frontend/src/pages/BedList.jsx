import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";

const BedList = () => {
  const [vacantBeds, setVacantBeds] = useState([]);
  const [occupiedBeds, setOccupiedBeds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bedTypeFilter, setBedTypeFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBeds = async () => {
      try {
        const res = await axios.get("https://medibed.onrender.com/api/v1/beds", {
          withCredentials: true,
        });
        setVacantBeds(res.data.vacantBeds);
        setOccupiedBeds(res.data.occupiedBeds);
      } catch (error) {
        console.error("Error fetching beds:", error);
      }
    };
    fetchBeds();
  }, []);

  // Filtering logic
  const filterBeds = (beds) => {
    return beds.filter((bed) =>
      (bedTypeFilter === "" || bed.type.toLowerCase() === bedTypeFilter.toLowerCase()) &&
      (searchQuery === "" ||
        bed.bedNumber.toString().includes(searchQuery) ||
        (bed.patient?.name && bed.patient.name.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  };

  return (
    <SidebarLayout>
    <div className="p-6 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-gray-500 mb-8 text-center py-2 px-10">
          BED MANAGEMENT
        </div>

      {/* Search & Filter Row */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-100 p-4 rounded-lg mb-8 shadow-md">
        <input
          type="text"
          placeholder="🔍 Search bed number or patient name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-8080 focus:border-blue-8080 transition-all duration-300"
        />

        <select
          value={bedTypeFilter}
          onChange={(e) => setBedTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-8080 focus:border-blue-8080 transition-all duration-300"
        >
          <option value="">All Bed Types</option>
          <option value="ICU">ICU</option>
          <option value="General">General</option>
          <option value="Regular">Regular</option>
        </select>
      </div>

      {/* Vacant Beds Section */}
      <h3 className="text-2xl font-semibold mt-4 mb-4 py-3 text-green-700">🛏 Vacant Beds</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filterBeds(vacantBeds).length > 0 ? (
          filterBeds(vacantBeds).map((bed) => (
            <div
  key={bed._id}
  onClick={() => navigate(`/beds/${bed._id}`)}
  className="cursor-pointer p-6   rounded-lg shadow-lg bg-white hover:bg-green-100 transition-all duration-300"
>

              <p className="text-lg font-semibold text-green-700">Bed {bed.bedNumber}</p>
              <p className="text-gray-600"><strong>Type:</strong> {bed.type}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-8080">No vacant beds available.</p>
        )}
      </div>

      {/* Occupied Beds Section */}
      <h3 className="text-2xl font-semibold mt-8 mb-4 text-red-700 py-3">🏥 Occupied Beds</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filterBeds(occupiedBeds).length > 0 ? (
          filterBeds(occupiedBeds).map((bed) => (
            <div
              key={bed._id}
              onClick={() => navigate(`/beds/${bed._id}`)}
              className="cursor-pointer p-6  rounded-lg shadow-lg bg-white hover:bg-gray-100 transition-all duration-300"
            >
              <p className="text-lg font-semibold text-green-700">Bed {bed.bedNumber}</p>
              <p className="text-gray-600"><strong>Type:</strong> {bed.type}</p>
              <p className="text-gray-600"><strong>Patient:</strong> {bed.patient?.name}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-8080">No occupied beds available.</p>
        )}
      </div>
    </div>
    </SidebarLayout>
  );
};

export default BedList;
