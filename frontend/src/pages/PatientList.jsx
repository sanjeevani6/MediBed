import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [category, setCategory] = useState("ADMITTED");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`/api/v1/patients?status=${category}`);
        console.log("patients:",res.data);
        setPatients(res.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchPatients();
  }, [category]);

  return (
    <div className="patient-list-container">
      <h2>Patient List</h2>

      {/* Toggle Buttons */}
      <div className="toggle-buttons">
        <button onClick={() => setCategory("ADMITTED")} className={category === "ADMITTED" ? "active" : ""}>
          Admitted Patients
        </button>
        <button onClick={() => setCategory("DISCHARGED")} className={category === "DISCHARGED" ? "active" : ""}>
          Discharged Patients
        </button>
      </div>

      {/* Patient List */}
      <ul className="patient-list">
  {patients.map((patient, index) => (
    <li
      key={patient._id || `temp-${index}`} // Use _id if available, otherwise generate a temporary key
      onClick={() => navigate(`/patients/${patient._id || ''}`)} // Avoid passing undefined _id
      className="clickable"
    >
      {patient.name} - {patient.age} years
    </li>
  ))}
</ul>

    </div>
  );
};

export default PatientList;
