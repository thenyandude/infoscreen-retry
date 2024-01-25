const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = require('ffprobe-static').path;
const crypto = require('crypto');
const fs = require('fs');

const User = require('./models/User');


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
      let txtFileContent = '';
      const textFile = req.files.find(file => file.originalname.endsWith('.txt'));
      
      if (textFile) {
        txtFileContent = fs.readFileSync(textFile.path, 'utf8');
      }

      const mediaData = await Promise.all(
        req.files.map(async (file, index) => {
          const isVideo = file.mimetype.startsWith('video');
          let duration;
          let textContent = '';

          if (isVideo) {
            // If it's a video, get the duration from the video metadata
            const videoDuration = await getVideoDuration(file.path);
            duration = videoDuration ? videoDuration * 1000 : undefined;
          } else {
            // If it's an image or text file, use the duration provided from the client-side
            duration = req.body[`duration_${index}`] ? parseInt(req.body[`duration_${index}`], 10) : undefined;
          }

          if (file.originalname.endsWith('.txt')) {
            // If it's the .txt file, use its content as the text
            textContent = txtFileContent;
          } else {
            // For other files, use the text provided from the client-side
            textContent = req.body[`text_${index}`] || '';
          }

          return {
            _id: index.toString(),
            path: file.originalname,
            duration: duration,
            order: index + 1,
            text: textContent,
            type: file.mimetype.startsWith('video') ? 'video' : 'image',
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


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userData = User.load(username);
    if (!userData) {
      return res.status(401).send('User not found');
    }

    const user = new User(userData.username, userData.password, userData.role);
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
  if (User.load(username)) {
    return res.status(409).send('User already exists');
  }

  try {
    const newUser = new User(username, '');
    await newUser.setPassword(password); // Hash password
    User.save(username, newUser.password); // Save new user

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Internal server error');
  }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
