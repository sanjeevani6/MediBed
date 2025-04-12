import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
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
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col p-5">
        {/* Brand Logo */}
        <div className="text-2xl font-bold pb-5 mb-5 border-b border-gray-200">
          <span className="text-blue-600">MediBed</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-1 ">
            <li 
              onClick={() => navigate("/dashboard")} 
              className="flex items-center p-3 text-gray-700 rounded-lg  hover:text-gray-500 cursor-pointer transition-all  "
            >
              <FiHome className="text-blue-500 text-lg mr-3" />
              <span>Dashboard</span>
            </li>
            
            <li 
              onClick={() => navigate("/patients")} 
              className="flex items-center p-3 text-gray-700 rounded-lg hover:text-gray-500 cursor-pointer transition-all hover:translate-x-1"
            >
              <FiUsers className="text-blue-600 text-lg mr-3" />
              <span>Patients</span>
            </li>
            
            <li 
              onClick={() => navigate("/staff-list")} 
              className="flex items-center p-3 text-gray-700 rounded-lg hover:text-gray-500 cursor-pointer transition-all hover:translate-x-1"
            >
              <FiUsers className="text-blue-600 text-lg mr-3" />
              <span>Staff</span>
            </li>
            
            <li 
              onClick={() => navigate("/doctor-list")} 
              className="flex items-center p-3 text-gray-700 rounded-lg  hover:text-gray-500 cursor-pointer transition-all hover:translate-x-1"
            >
              <FiUser className="text-blue-600 text-lg mr-3" />
              <span>Doctors</span>
            </li>
            
            <li 
              onClick={() => navigate("/beds")} 
              className="flex items-center p-3 text-gray-700 rounded-lg hover:text-gray-500 cursor-pointer transition-all hover:translate-x-1"
            >
              <FiPlusSquare className="text-blue-600 text-lg mr-3" />
              <span>Beds</span>
            </li>
            
            {user?.role === "superadmin" && (
              <li 
                onClick={() => navigate("/add-staff")} 
                className="flex items-center p-3 text-gray-700 rounded-lg hover:text-gray-500 cursor-pointer transition-all hover:translate-x-1"
              >
                <FiUserPlus className="text-blue-600 text-lg mr-3" />
                <span>Add Staff</span>
              </li>
            )}
            
            {user?.role === "superadmin" && (
              <li 
                onClick={() => navigate("/add-doctor")} 
                className="flex items-center p-3 text-gray-700 rounded-lg hover:text-gray-500 cursor-pointer transition-all hover:translate-x-1"
              >
                <FiUserPlus className="text-blue-600 text-lg mr-3" />
                <span>Add Doctor</span>
              </li>
            )}
            
            {user?.role === "superadmin" && (
              <li 
                onClick={() => navigate("/add-bed")} 
                className="flex items-center p-3 text-gray-700 rounded-lg hover:text-gray-500 cursor-pointer transition-all hover:translate-x-1"
              >
                <FiPlusSquare className="text-blue-600 text-lg mr-3" />
                <span>Add Bed</span>
              </li>
            )}
            
            <li 
              onClick={() => navigate("/add-patient")} 
              className="flex items-center p-3 text-gray-700 rounded-lg hover:text-gray-500 cursor-pointer transition-all hover:translate-x-1"
            >
              <FiUserPlus className="text-blue-600 text-lg mr-3" />
              <span>Add Patient</span>
            </li>
            
            <li 
              onClick={() => navigate("/chat")} 
              className="flex items-center p-3 text-gray-700 rounded-lg  hover:text-gray-500 cursor-pointer transition-all hover:translate-x-1"
            >
              <FiMessageSquare className="text-blue-600 text-lg mr-3" />
              <span>Chat</span>
            </li>
            <li onClick={handleLogout}
          className="flex items-center p-3 text-red-600 rounded-lg hover:bg-red-50 mt-auto transition-all hover:translate-x-1"
        >
          <FiLogOut className="text-lg mr-3" />
          <span>Logout</span>
          </li>
          </ul>
        </nav>
        
        {/* Logout Button */}
      </aside>

      {/* Main Content */}
      {/* Main Content */}
<div className="flex-1 bg-gray-50">
  {/* Top Bar */}
  <header className="bg-white shadow-sm p-5 flex justify-between items-center font-extrabold">
  <h1 className="text-3xl text-blue-600">Dashboard</h1>
  {user && (
    <span className="text-gray-700 text-lg font-semibold">
      Welcome, <span className="text-blue-500">{user.name}</span>
    </span>
  )}
</header>

  {/* Stats Cards - Horizontal Layout */}
  <main className="p-5">
    <div className="flex flex-col md:flex-row gap-5">
      {/* Total Patients Card */}
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
      
      {/* Available Beds Card */}
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
      
      {/* Doctors on Duty Card */}
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
</div>
    </div>
  );
};

export default Dashboard;