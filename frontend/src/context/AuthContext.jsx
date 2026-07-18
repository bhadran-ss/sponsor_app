import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import api from "../api/client";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setProfile(data);
      return data;
    } catch (err) {
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) await refreshProfile();
      else setProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    firebaseUser,
    profile,
    loading,
    isAuthenticated: !!firebaseUser,
    refreshProfile,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
