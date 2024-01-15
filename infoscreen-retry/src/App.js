import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUpload from './FileUpload';
import ImageViewer from './ImageViewer';
import FileManager from './FileManager';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/v" element={<ImageViewer />} />
        <Route path="/upload" element={<FileUpload/>} />
        <Route path="/" element={<FileManager/>}   />
        </Routes>
    </Router>
  );
};

export default App;
