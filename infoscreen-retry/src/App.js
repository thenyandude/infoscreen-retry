import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUpload from './FileUpload';
import ImageViewer from './ImageViewer';
import FileManager from './FileManager';
import LoginPage from './Login';
import RegisterPage from './Register';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/v" element={<ImageViewer />} />
        <Route path="/upload" element={<FileUpload/>} />
        <Route path="/m" element={<FileManager/>}   />
        <Route path="/" element={<LoginPage/>}   />
        <Route path="/r" element={<RegisterPage/>}   />

        </Routes>
    </Router>
  );
};

export default App;
