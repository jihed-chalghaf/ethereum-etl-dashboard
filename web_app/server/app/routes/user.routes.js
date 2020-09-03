module.exports = (app) => {
    const users = require('../controllers/user.controller.js');
    const addresses = require('../controllers/address.controller.js');
    const profiles = require('../controllers/profile.controller.js');
    const auth = require('../controllers/auth.controller');

    // express-acl
    const acl = require('express-acl');

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

    // configure the acl
    let aclConfigObject = {
        baseUrl: 'api',
        // will search for the role in req.user.role
        roleSearchPath: 'user.role',
        defaultRole: 'anonymous',
        denyCallback: (res) => {
            return res.status(403).json({
                status: 'Access Denied',
                success: false,
                message: 'You are not authorized to access this resource'
            });
        }
    };
  
    acl.config(aclConfigObject);

    //integrate express-acl for authorization, we're skipping auth routes
    router.use(acl.authorize.unless(
        {
          path: [
            '/api/login',
            '/api/logout',
            { url: '/api/users', methods: ['POST'] } // at the end we'll remove this line}
          ]
        }
    ));

    // Create a new User
    router.post('/users', users.create);

    // Retrieve all Users
    router.get('/users', users.findAll);

    // Retrieve a single User with userId
    router.get('/users/:userId', users.findOne);

    // Update a User with userId
    router.patch('/users/:userId', users.update);

    // Update a User's subscription using his id
    router.patch('/users/:userId/subscription', users.updateSubscription);

    // Delete a User with userId
    router.delete('/users/:userId', users.delete);

    // Initiate or Update the change stream for a user
    router.post('/users/:userId/changeStream', users.initChangeStream);

    // Update subscriptions array in nedb
    router.get('/users/:userId/subscriptions', users.getSubscriptions);

    // patch the subscription (deleting means making it empty in our case)
    router.patch('/users/:userId/subscriptions', users.deleteSubscription);

    // Login
    router.post('/login', auth.login);

    // Logout
    router.post('/logout', auth.logout);

    // Retrieve a single Profile with profileId
    router.get('/profiles/:profileId', profiles.findOne);

    // Retrieve a single Address with profileId
    router.get('/addresses/:addressId', addresses.findOne);

    app.use('/api', router);

}
