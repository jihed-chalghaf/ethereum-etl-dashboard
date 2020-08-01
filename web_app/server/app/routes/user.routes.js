module.exports = (app) => {
    const users = require('../controllers/user.controller.js');
    const add = require('../controllers/address.controller.js');
    const prof = require('../controllers/profile.controller.js');

    // define our router object
    var router = require("express").Router();

    // Create a new Address
    router.post('/addresses', function(req,res){
        add.create(req,res)
    });

    // Create a new Profile
    router.post('/profiles', function(req,res){
        prof.create(req,res)
    });

    // Create a new User
    router.post('/users', users.create);

    // Retrieve all Users
    router.get('/users', users.findAll);

    // Retrieve a single User with userId
    router.get('/users/:userId', users.findOne);

    // Update a User with userId
    router.patch('/users/:userId', users.update);

    // Delete a User with userId
    router.delete('/users/:userId', users.delete);

    // Login
    router.post('/login', users.login);

    // Retrieve a single Profile with profileId
    router.get('/profiles/:profileId', prof.findOne);

    // Retrieve a single Address with profileId
    router.get('/addresses/:addressId', add.findOne);

    // Update a Profile with profileId
    router.patch('/profiles/:profileId', prof.update);

    app.use('/api', router);
}