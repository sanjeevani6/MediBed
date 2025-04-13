import { Navigate } from "react-router-dom";

const PrivateRoute = ({ user, children }) => {
   console.log("user got:",user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;

