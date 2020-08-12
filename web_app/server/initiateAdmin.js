// create an admin for our app, this will be included on the server
// then it'll be commented after the creation

const users = require('./app/controllers/user.controller.js');

var admin = {
    username: "admin4life",
    password: "admin123",
    firstName: "Alain",
    lastName: "Smith",
    email: "admin@talan.com"
}

users.createAdmin(admin);