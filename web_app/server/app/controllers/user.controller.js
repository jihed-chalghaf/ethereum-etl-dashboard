const User = require('../models/user.model.js');
const bcrypt = require ('bcryptjs');
const {registerValidation, loginValidation}= require ('../models/validation.js');

// Create and Save a new User
exports.create = async (req, res) => {

    // Validate request
    if(!req.body) {
        return res.status(400).send({
            message: "User content can not be empty"
        });
    }
    // Validation of the data before adding a user
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    // Checking if the user is already in the database
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('Email already exists');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a user
    const user = new User({
        username : req.body.username,
        password : hashedPassword,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        role : req.body.role,
        age : req.body.age,
        gender : req.body.gender,
        address: {
            street: req.body.address.street,
            city: req.body.address.city,
            state: req.body.address.state,
            postal_code: req.body.address.postal_code,
            country: req.body.address.country
        }
    });

    // Save User in the database
    try {
        const savedUser = await user.save();
        res.send({user: user._id});
    } catch (err) {
        res.status(400).send(err);
    }
};

// Retrieve and return all users from the database.
exports.findAll = (req, res) => {
    User.find()
    .then(users => {
        res.send(users);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    });
};

// Find a single User with a userId
exports.findOne = (req, res) => {
    User.findById(req.params.userId)
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });
        }
        return res.status(500).send({
            message: "Error retrieving user with id " + req.params.userId
        });
    });
};

// Update a User identified by the userId in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.body.content) {
        return res.status(400).send({
            message: "User content can not be empty"
        });
    }

    // Find user and update it with the request body
    User.findByIdAndUpdate(req.params.userId, {
        id: req.body.id,
        username : req.body.username,
        password : req.body.password,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        role : req.body.role,
        age : req.body.age,
        gender : req.body.gender,
        address: {
            street: req.body.address.street,
            city: req.body.address.city,
            state: req.body.address.state,
            postal_code: req.body.address.postal_code,
            country: req.body.address.country
        }
    }, {new: true})
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });
        }
        res.send(user);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });                
        }
        return res.status(500).send({
            message: "Error updating user with id " + req.params.userId
        });
    });
};

// Delete a User with the specified userId in the request
exports.delete = (req, res) => {
    User.findByIdAndRemove(req.params.userId)
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });
        }
        res.send({message: "User deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });                
        }
        return res.status(500).send({
            message: "Could not delete user with id " + req.params.userId
        });
    });

exports.login = async (req, res) =>{
    // Validation of the data before adding a user
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
console.log('hiiiiiiiiiiiiiiii');
    // Making sure the email exists
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Email or password is wrong');
console.log('111111111111111');
    // Password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send('Invalid password');

}

exports.logout= async (req,res) => {
    req.logout();
    res.redirect('/login');

}
};