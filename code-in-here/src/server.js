const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = require('ffprobe-static').path;
const crypto = require('crypto');
const fs = require('fs');

const mongoose = require('mongoose')
const dburi = "mongodb+srv://nyan:AOAEUkm7gAqv0xEr@infoscreen-data.93a1fol.mongodb.net"

const DbUser = require('./models/DbUser');
const Media = require('./models/Media'); // Adjust the path to your Media model




const app = express();

mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;


app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected successfully');
});

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
  limits: { fileSize: 10737418240 }
}).array('media', 10);

let uploadedMedia = [];

app.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {

      console.log('Files uploaded:', req.files.length);

      
      let txtFileContent = '';
      const textFile = req.files.find(file => file.originalname.endsWith('.txt'));
      
      if (textFile) {
        txtFileContent = fs.readFileSync(textFile.path, 'utf8');
      }

        for (const [index, file] of req.files.entries()) {
          const isVideo = file.mimetype.startsWith('video');
          let duration;
          let textContent = '';

          if (isVideo) {
            const videoDuration = await getVideoDuration(file.path);
            duration = videoDuration ? videoDuration * 1000 : undefined;
          } else {
            duration = req.body[`duration_${index}`] ? parseInt(req.body[`duration_${index}`], 10) : undefined;
          }

          if (file.originalname.endsWith('.txt')) {
            textContent = txtFileContent;
          } else {
            textContent = req.body[`text_${index}`] || '';
          }

          let fileType = 'other';
          if (file.mimetype.startsWith('video')) {
            fileType = 'video';
          } else if (file.mimetype.startsWith('image')) {
            fileType = 'image';
          } else if (file.mimetype.startsWith('text')) {
            fileType = 'text';
          }

          // Create a new Media document and save it to MongoDB
          const newMedia = new Media({
            title: file.originalname, // Or any other title logic
            type: fileType,
            path: file.path, // Adjust if needed
            duration: duration,
            order: index + 1,
            text: textContent,
            // other fields...
          });

          try {
            await newMedia.save();
          } catch (saveError) {
            console.error('Error saving media item to database:', saveError);
            // Handle error
          }
        }

        console.log('Media saved to database');
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

app.use('/media', express.static(path.join(__dirname, 'public/media')));


app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await DbUser.findOne({ username: username });
      if (!user) {
        return res.status(401).send('User not found');
      }
  
      if (await user.validatePassword(password)) {
        // User authenticated, generate a token
        const token = crypto.randomBytes(16).toString('hex');
        // Include the user's role in the response
        res.json({ token: token, role: user.role, message: 'Login successful' });
      } else {
        res.status(401).send('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send('Internal server error');
    }
  });
  




  app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
  
    // Check if user already exists
    const existingUser = await DbUser.findOne({ username: username });
    if (existingUser) {
      return res.status(409).send('User already exists');
    }
  
    try {
      // Create a new user and save to the database
      const newUser = new DbUser({ username, password });
      await newUser.save();
  
      res.status(201).send('User registered successfully');
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).send('Internal server error');
    }
  });
  


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
