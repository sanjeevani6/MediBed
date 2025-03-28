import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [totalPatients,setTotalPatients]=useState(0);
  const [availableBeds, setAvailableBeds] = useState(0);
  const [doctorsOnDuty, setDoctorsOnDuty] = useState(0);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/v1/auth/check-auth", { withCredentials: true });
        setUser(res.data.user);
        console.log("Check auth response in dashboard:", res.data);
      } catch (error) {
        console.error("Check auth error:", error.response?.data || error.message);
      }
    };
    const fetchStats = async () => {
      try {
        const patientsRes = await axios.get("/api/v1/patients/count");
        setTotalPatients(patientsRes.data.count);

        

        const doctorsRes = await axios.get("/api/v1/doctor/count");
        setDoctorsOnDuty(doctorsRes.data.count);

        const bedsRes = await axios.get("/api/v1/beds/count");
        setAvailableBeds(bedsRes.data.count);
      } catch (error) {
        console.error("Error fetching stats:", error.response?.data || error.message);
      }
    };

    fetchUser();
    fetchStats();
  }, [navigate]);

  const handleLogout = async () => {
    await axios.post("/api/v1/auth/logout", {}, { withCredentials: true });
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand text-red-800">MediBed</div>
        <nav>
          <ul>
          <li onClick={() => navigate("/patients")} className="clickable">Patients</li>
            <li onClick={() => navigate("/staff-list")} className="clickable">Staff</li>
            <li onClick={() => navigate("/doctor-list")} className="clickable">Doctors</li>
            <li onClick={() => navigate("/beds")} className="clickable">Beds</li>
            {user?.role === "superadmin" && (
              <li onClick={() => navigate("/add-staff")} className="clickable">
                Add Staff
              </li>

            )}
            {user?.role === "superadmin" && (
              <li onClick={() => navigate("/add-doctor")} className="clickable">
                Add Doctor
              </li>
            )}

        {user?.role === "superadmin" && (
          <li onClick={() => navigate("/add-bed")} className="clickable">
            Add Bed
          </li>
        )}

            <li onClick={() => navigate("/add-patient")} className="clickable">
                Add Patient
              </li>
            <li onClick={() => navigate("/chat")} className="clickable">Chat</li>

          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </aside>


      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <h1>Dashboard</h1>
          {user && <span>Welcome, {user.name}</span>}
        </header>

        {/* Main Section */}
        <main className="stats-container">
          {/* Cards for Overview */}
          <div className="stats-card">
            <h3>Total Patients</h3>
            <p>{totalPatients}</p>
          </div>
          <div className="stats-card">
            <h3>Available Beds</h3>
            <p>{availableBeds}</p>
          </div>
          <div className="stats-card">
            <h3>Doctors on Duty</h3>
            <p>{doctorsOnDuty}</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

