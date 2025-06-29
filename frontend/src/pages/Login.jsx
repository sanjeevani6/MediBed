import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/image.png";
import medibedLogo from "../assets/logo.png";

const Login = ({ setUser }) => {
  const [hospitalName, setHospitalName] = useState("");
  const [staffID, setStaffID] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false); //  cold start helper
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      const { data } = await axios.post(
        "https://medibed.onrender.com/api/v1/auth/login",
        { staffID, password, hospitalName },
        { withCredentials: true }
      );

      if (data.staff && data.token) {
        setUser(data.staff); //  Set user immediately
        navigate("/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoggingIn(false); //  Turn off loading
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-full md:w-[60%] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full border-4 border-blue-50 p-2">
                <img src={medibedLogo} alt="MEDIBED Logo" className="h-45 w-45 rounded-full object-contain" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">SIGN IN</h2>
            <p className="text-gray-500 text-lg font-extrabold">Hospital Bed Management System</p>
          </div>

          {/* Cold start loading popup */}
          {isLoggingIn && (
            <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded mb-6 text-sm">
              Logging in... This may take a few seconds during the first request.
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hospital name"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your staff ID"
                  value={staffID}
                  onChange={(e) => setStaffID(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`login-button ${isLoggingIn ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register hospital link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Want to register your hospital?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:underline cursor-pointer font-semibold"
            >
              Click here
            </span>
          </p>
        </div>
      </div>

      <div className="hidden md:block md:w-[40%] bg-blue-50 relative overflow-hidden">
        <img
          src={loginImage}
          alt="Hospital Bed Management System"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;
