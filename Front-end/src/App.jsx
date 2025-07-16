import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Layout from './components/Layout.jsx';
import SignUp from './components/SignUp.jsx';
import Profile from './components/Profile.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PendingPage from './pages/PendingPage.jsx';
import Completepage from './pages/Completepage.jsx';

const App = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleAuthSubmit = (data) => {
    // Store the token if it exists in the response
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    const user = {
      email: data.email,
      name: data.name || 'User',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`
    };

    setCurrentUser(user);
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Login
                onSubmit={handleAuthSubmit}
                onSwitchMode={() => navigate('/signup')}
              />
            </div>
          )
        }
      />
      <Route
        path="/signup"
        element={
          currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <SignUp
                onSubmit={handleAuthSubmit}
                onSwitchMode={() => navigate('/login')}
              />
            </div>
          )
        }
      />
{/* Protected Routes */}
      <Route
        path="/"
        element={
          currentUser ? (
            <Layout user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Dashboard />} />
      </Route>
      <Route
        path="/pending"
        element={
          currentUser ? (
            <Layout user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<PendingPage />} />
      </Route>
      <Route
        path="/complete"
        element={
          currentUser ? (
            <Layout user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Completepage />} />
      </Route>
      <Route 
        path="/profile" 
        element={
          currentUser ? (
            <Layout user={currentUser} onLogout={handleLogout}>
              <Profile 
                user={currentUser} 
                setCurrentUser={setCurrentUser} 
                onLogout={handleLogout} 
              />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
};

export default App;