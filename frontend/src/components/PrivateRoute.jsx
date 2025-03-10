import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.jsx";

const PrivateRoute = ({ children }) => {
  const user = useAuth();
  console.log("Protected Route: user =", user); // Debugging
  if (user === null) {
    return <p>LOGIN FIRST...</p>;
    //console.log("Redirecting to login...");
    //return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
