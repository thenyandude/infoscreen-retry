import React, { useState, useEffect } from 'react';
import './ImageViewer.css';

const ImageViewer = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch('http://localhost:3001/getMedia');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched media:', data.uploadedMedia);

          // Sort media items based on the 'order' property
          const sortedMedia = data.uploadedMedia.sort((a, b) => a.order - b.order);

          setMediaItems(sortedMedia);
        } else {
          console.error('Error fetching media:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching media:', error);
      }
    };

    fetchMedia();
  }, []);

  useEffect(() => {
    if (mediaItems.length > 0) {
      const initialDuration = parseInt(mediaItems[currentMediaIndex].duration, 10) || 5000;

      const intervalId = setInterval(() => {
        setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % mediaItems.length);
      }, initialDuration);

      return () => clearInterval(intervalId);
    }
  }, [mediaItems, currentMediaIndex]);

  const handleVideoClick = () => {
    const videoElement = document.getElementById('mediaVideo');
    if (videoElement) {
      videoElement.requestFullscreen().then(() => {
        videoElement.play();
      });
    }
  };

  const isTextFile = (path) => {
    return path.endsWith('.txt');
  };

  return (
    <div>
      {mediaItems.length > 0 && (
        <div>
          {isTextFile(mediaItems[currentMediaIndex]?.path) ? (
            // Display text content for text files
            <div key={currentMediaIndex} className ='text-media'>
              {mediaItems[currentMediaIndex]?.text}
            </div>
          ) : (
            mediaItems[currentMediaIndex]?.type === 'image' ? (
              // Display image
              <img
                key={currentMediaIndex}
                src={`/media/${mediaItems[currentMediaIndex]?.path}`}
                alt={`Image ${currentMediaIndex + 1}`}
              />
            ) : (
              // Display video
              <div onClick={handleVideoClick}>
                <video
                  key={currentMediaIndex}
                  id="mediaVideo"
                  src={`/media/${mediaItems[currentMediaIndex]?.path}`}
                  type="video/mp4"
                  muted
                  autoPlay
                  controls
                />
              </div>
            )
          )}
          {!isTextFile(mediaItems[currentMediaIndex]?.path) && (
            <div>{mediaItems[currentMediaIndex]?.text}</div>
          )}
        </div>
      )}
    </div>
  );
};


export default ImageViewer;
