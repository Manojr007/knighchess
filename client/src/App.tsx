import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import GamePage from './pages/GamePage';


const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    // Redirect unauthenticated users to landing page
    return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <div className="min-h-screen bg-gray-900 text-white font-sans">
                    <Toaster position="top-right" />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/game/:id"
                            element={
                                <PrivateRoute>
                                    <GamePage />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </div>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;
