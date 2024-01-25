import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUploadForm.css';

const FileUploadForm = ({ onUpload }) => {
  const [files, setFiles] = useState([]);
  const [fileOrder, setFileOrder] = useState({});
  const [durations, setDurations] = useState({});
  const [texts, setTexts] = useState({});
  const [duration, setDuration] = useState('');
  const [text, setText] = useState('');
  const [txtFileContent, setTxtFileContent] = useState(''); // New state variable for .txt file content
  const [isTxtFileUploaded, setIsTxtFileUploaded] = useState(false);


  const onDrop = useCallback((acceptedFiles) => {
    let txtFileDetected = false;
    // Process each file
    acceptedFiles.forEach(file => {
      if (file.name.endsWith('.txt')) {
        txtFileDetected = true;
        const reader = new FileReader();
        reader.onload = (e) => {
          setTxtFileContent(e.target.result); // Set the content of .txt file
        };
        reader.readAsText(file);
      }
    });

    setIsTxtFileUploaded(txtFileDetected);
  
    // After processing all files, update the state with the new list of files
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);
  

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleFileOrderChange = (fileId, newOrder) => {
    const isOrderUnique = Object.values(fileOrder).every((order) => order !== newOrder);
    if (isOrderUnique) {
      const newFileOrder = { ...fileOrder, [fileId]: parseInt(newOrder, 10) };
      setFileOrder(newFileOrder);

      const newFiles = [...files];
      newFiles.sort((a, b) => newFileOrder[a.name] - newFileOrder[b.name]);

      setFiles(newFiles);
    }
  };

  const handleRemoveFile = (fileName) => {
    const newFiles = files.filter((file) => file.name !== fileName);
    setFiles(newFiles);

    if (fileOrder[fileName]) {
      const newFileOrder = { ...fileOrder };
      delete newFileOrder[fileName];
      setFileOrder(newFileOrder);
    }
  };

  const handleDurationChange = (e) => {
    setDuration(e.target.value);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleFileDurationChange = (fileId, duration) => {
    setDurations((prevDurations) => ({ ...prevDurations, [fileId]: duration }));
  };

  const handleFileTextChange = (fileId, text) => {
    setTexts((prevTexts) => ({ ...prevTexts, [fileId]: text }));
  };

  const handleSubmit = async () => {
    const uniqueOrderNumbers = new Set(Object.values(fileOrder));
    if (uniqueOrderNumbers.size !== files.length) {
      alert('Each file must have a unique order number.');
      return;
    }

    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append('media', file);
      formData.append(`duration_${index}`, durations[file.name] || ''); // Append duration for each file
      formData.append(`text_${index}`, texts[file.name] || ''); // Append text for each file
    });

    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log(formData);
        setFiles([]);
        setFileOrder({});
        setDurations({});
        setTexts({});
        setDuration('');
        setText('');
        console.log('Files submitted successfully!');
      } else {
        console.error('Error submitting files:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting files:', error);
    }
  };

  return (
    <div>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag & drop some files here, or click to select files</p>
      </div>
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <button onClick={() => handleRemoveFile(file.name)}>Remove</button>
            <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100px', height: '100px' }} />
            <input type="number" value={fileOrder[file.name] || ''} onChange={(e) => handleFileOrderChange(file.name, e.target.value)} placeholder="Order" />
            <input type="number" value={durations[file.name] || ''} onChange={(e) => handleFileDurationChange(file.name, e.target.value)} placeholder="Duration (ms)" />
            {!file.name.endsWith('.txt') && (
              <input type="text" value={texts[file.name] || ''} onChange={(e) => handleFileTextChange(file.name, e.target.value)} placeholder="Optional Text" />
            )}
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default FileUploadForm;
