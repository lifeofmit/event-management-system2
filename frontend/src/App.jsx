import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import EventForm from './pages/EventForm';

import Dashboard from './pages/Dashboard';
import EventList from './pages/EventList';
import UserManagement from './pages/UserManagement';

// const Dashboard = () => <h2>Dashboard Placeholder (View Analytics Here)</h2>;
// const EventList = () => <h2>Event List Placeholder (Table Here)</h2>;
const Unauthorized = () => <h2>403 - Unauthorized Access</h2>;

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes wrapped in Layout */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DEAN', 'COORDINATOR']} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/add-event" element={<EventForm />} />
            <Route path="/users" element={<UserManagement />} />
          </Route>
        </Route>

        {/* Super Admin Only Route Example */}
        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
          <Route element={<Layout />}>
            <Route path="/users" element={<h2>User Management Placeholder</h2>} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;