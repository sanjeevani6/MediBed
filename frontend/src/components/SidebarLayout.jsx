import { useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiUserPlus, FiUser, FiPlusSquare, FiMessageSquare, FiLogOut } from "react-icons/fi";
import { useEffect, useState } from "react";
import axios from "axios";

const SidebarLayout = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("https://medibed.onrender.com/api/v1/auth/check-auth", { withCredentials: true });
        setUser(res.data.user);
      } catch (error) {
        console.error("Sidebar auth error:", error.response?.data || error.message);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await axios.post("https://medibed.onrender.com/api/v1/auth/logout", {}, { withCredentials: true });
    navigate("/");
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col p-5">
        <div className="text-2xl font-bold pb-5 mb-5 border-b border-gray-200">
          <span className="text-blue-600">MediBed</span>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            <NavItem icon={<FiHome />} label="Dashboard" to="/dashboard" />
            <NavItem icon={<FiUsers />} label="Patients" to="/patients" />
            <NavItem icon={<FiUsers />} label="Staff" to="/staff-list" />
            <NavItem icon={<FiUser />} label="Doctors" to="/doctor-list" />
            <NavItem icon={<FiPlusSquare />} label="Beds" to="/beds" />
            {user?.role === "superadmin" && (
              <>
                <NavItem icon={<FiUserPlus />} label="Add Staff" to="/add-staff" />
                <NavItem icon={<FiUserPlus />} label="Add Doctor" to="/add-doctor" />
                <NavItem icon={<FiPlusSquare />} label="Add Bed" to="/add-bed" />
              </>
            )}
            <NavItem icon={<FiUserPlus />} label="Add Patient" to="/add-patient" />
            <NavItem icon={<FiMessageSquare />} label="Chat" to="/chat" />
            <li
              onClick={handleLogout}
              className="flex items-center p-3 text-red-600 rounded-lg hover:bg-red-50 mt-auto transition-all hover:translate-x-1 cursor-pointer"
            >
              <FiLogOut className="text-lg mr-3" />
              <span>Logout</span>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-50 p-4">{children}</main>
    </div>
  );
};

const NavItem = ({ icon, label, to }) => {
  const navigate = useNavigate();
  return (
    <li
      onClick={() => navigate(to)}
      className="flex items-center p-3 text-gray-700 rounded-lg hover:text-gray-500 cursor-pointer transition-all hover:translate-x-1"
    >
      <span className="text-blue-600 text-lg mr-3">{icon}</span>
      <span>{label}</span>
    </li>
  );
};

export default SidebarLayout;
