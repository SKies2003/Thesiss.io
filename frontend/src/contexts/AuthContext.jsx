import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({
  user: null,
  token: "",
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);

  // Fetch logged-in user
  useEffect(() => {
    if (!token) return;

    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) setUser(await res.json());
        else setUser(null);
      } catch {
        setUser(null);
      }
    }

    fetchUser();
  }, [token]);

  const login = (jwtToken, userData) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
