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
        <Route path="/v" element={<ImageViewer />} />

        <Route path="/m" element={
        <ProtectedRoute requiredRole="admin">
          <FileManager/>
        </ProtectedRoute>}/>

        <Route path="/u" element={
        <ProtectedRoute requiredRole="admin">
          <FileUpload/>
        </ProtectedRoute>}/>

        <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminPanel/>
        </ProtectedRoute>}/>  // Admin panel route

        <Route path="/" element={<LoginPage/>} />
        <Route path="/r" element={<RegisterPage/>} />
      </Routes>
    </Router>
  );
};

export default App;
