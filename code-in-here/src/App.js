import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUpload from './FileUpload';
import ImageViewer from './ImageViewer';
import FileManager from './FileManager';
import LoginPage from './Login';
import RegisterPage from './Register';
import ProtectedRoute from './middleware/ProtectedRoute';
import AdminPanel from './AdminPanel'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/view" element={<ImageViewer />} />

        <Route path="/manage" element={
        <ProtectedRoute requiredRole="admin">
          <FileManager/>
        </ProtectedRoute>}/>

        <Route path="/upload" element={
        <ProtectedRoute requiredRole="admin">
          <FileUpload/>
        </ProtectedRoute>}/>

        <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminPanel/>
        </ProtectedRoute>}/>  // Admin panel route

        <Route path="/" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
      </Routes>
    </Router>
  );
};

export default App;
