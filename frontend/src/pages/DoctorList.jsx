import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DoctorList = ({ user }) => {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("/api/v1/doctor");
        setDoctors(res.data);
      } catch (error) {
        console.error("Error fetching doctors:", error.response?.data || error.message);
      }
    };
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await axios.delete(`/api/v1/doctor/${id}`);
      setDoctors(doctors.filter((doc) => doc._id !== id));
    } catch (error) {
      console.error("Error deleting doctor:", error.response?.data || error.message);
    }
  };

  return (
    <div className="list-container">
      <h2>Doctor List</h2>
      <button onClick={() => navigate("/dashboard")} className="back-button">Back to Dashboard</button>
      <div className="card-container">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="card">
            <h3>{doctor.name}</h3>
            <p><strong>
            specialization:</strong> {doctor.specialization}</p>
           
            {user?.role === "superadmin" && (
              <button onClick={() => handleDelete(doctor._id)} className="delete-button">Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;

