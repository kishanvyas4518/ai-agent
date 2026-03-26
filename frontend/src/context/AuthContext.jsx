import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [client, setClient] = useState(JSON.parse(localStorage.getItem('client')) || null);

  const login = (newToken, newClient) => {
    setToken(newToken);
    setClient(newClient);
    localStorage.setItem('token', newToken);
    localStorage.setItem('client', JSON.stringify(newClient));
  };

  const logout = () => {
    setToken(null);
    setClient(null);
    localStorage.removeItem('token');
    localStorage.removeItem('client');
  };

  return (
    <AuthContext.Provider value={{ token, client, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
