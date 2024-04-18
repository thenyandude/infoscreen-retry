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

const allowedOrigins = ['http://10.12.5.16', 'http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps, curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected successfully');
});

// Set the path to ffprobe
ffmpeg.setFfprobePath(ffprobePath);

const storage = multer.diskStorage({
  destination: '/var/www/html/media',
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
          path: file.originalname, // Adjust if needed
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


app.get('/getMedia', async (req, res) => {
  try {
    const mediaItems = await Media.find({}).sort({ order: 1 }); // Fetch media items from MongoDB and sort them by order
    res.json({ uploadedMedia: mediaItems });
  } catch (error) {
    console.error('Error fetching media from database:', error);
    res.status(500).send('Internal server error');
  }
});


function getUploadedMedia() {
  return uploadedMedia;
}

app.put('/updateOrder/:mediaId', async (req, res) => {
  const { mediaId } = req.params;
  const { newOrder } = req.body;

  try {
    const mediaToUpdate = await Media.findById(mediaId);
    if (!mediaToUpdate) {
      return res.status(404).send('Media not found');
    }

    mediaToUpdate.order = parseInt(newOrder, 10);
    await mediaToUpdate.save();

    res.status(200).send('Order updated successfully');
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).send('Internal server error');
  }
});



app.put('/updateDuration/:mediaId', async (req, res) => {
  const { mediaId } = req.params;
  const { newDuration } = req.body; // Make sure this matches what you send in Postman

  try {
    const mediaToUpdate = await Media.findById(mediaId);
    if (!mediaToUpdate) {
      return res.status(404).send('Media not found');
    }

    mediaToUpdate.duration = parseInt(newDuration, 10);
    await mediaToUpdate.save();

    res.send('Duration updated');
  } catch (error) {
    console.error('Error updating duration:', error);
    res.status(500).send('Internal server error');
  }
});


app.put('/updateText/:mediaId', async (req, res) => {
  const { mediaId } = req.params;
  const { text } = req.body;

  try {
    // Find the media document in the database by its ID
    const mediaToUpdate = await Media.findById(mediaId);

    // Check if the media was found
    if (!mediaToUpdate) {
      return res.status(404).send('Media not found');
    }

    // Update the text field
    mediaToUpdate.text = text;

    // Save the updated media document back to the database
    await mediaToUpdate.save();

    res.send('Text updated');
  } catch (error) {
    console.error('Error updating text:', error);
    res.status(500).send('Internal server error');
  }
});



app.delete('/removeMedia/:mediaId', async (req, res) => {
  const { mediaId } = req.params;

  try {
    const result = await Media.findByIdAndDelete(mediaId);
    if (result) {
      res.send('Media removed successfully');
    } else {
      res.status(404).send('Media not found');
    }
  } catch (error) {
    console.error('Error removing media:', error);
    res.status(500).send('Internal server error');
  }
});




app.use('/media', express.static(path.join(__dirname, 'public/media')));


app.get('/api/users', async (req, res) => {

  try {
      const users = await DbUser.find({}, '-password'); // Fetch all users excluding the password
      res.json(users);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Internal server error');
  }
});


app.post('/api/toggle-approval/:userId', async (req, res) => {
  const { userId } = req.params;
  const { isApproved } = req.body; // New approval status sent from the client
  // Authentication and authorization checks should be here

  try {
      const user = await DbUser.findById(userId);
      if (!user) {
          return res.status(404).send('User not found');
      }
      user.isApproved = isApproved;
      await user.save();
      res.send(`User approval status updated to: ${isApproved}`);
  } catch (error) {
      console.error('Error toggling user approval:', error);
      res.status(500).send('Internal server error');
  }
});


app.post('/api/toggleAdmin/:userId', async (req, res) => {
  const { userId } = req.params;
  const { newRole } = req.body;

  try {
      await DbUser.findByIdAndUpdate(userId, { role: newRole });
      res.status(200).send('User role updated successfully');
  } catch (error) {
      res.status(500).send('Error updating user role');
  }
});





app.delete('/api/delete-user/:userId', async (req, res) => {
  const { userId } = req.params;
  // Authentication and authorization checks should be here

  try {
      const result = await DbUser.findByIdAndDelete(userId);
      if (result) {
          res.send('User deleted successfully');
      } else {
          res.status(404).send('User not found');
      }
  } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).send('Internal server error');
  }
});



app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await DbUser.findOne({ username: username });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isApproved) {
      return res.status(401).json({ message: 'Account not approved yet' });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Wrong password' });
    }


    const token = crypto.randomBytes(16).toString('hex');
    // Include isApproved in the response
    res.json({ token: token, role: user.role, isApproved: user.isApproved, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




  




app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  console.log('Checking for existing user');
const existingUser = await DbUser.findOne({ username: username });
console.log('Existing user check complete:', existingUser);

  if (existingUser) {
    return res.status(409).send('User already exists');
  }

  try {
    const newUser = new DbUser({ username, password, isApproved: false });
    await newUser.save();

    res.status(201).send('User registered, pending approval');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Internal server error');
  }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
