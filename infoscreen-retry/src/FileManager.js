import React, { useState, useEffect } from 'react';
import './FileManager.css';

const FileManager = () => {
  const [mediaData, setMediaData] = useState([]);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch('http://localhost:3001/getMedia');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched media:', data.uploadedMedia);
        setMediaData(data.uploadedMedia);
      } else {
        console.error('Error fetching media:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const handleOrderChange = async (mediaId, newOrder) => {
    try {
      const response = await fetch(`http://localhost:3001/updateOrder/${mediaId}/${newOrder}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: newOrder }),
      });

      if (response.ok) {
        console.log('Order updated successfully!');
        // If the update is successful, fetch the media again to reflect changes
        fetchMedia();
      } else {
        console.error('Error updating order:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleDurationChange = async (mediaId, newDuration) => {
    try {
      const response = await fetch(`http://localhost:3001/updateDuration/${mediaId}/${newDuration}`, {
        method: 'PUT',
      });

      if (response.ok) {
        fetchMedia();
        console.log('Duration updated successfully!');
      } else {
        console.error('Error updating duration:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating duration:', error);
    }
  };

  const handleTextChange = async (mediaId, newText) => {
    try {
      const response = await fetch(`http://localhost:3001/updateText/${mediaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newText }),
      });

      if (response.ok) {
        fetchMedia();
        console.log('Text updated successfully!');
      } else {
        console.error('Error updating text:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating text:', error);
    }
  };

  const handleRemoveMedia = async (mediaId) => {
    try {
      const response = await fetch(`http://localhost:3001/removeMedia/${mediaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMedia();
        console.log('Media removed successfully!');
      } else {
        console.error('Error removing media:', response.statusText);
      }
    } catch (error) {
      console.error('Error removing media:', error);
    }
  };

  return (
    <div>
      <div className="media-grid">
        {mediaData.map((media, index) => (
          <div key={index} className="media-item">
            {media.type === 'image' ? (
              // Display image
              <img
                src={`http://localhost:3001/media/${media.path}`}
                alt={`Media ${index + 1}`}
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
            ) : (
              // Display video
              <video
                src={`http://localhost:3001/media/${media.path}`}
                type="video/mp4"
                autoPlay
                controls
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
            )}
            <span>Order:</span>
            <input
              type="number"
              value={media.order}
              onChange={(e) => handleOrderChange(media._id, e.target.value)}
            />
            <span>Duration:</span>
            <input
              type="number"
              value={media.duration}
              onChange={(e) => handleDurationChange(media._id, e.target.value)}
            />
            <span>Text:</span>
            <input
              type="text"
              value={media.text}
              onChange={(e) => handleTextChange(media._id, e.target.value)}
            />
            <button onClick={() => handleRemoveMedia(media._id)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileManager;
