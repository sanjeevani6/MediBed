import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/image.png";
import medibedLogo from "../assets/logo.png";
const Login = () => {
  const [staffID, setStaffID] = useState(""); // Changed state variable name
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before new request

    try {
      const { data } = await axios.post(
        "https://medibed.onrender.com/api/v1/auth/login",
        { staffID, password },
        { withCredentials: true }
      );

      console.log("Full login response:", data); // Debugging
      if (data.staff && data.token) {
        const userInfo = {
          ...data.staff,
          token: data.token, // Add token to userInfo
        };

        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        console.log("Navigating to /dashboard..."); // Debugging
        navigate("/dashboard"); // Redirect on success
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Login Form (60%) */}
      <div className="w-full md:w-[60%] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            {/* Larger Circular MEDIBED Logo */}
            <div className="flex justify-center mb-6">
              <div className="rounded-full border-4 border-blue-50 p-2">
                <img
                  src={medibedLogo}
                  alt="MEDIBED Logo"
                  className="h-45 w-45 rounded-full object-contain" // Increased size
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              SIGN IN
            </h2>
            <p className="text-gray-500 text-lg font-extrabold">
              Hospital Bed Management System
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                  placeholder="Enter your username"
                  value={staffID}
                  onChange={(e) => setStaffID(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
            >
              Login
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Image (40%) */}
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
