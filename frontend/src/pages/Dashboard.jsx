import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import SidebarLayout from "../components/SidebarLayout";

import { 
  FiHome, 
  FiUsers, 
  FiUserPlus, 
  FiUser, 
  FiPlusSquare, 
  FiMessageSquare,
  FiLogOut
} from "react-icons/fi";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [totalPatients, setTotalPatients] = useState(0);
  const [availableBeds, setAvailableBeds] = useState(0);
  const [doctorsOnDuty, setDoctorsOnDuty] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("https://medibed.onrender.com/api/v1/auth/check-auth", { withCredentials: true });
        setUser(res.data.user);
        console.log("Check auth response in dashboard:", res.data);
      } catch (error) {
        console.error("Check auth error:", error.response?.data || error.message);
      }
    };
    
    const fetchStats = async () => {
      try {
        const patientsRes = await axios.get("https://medibed.onrender.com/api/v1/patients/count",{ withCredentials: true });
        setTotalPatients(patientsRes.data.count);

        const doctorsRes = await axios.get("https://medibed.onrender.com/api/v1/doctor/count",{ withCredentials: true });
        setDoctorsOnDuty(doctorsRes.data.count);

        const bedsRes = await axios.get("https://medibed.onrender.com/api/v1/beds/count",{ withCredentials: true });
        setAvailableBeds(bedsRes.data.count);
      } catch (error) {
        console.error("Error fetching stats:", error.response?.data || error.message);
      }
    };

    fetchUser();
    fetchStats();
  }, [navigate]);

  const handleLogout = async () => {
    await axios.post("https://medibed.onrender.com/api/v1/auth/logout", {}, { withCredentials: true });
    navigate("/");
  };

  return (
    <SidebarLayout>
      {/* Top Bar */}
      <header className="bg-white shadow-sm p-5 flex justify-between items-center font-extrabold">
        <h1 className="text-3xl text-blue-600">Dashboard</h1>
        {user && (
          <span className="text-gray-700 text-lg font-semibold">
            Welcome, <span className="text-blue-500">{user.name}</span>
          </span>
        )}
      </header>

      {/* Stats Cards */}
      <main className="p-5">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Total Patients */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
                <p className="text-3xl font-bold text-gray-800 mt-1">{totalPatients}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiUsers className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Available Beds */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Available Beds</h3>
                <p className="text-3xl font-bold text-gray-800 mt-1">{availableBeds}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FiPlusSquare className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          {/* Doctors on Duty */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Doctors on Duty</h3>
                <p className="text-3xl font-bold text-gray-800 mt-1">{doctorsOnDuty}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiUser className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </SidebarLayout>
  );
};

export default Dashboard;