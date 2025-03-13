import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StaffList = ({ user }) => {
  const [staff, setStaff] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get("/api/v1/staff");
        setStaff(res.data);
      } catch (error) {
        console.error("Error fetching staff:", error.response?.data || error.message);
      }
    };
    fetchStaff();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await axios.delete(`/api/v1/staff/${id}`);
      setStaff(staff.filter((s) => s._id !== id));
    } catch (error) {
      console.error("Error deleting staff:", error.response?.data || error.message);
    }
  };

  return (
    <div className="list-container">
      <h2>Staff List</h2>
      <button onClick={() => navigate("/dashboard")} className="back-button">Back to Dashboard</button>
      <div className="card-container">
        {staff.map((member) => (
          <div key={member._id} className="card">
            <h3>{member.name}</h3>
            <p><strong>Role:</strong> {member.role}</p>
            <p><strong>Staff ID:</strong> {member.staffID}</p>
            {user?.role === "superadmin" && (
              <button onClick={() => handleDelete(member._id)} className="delete-button">Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffList;

