import { useState, useEffect } from "react";
import { BASE, USER } from "../../Constants/apiRoutes.js";
import UpdateNamePopup from "./UpdateNamePopup.jsx";
import api from "../../utils/axiosInstance.js"

const BASE_URL = BASE.ROUTE;

export default function NamePromptGate({ children }) {
  const [user, setUser] = useState(null);
  const [showNamePopup, setShowNamePopup] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("naarisa-user");
    const token = localStorage.getItem("naarisa-token");

    if (stored && token) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      if (parsedUser.name === "User") {
        setShowNamePopup(true);
      }
    } else {
      localStorage.removeItem("naarisa-user");
    }
  }, []);

  const handleNameSave = async (newName) => {
    const res = await api.put(USER.PROFILE, { name: newName, email: user.email });

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to update name.");
    }

    const updatedUser = { ...user, name: newName };
    setUser(updatedUser);

    localStorage.setItem("naarisa-user", JSON.stringify(updatedUser));
  };

  return (
    <>
      {children}
      {showNamePopup && (
        <UpdateNamePopup
          currentName={user?.name}
          onClose={() => setShowNamePopup(false)}
          onSave={handleNameSave}
        />
      )}
    </>
  );
}