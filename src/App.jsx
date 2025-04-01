import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Components/LoginPage";
import HomePage from "./Components/HomePage";
import ProtectedRoute from "./ProtectedRoute";
import { userAtom } from "./atom";
import { useAtom } from "jotai";

const App = () => {
  const [user] = useAtom(userAtom)
  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to='/home'/> : <LoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
