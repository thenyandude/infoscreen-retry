const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = require('ffprobe-static').path;

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Set the path to ffprobe
ffmpeg.setFfprobePath(ffprobePath);

const storage = multer.diskStorage({
  destination: './public/media/',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
}).array('media', 10);

let uploadedMedia = [];

app.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      const mediaData = await Promise.all(
        req.files.map(async (file, index) => {
          const isVideo = file.mimetype.startsWith('video');
          const duration = isVideo ? await getVideoDuration(file.path) : undefined;

          return {
            _id: index.toString(),
            path: file.originalname,
            duration: duration ? duration * 1000 : undefined, // Convert to milliseconds
            order: index + 1,
            text: req.body[`text_${index}`] || '',
            type: isVideo ? 'video' : 'image',
          };
        })
      );

      uploadedMedia = [...uploadedMedia, ...mediaData];
      console.log('Media received:', mediaData);
      res.send('Media uploaded');
    }
  });
});


function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration);
      }
    });
  });
}


app.get('/getMedia', (req, res) => {
  const mediaPaths = getUploadedMedia();
  res.json({ uploadedMedia: mediaPaths });
});

function getUploadedMedia() {
  return uploadedMedia;
}

app.put('/updateOrder/:mediaId/:newOrder', (req, res) => {
  const { mediaId, newOrder } = req.params;
  const { order } = req.body; // Extract order from the JSON body

  // Assuming uploadedMedia is defined and represents your data structure
  const mediaToUpdate = uploadedMedia.find((media) => media._id === mediaId);

  if (!mediaToUpdate) {
    console.error(`Media with ID ${mediaId} not found`);
    res.status(404).send('Media not found');
    return;
  }

  // Update the order property in your data structure
  mediaToUpdate.order = parseInt(order, 10);

  res.status(200).send('Order updated successfully');
});

app.put('/updateDuration/:mediaId/:newDuration', (req, res) => {
  const { mediaId, newDuration } = req.params;
  const mediaToUpdate = uploadedMedia.find((media) => media._id === mediaId);

  if (mediaToUpdate) {
    mediaToUpdate.duration = parseInt(newDuration, 10);
    res.send('Duration updated');
  } else {
    res.status(404).send('Media not found');
  }
});

app.put('/updateText/:mediaId', (req, res) => {
  const { mediaId } = req.params;
  const { text } = req.body; // Extract text from the JSON body

  const mediaToUpdate = uploadedMedia.find((media) => media._id === mediaId);

  if (mediaToUpdate) {
    mediaToUpdate.text = text;
    res.send('Text updated');
  } else {
    res.status(404).send('Media not found');
  }
});


app.delete('/removeMedia/:mediaId', (req, res) => {
  const { mediaId } = req.params;
  const mediaIndex = uploadedMedia.findIndex((media) => media._id === mediaId);

  if (mediaIndex !== -1) {
    uploadedMedia.splice(mediaIndex, 1);
    res.send('Media removed');
  } else {
    res.status(404).send('Media not found');
  }
});

app.use('/media', express.static(path.join(__dirname, 'public', 'media')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
