import { useEffect, useState } from "react";
import axios from "axios";

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("https://medibed.onrender.com/api/v1/auth/check-auth", { withCredentials: true });
        console.log("Check auth response:", res.data); 
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  return user;
};

export default useAuth;
