const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const mongoose = require('mongoose');

const Post = require('./models/post');
const User = require('./models/user'); // Adjust the import path as necessary
const Comment = require('./models/comment'); 

const app = express();
app.use(bodyParser.json());
app.use(express.json()); // for parsing application/json



mongoose
  .connect(
    "mongodb+srv://dbRonnie:db123456@cluster0.wjagovz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log('Connected to database')
  })
  .catch(() => {
    console.log('Connection failed')
  });

app.get('/api/db-status', (req, res) => {
  const state = mongoose.connection.readyState;
  const status = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.status(200).json({
    message: `Database connection status: ${status[state]}`
  });
});

app.use(cors()); // Use the cors middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
   app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  res.setHeader("Acess-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, x-Requested-with, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads'); // Specify the directory where you want to save the uploaded files
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name for saving
    }
  });
  
  // File type filter function
  const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  };
  
  // Create Multer instance with file type filter
  const upload = multer({ 
    storage: storage, 
    fileFilter: imageFilter 
  });

// POST endpoint to handle file upload
app.post('/api/upload', upload.single('image'), (req, res) => {
  // Multer middleware has saved the file. You can handle further processing here.
  res.status(200).json({ message: 'File uploaded successfully' });
});

// POST endpoint to handle post creation with an image
// POST endpoint to handle post creation with an image
app.post('/api/posts/image', upload.single('image'), (req, res, next) => {
  if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
  }
  // Ensure the imagePath uses forward slashes
  const imagePath = req.file.path.replace(/\\/g, '/');
  const post = new Post({
     title: req.body.title,
     content: req.body.content,
     imagePath: imagePath, // Use the modified imagePath
     author: req.body.author
  });
 
  post.save()
     .then(createdPost => {
      console.log('Image Path:', createdPost.imagePath);

       console.log(createdPost);
       res.status(201).json({
         message: 'Post added successfully!',
         postId: createdPost._id,
         imagePath: createdPost.imagePath // Make sure this line is present



         
       });
     })
     .catch(error => {
       console.error(error);
       res.status(500).json({ message: 'Post creation failed!' });
     });
});


app.get("/api/posts", (req, res, next) => {
  Post.find().then(documents => {
    res.status(200).json({
      message: 'Posts fetched successfully',
      posts: documents
    });
  });
});

app.delete('/api/posts/:_id', (req, res) => {
  const postId = req.params._id;
  Post.findByIdAndDelete(postId)
    .then(() => {
      res.status(200).json({ message: 'Post deleted successfully' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Error deleting post' });
    });
});

app.put('/api/posts/:_id', (req, res) => {
  const postId = req.params._id;
  const updatedPost = {
    title: req.body.title,
    content: req.body.content
  };

  Post.findByIdAndUpdate(postId, updatedPost, { new: true })
    .then(post => {
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json({
        message: 'Post updated successfully',
        post: post
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Error updating post' });
    });
});



const bcrypt = require('bcrypt');
const saltRounds = 10; // You can adjust the salt rounds for more or less security

app.post('/api/register', async (req, res) => {
  try {
    const { email, password,username } = req.body;
    console.log(req.body); // Temporarily log the request body to verify it contains 'username'

    // Validate the data here (e.g., check if email is valid, password meets criteria)
    if (!email ||!password ||!username) {
      return res.status(400).send({ message: 'Email and password are required' });
    }

    // Password validation rules
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$%*?&.])[a-zA-Z\d@$%*?&.]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).send({ message: 'Password must contain at least 8 characters including uppercase, lowercase letters and numbers.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ message: 'Username already exists. Please choose a different username.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with the hashed password
    const user = new User({ email, password: hashedPassword,username });
    await user.save();

    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).send({ message: 'Registration failed' });
  }
});

const jwt = require('jsonwebtoken'); // Make sure to install jsonwebtoken

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If credentials are valid, generate a JWT token
    const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1m' }); // Set expiration to 1 minute

    // Send the token in the response
    res.status(200).json({ token,userId: user._id, username: user.username  });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});



// Route to get the count of posts
app.get('/api/posts/count', async (req, res) => {
  try {
      const count = await Post.countDocuments({});
      res.status(200).json({ count });
  } catch (error) {
      res.status(500).json({ message: 'Error fetching posts count' });
  }
});

app.post('/api/comments', (req, res) => {
  const newComment = new Comment({
    postId: req.body.postId,
    userId: req.body.userId,
    comment: req.body.comment,
    username: req.body.userName
  });

  newComment.save()
   .then(comment => res.status(201).json(comment))
   .catch(err => res.status(500).json({ message: 'Creating the comment failed'}));
});

// In your app.js or a specific route file
// Assuming you have a Comment model and a User model, and comments include a userId field
app.get('/api/comments/:postId', (req, res) => {
  
  const postId = req.params.postId;
  Comment.find({ postId: postId }).populate('userId', 'username').then(comments => {
    res.status(200).json(comments);
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching comments' });
});
});

module.exports = app;
