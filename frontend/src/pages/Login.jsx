import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [staffID, setStaffID] = useState(""); // Changed state variable name
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before new request

    try {
      const res=await axios.post(
        "/api/v1/auth/login",
        { staffID, password },
        { withCredentials: true } // Allows cookies
      );
    
      console.log("Login response:", res.data);
   
        console.log("Navigating to /dashboard..."); // Debugging
        navigate("/dashboard");//Redirect on Success

    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <h2>Staff Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <label htmlFor="staffID">Staff ID</label>
        <input
          type="text"
          id="staffID"
          placeholder="Enter your Staff ID"
          value={staffID} // Fixed variable name
          onChange={(e) => setStaffID(e.target.value)} // Fixed setter
          required
          autoComplete="off"
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="off"
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;


