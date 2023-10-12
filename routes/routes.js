const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');
// image
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.filename + '_' + Date.now() + '_' + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single('image');

// Insert a user into the database in the router
router.post('/add', upload, async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      image: req.file.filename,
    });

    await user.save();
    req.session.message = {
      type: 'success',
      message: 'User Added Successfully',
    };
    res.redirect('/');
  } catch (err) {
    res.json({ message: err.message, type: 'danger' });
  }
});

// Get all users route using async/await
router.get('/', async (req, res) => {
  try {
    const users = await User.find().exec();
    res.render('index', {
      title: 'Home page',
      users: users,
    });
  } catch (err) {
    res.json({ message: err.message, type: 'danger' });
  }
});



router.get('/add', (req, res) => {
  res.render('add_user', { title: 'Add users' });
});

//edit user route
router.get('/edit/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findById(id).exec();
  
      if (user === null) {
        res.redirect('/');
      } else {
        res.render('edit_users', {
          title: 'Edit users',
          user: user,
        });
      }
    } catch (err) {
      res.redirect('/'); // Handle the error as needed
    }
  });
  //update user route
  router.post('/update/:id', upload, async (req, res) => {
    try {
      const id = req.params.id;
      let new_image = '';
  
      if (req.file) {
        new_image = req.file.filename;
        try {
          fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
          console.log(err);
        }
      } else {
        new_image = req.body.old_image;
      }
  
      const result = await User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
      });
  
      if (!result) {
        res.json({ message: 'User not found', type: 'danger' });
      } else {
        req.session.message = {
          type: 'success',
          message: 'User updated successfully',
        };
        res.redirect('/');
      }
    } catch (err) {
      res.json({ message: err.message, type: 'danger' });
    }
  });
  
  // Delete user by name route
  router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const user = await User.findById(id).exec();
        
        if (user) {
            if (user.image !== '') {
                try {
                    fs.unlinkSync('./uploads/' + user.image);
                } catch (err) {
                    console.log(err);
                }
            }
            await User.findByIdAndRemove(id).exec();
            req.session.message = {
                type: 'info',
                message: 'User deleted successfully',
            };
        } else {
            req.session.message = {
                type: 'info',
                message: 'User not found',
            };
        }
        
        res.redirect('/');
    } catch (err) {
        res.json({
            message: err.message,
        });
    }
});


  

module.exports = router;
