module.exports = (app) => {
    const users = require('../controllers/user.controller.js');
    const add = require('../controllers/address.controller.js');
    const prof = require('../controllers/profile.controller.js');


    // Create a new Address
    app.post('/address', function(req,res){
        add.create(req,res)
    });

    // Create a new Profile
    app.post('/profile', function(req,res){
        prof.create(req,res)
    });

    // Create a new User
    app.post('/users', users.create);

    // Retrieve all Users
    app.get('/users', users.findAll);

    // Retrieve a single User with userId
    app.get('/users/:userId', users.findOne);

    // Update a User with userId
    app.patch('/users/:userId', users.update);

    // Delete a User with userId
    app.delete('/users/:userId', users.delete);

    // Login
    app.post('/login', users.login);

    // Retrieve a single Profile with profileId
    app.get('/profile/:profileId', prof.findOne);

    // Retrieve a single Address with profileId
    app.get('/address/:addressId', add.findOne);

    // Update a Profile with profileId
    app.patch('/profile/:profileId', prof.update);


}