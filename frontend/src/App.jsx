import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import './index.css';
import Chat from './pages/Chat';
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AddStaff from "./pages/AddStaff.jsx";
import AddDoctor from "./pages/AddDoctor.jsx";
import AddPatient from "./pages/AddPatient.jsx";
import StaffList from "./pages/StaffList";
import DoctorList from "./pages/DoctorList";
import PatientList from "./pages/PatientList";
import PatientDetail from "./pages/PatientDetail";
import BedList from "./pages/BedList";
import BedDetail from "./pages/BedDetail";
import AddBed from "./pages/AddBed";

import { ChakraProvider } from "@chakra-ui/react";
import Register from "./pages/Register.jsx";
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://medibed.onrender.com/api/v1/auth/check-auth", { withCredentials: true })
      .then((response) => {
        console.log("User Data:", response.data.user);
        setUser(response.data.user);
      })
      .catch((error) => {
        console.error("Not authenticated", error);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute user={user}><Dashboard /></PrivateRoute>} />
          <Route path="/staff-list" element={<PrivateRoute user={user}><StaffList user={user} /></PrivateRoute>} />
          <Route path="/doctor-list" element={<PrivateRoute user={user}><DoctorList user={user} /></PrivateRoute>} />
          <Route path="/add-staff" element={<PrivateRoute user={user}><AddStaff user={user} /></PrivateRoute>} />
          <Route path="/add-doctor" element={<PrivateRoute user={user}><AddDoctor user={user} /></PrivateRoute>} />
          <Route path="/add-patient" element={<PrivateRoute user={user}><AddPatient user={user} /></PrivateRoute>} />
          <Route path="/patients" element={<PrivateRoute user={user}><PatientList /></PrivateRoute>} />
          <Route path="/patients/:id" element={<PrivateRoute user={user}><PatientDetail /></PrivateRoute>} />
          <Route path="/beds" element={<PrivateRoute user={user}><BedList /></PrivateRoute>} />
          <Route path="/beds/:id" element={<PrivateRoute user={user}><BedDetail /></PrivateRoute>} />
          <Route path="/add-bed" element={<PrivateRoute user={user}><AddBed user={user} /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute user={user}><Chat /></PrivateRoute>} />

        </Routes>
      </Router>
    </ChakraProvider>
  );
};

export default App;


