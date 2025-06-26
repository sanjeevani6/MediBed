import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BedDetail = () => {
  const { id } = useParams();
  const [bed, setBed] = useState(null);

  useEffect(() => {
    const fetchBedDetail = async () => {
      try {
        const res =
        axios.get( `https://medibed.onrender.com/api/v1/beds/${id}`, {
          withCredentials: true,
        });
        
        setBed(res.data);
      } catch (error) {
        console.error("Error fetching bed details:", error);
      }
    };
    fetchBedDetail();
  }, [id]);

  if (!bed) return <h2>Loading...</h2>;

  return (
    <div>
      <h2>Bed {bed.bedNumber} Details</h2>
      <p><strong>Type:</strong> {bed.type}</p>
      <p><strong>Status:</strong> {bed.status}</p>

      {bed.status === "Occupied" && (
        <div>
          <h3>Current Patient</h3>
          <p>Name: {bed.patient?.name}</p>
          <p>Age: {bed.patient?.age}</p>
          <p>Severity: {bed.patient?.severity}</p>
        </div>
      )}

      <h3>Bed History</h3>
      {bed.history.length > 0 ? (
        <ul>
          {bed.history.map((entry, index) => (
            <li key={index}>
              <p>Patient: {entry.patient?.name}</p>
              <p>Admitted: {new Date(entry.admittedAt).toLocaleDateString()}</p>
              <p>Discharged: {new Date(entry.dischargedAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No history available.</p>
      )}
    </div>
  );
};

export default BedDetail;
