import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/v1/auth/check-auth", { withCredentials: true });
        setUser(res.data.user);
        console.log("Check auth response in dashboard:", res.data);
      } catch(error) {
        console.error("Check auth error:", error.response?.data || error.message);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await axios.post("/api/v1/auth/logout", {}, { withCredentials: true });
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">MediBed</div>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Patients</li>
            <li>Doctors</li>
            <li>Beds</li>
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
            <p>120</p>
          </div>
          <div className="stats-card">
            <h3>Available Beds</h3>
            <p>30</p>
          </div>
          <div className="stats-card">
            <h3>Doctors on Duty</h3>
            <p>15</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

