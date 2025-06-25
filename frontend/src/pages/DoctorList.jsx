import { useEffect, useState } from "react";
 import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";

 const DoctorList = ({ user }) => {
   const [doctors, setDoctors] = useState([]);
   const [searchQuery, setSearchQuery] = useState("");
  
   useEffect(() => {
     const fetchDoctors = async () => {
       try {
         const res = await axios.get("https://medibed.onrender.com/api/v1/doctor");
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
 
   const filteredDoctors = doctors.filter((doctor) => {
     const normalizedName = doctor.name.toLowerCase().replace(/^dr\.\s*/, ""); // Remove "Dr." or "dr."
     const normalizedSpecialization = doctor.specialization.toLowerCase();
     const searchLower = searchQuery.toLowerCase();
 
     return (
       normalizedName.includes(searchLower) || normalizedSpecialization.includes(searchLower)
     );
   });
 
   return (
    <SidebarLayout>
     <div className="list-container p-4">
  <div className="text-2xl font-bold text-gray-500 mb-8 text-center py-2 px-10">
          DOCTOR'S LIST
        </div>
       <div className="flex items-center space-x-4 mb-4">
         {/* Search Input */}
         <input
           type="text"
           placeholder="🔍 Search by Name or Specialization..."
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-8080 focus:border-blue-8080 transition-all duration-300"
         />
 
      
       </div>
 
       {/* Doctor Cards */}
       <div className="card-container py-2">
         {filteredDoctors.length > 0 ? (
           filteredDoctors.map((doctor) => (
             <div key={doctor._id} className="card">
               <h3>{doctor.name}</h3>
               <p><strong>Specialization:</strong> {doctor.specialization}</p>
 
               {user?.role === "superadmin" && (
                 <button onClick={() => handleDelete(doctor._id)} className="delete-button">Delete</button>
               )}
             </div>
           ))
         ) : (
           <p>No doctors found.</p>
         )}
       </div>
     </div>
     </SidebarLayout>
   );
 };
 
 export default DoctorList;