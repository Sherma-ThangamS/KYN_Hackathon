// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from './components/Login';
import NewsFeed from './components/newsfeed1';
import Navbar from './components/navibar';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <ConditionalNavbar />
          <div className="max-w-6xl mx-auto p-6 mt-[10vh]">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <NewsFeed />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Component to conditionally render the Navbar
const ConditionalNavbar = () => {
  const location = useLocation();
  return location.pathname === "/" ? <Navbar /> : null;
};

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

export default App;
