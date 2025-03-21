import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PatientList = () => {
  const [patients, setPatients] = useState([]); // Fetched patients
  const [filteredPatients, setFilteredPatients] = useState([]); // Filtered patients
  const [category, setCategory] = useState("ADMITTED");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`/api/v1/patients?status=${category}`);
        console.log("patients:", res.data);
        setPatients(res.data);
        setFilteredPatients(res.data); // Initialize filtered list with all patients
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchPatients();
  }, [category]);

  // Handle search filter
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredPatients(patients); // Reset if search query is empty
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

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

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />

      {/* Patient List */}
      <ul className="patient-list">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient, index) => (
            <li
              key={patient._id || `temp-${index}`}
              onClick={() => navigate(`/patients/${patient._id || ''}`)}
              className="clickable"
            >
              {patient.name} - {patient.age} years
            </li>
          ))
        ) : (
          <p>No patients found.</p>
        )}
      </ul>
    </div>
  );
};

export default PatientList;
