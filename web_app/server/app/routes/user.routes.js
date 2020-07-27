module.exports = (app) => {
    const users = require('../controllers/user.controller.js');

    // Create a new User
    app.post('/users', users.create);

    // Retrieve all Users
    app.get('/users', users.findAll);

    // Retrieve a single User with noteId
    app.get('/users/:userId', users.findOne);

    // Update a User with noteId
    app.put('/users/:userId', users.update);

    // Delete a User with noteId
    app.delete('/users/:userId', users.delete);

    // Login
    app.post('/login', function(req,res){
        users.login
    });

    //Logout
    app.get('/logout', function(req,res){
        users.logout
    });


}