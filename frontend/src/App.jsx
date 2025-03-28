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
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/v1/auth/check-auth", { withCredentials: true })
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
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute user={user}><Dashboard /></PrivateRoute>} />
        <Route path="/staff-list" element={<StaffList user={user} />} />
        <Route path="/doctor-list" element={<DoctorList user={user} />} />
        <Route path="/add-staff" element={<AddStaff user={user} />} />
        <Route path="/add-doctor" element={<AddDoctor user={user} />} />
        <Route path="/add-patient" element={<AddPatient user={user} />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/beds" element={<BedList />} />
        <Route path="/beds/:id" element={<BedDetail />} />
        <Route path="/add-bed" element={<AddBed user={user} />} />

        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
    </ChakraProvider>
  );
};

export default App;


