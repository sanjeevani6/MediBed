import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BedList = () => {
  const [vacantBeds, setVacantBeds] = useState([]);
  const [occupiedBeds, setOccupiedBeds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBeds = async () => {
      try {
        const res = await axios.get("/api/v1/beds");
        setVacantBeds(res.data.vacantBeds);
        setOccupiedBeds(res.data.occupiedBeds);
      } catch (error) {
        console.error("Error fetching beds:", error);
      }
    };
    fetchBeds();
  }, []);

  return (
    <div>
      <h2>Bed Management</h2>

      <h3>Vacant Beds</h3>
      {vacantBeds.length > 0 ? (
        vacantBeds.map((bed) => (
          <p key={bed._id} onClick={() => navigate(`/beds/${bed._id}`)}>
            Bed {bed.bedNumber} ({bed.type})
          </p>
        ))
      ) : (
        <p>No vacant beds available.</p>
      )}

      <h3>Occupied Beds</h3>
      {occupiedBeds.length > 0 ? (
        occupiedBeds.map((bed) => (
          <p key={bed._id} onClick={() => navigate(`/beds/${bed._id}`)}>
            Bed {bed.bedNumber} ({bed.type}) - Patient: {bed.patient?.name}
          </p>
        ))
      ) : (
        <p>No occupied beds.</p>
      )}
    </div>
  );
};

export default BedList;
