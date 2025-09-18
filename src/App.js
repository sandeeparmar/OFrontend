import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard.js';
import Chatbot from './pages/Chatbot';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OceanTemperatureVisualization from './pages/testingPage.js'
import './App.css';
import ArgoDataAnalyzer from './pages/analyseModel.js'  ;
import ArgoMonitoringSystem from './pages/alertPage.js' ;

 function AppContent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ocean-medium"></div>

      </div>
    );
  }

  return (
    <div className="flex h-full  bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] pb-3
">
      {user && <Sidebar />}
      <div className={`flex-1 ${user ? 'mx-9' : ''}`}>
        <Routes>
          <Route 
            path="/" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/chatbot" 
            element={user ? <Chatbot /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={user && user.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/signup" 
            element={!user ? <Signup /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/testing" 
            element={user ? <OceanTemperatureVisualization /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/analyse" 
            element={user ? <ArgoDataAnalyzer /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/alert" 
            element={user ? <ArgoMonitoringSystem /> : <Navigate to="/dashboard" />} 
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;