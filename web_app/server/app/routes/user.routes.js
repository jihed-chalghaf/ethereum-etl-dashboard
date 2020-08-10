module.exports = (app) => {
    const users = require('../controllers/user.controller.js');
    const addresses = require('../controllers/address.controller.js');
    const profiles = require('../controllers/profile.controller.js');
    const auth = require('../controllers/auth.controller');

    // unless
    var unless = require('express-unless');

    // assign auth fct to a local one in order to configre 'unless' property correctly
    const authenticateJWT = auth.authenticateJWT;
    authenticateJWT.unless = unless;

    // define our router object
    var router = require("express").Router();

    // integrate the jwt authentication function
    router.use(authenticateJWT.unless({
        path: [
            '/api/login',
            { url: '/api/users', methods: ['POST'] }, // registration, no need for auth
            { url: '/api/', methods: ['GET', 'PUT'] } // main uri called from front, to avoid errors
        ]
    }));

    // Create a new Address
    router.post('/addresses', function(req,res){
        addresses.create(req,res)
    });

    // Create a new Profile
    router.post('/profiles', function(req,res){
        profiles.create(req,res)
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
    router.post('/login', auth.login);

    // Logout
    router.post('/logout', auth.logout);

    // Retrieve a single Profile with profileId
    router.get('/profiles/:profileId', profiles.findOne);

    // Retrieve a single Address with profileId
    router.get('/addresses/:addressId', addresses.findOne);

    // Update a Profile with profileId
    router.patch('/profiles/:profileId', profiles.update);

    app.use('/api', router);

}
