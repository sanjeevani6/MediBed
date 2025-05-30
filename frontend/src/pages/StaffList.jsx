import { useEffect, useState } from "react";
 import axios from "axios";
 import { useNavigate } from "react-router-dom";
 import SidebarLayout from "../components/SidebarLayout";
 
 const StaffList = ({ user }) => {
   const [staff, setStaff] = useState([]);
   const [filteredStaff, setFilteredStaff] = useState([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [filterSuperadmin, setFilterSuperadmin] = useState(false);
   const [filterStaff, setFilterStaff] = useState(false);
   const navigate = useNavigate();
 
   useEffect(() => {
     const fetchStaff = async () => {
       try {
         const res = await axios.get("https://medibed.onrender.com/api/v1/staff",{ withCredentials: true });
         setStaff(res.data);
         setFilteredStaff(res.data);
       } catch (error) {
         console.error("Error fetching staff:", error.response?.data || error.message);
       }
     };
     fetchStaff();
   }, []);
 
   const normalizeText = (text) => text?.toLowerCase().replace(/^dr\.?\s*/i, "");
 
   useEffect(() => {
     let filtered = staff.filter((member) =>
       normalizeText(member.name).includes(searchQuery.toLowerCase())
     );
 
     if (filterSuperadmin || filterStaff) {
       filtered = filtered.filter((member) =>
         (filterSuperadmin && member.role.toLowerCase() === "superadmin") ||
         (filterStaff && member.role.toLowerCase() === "staff")
       );
     }
 
     setFilteredStaff(filtered);
   }, [searchQuery, filterSuperadmin, filterStaff, staff]);
 
   const handleDelete = async (id) => {
     if (!window.confirm("Are you sure you want to delete this staff member?")) return;
     try {
       await axios.delete(`https://medibed.onrender.com/api/v1/staff/${id}`,{ withCredentials: true });
       setStaff(staff.filter((s) => s._id !== id));
     } catch (error) {
       console.error("Error deleting staff:", error.response?.data || error.message);
     }
   };
 
   return (
    <SidebarLayout>
     <div className="p-6 max-w-6xl mx-auto">
      <div className="text-2xl font-bold text-gray-500 mb-8 text-center py-2 px-10">
          STAFF LIST
        </div>
     
 
       {/* Search Bar & Filters in One Row */}
       <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg mb-6 shadow-sm">
   <input
     type="text"
     placeholder="🔍 Search by name or role..."
     value={searchQuery}
     onChange={(e) => setSearchQuery(e.target.value)}
     className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-8080 focus:border-blue-8080 transition-all duration-300 mr-4"
   />
   
   <div className="flex items-center gap-4">
     <label className="flex items-center gap-1 text-gray-700 px-2">
       <input
         type="checkbox"
         checked={filterSuperadmin}
         onChange={() => setFilterSuperadmin(!filterSuperadmin)}
         className="form-checkbox text-blue-8080"
       />
       Superadmin
     </label>
 
     <label className="flex items-center gap-1 text-gray-700">
       <input
         type="checkbox"
         checked={filterStaff}
         onChange={() => setFilterStaff(!filterStaff)}
         className="form-checkbox text-blue-8080"
       />
       Staff
     </label>
   </div>
 </div>
 
 
       {/* Staff List in Row Format */}
       <div className="card-container">
         {filteredStaff.length > 0 ? (
           filteredStaff.map((member) => (
             <div key={member._id} className="card">
             <h3>{member.name}</h3>
             <p><strong>Role:</strong> {member.role}</p>
             <p><strong>Staff ID:</strong> {member.staffID}</p>
               {user?.role === "superadmin" && (
               <button onClick={() => handleDelete(member._id)} className="delete-button">Delete</button>
             )}
             </div>
           ))
         ) : (
           <p className="text-gray-8080 w-full text-center">No staff found.</p>
         )}
       </div>
     </div>
     </SidebarLayout>
   );
 };
 
 export default StaffList;