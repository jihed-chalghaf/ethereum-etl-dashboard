const User = require('../models/user.model.js').User;
const jwt = require ('jsonwebtoken');
const bcrypt = require ('bcryptjs');
const Address = require('../models/address.model.js').Address;
const Profile = require('../models/profile.model.js').Profile;

const addressController = require('../controllers/address.controller.js');
const profileController = require('../controllers/profile.controller.js');
const {registerValidation, loginValidation}= require ('../models/validation.js');

// Find a single User with a userId
exports.findOne = (req, res) => {
    User.findById(req.params.userId)
        .then(user => {
            if(!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId
                });
            }
            res.send(user.transform());
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


// Create and Save a new User
exports.create = async (req, res) => {

    // Validate request
    if(!req.body) {
        return res.status(400).send({
            message: "request body can't be empty"
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

    console.log('before profile');
    // Create an address
    // Get the address from the request
    adr = req.body.profile.address;
    console.log('address from request',adr);
    addressController.create(adr.city, adr.postal_code,adr.street,adr.country)
        .then (address => {
            console.log("> Created new Address\n", address);

            // Create a profile
            // Get the profile from the request
            profile_from_req = req.body.profile;
            console.log('profile from request', profile_from_req);
            profileController.create(profile_from_req.gender, profile_from_req.phone_number, profile_from_req.birthDate, address)
                .then(profile => {

                    console.log("> Created new Profile\n", profile);

                    // Create a user
                    const user =  User.create({
                        username : req.body.username,
                        password : hashedPassword,
                        firstName : req.body.firstName,
                        lastName : req.body.lastName,
                        email : req.body.email,
                        role : "user",
                        profile: profile ,

                    });

                    // Save User in the database
                    try {
                        const savedUser = user.save();
                        console.log('user created : ', savedUser);
                        res.send(savedUser);
                    } catch (err) {
                        res.status(400).send(err);
                    }
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err));

};

// Retrieve and return all users from the database.
exports.findAll = (req, res) => {
    User.find()
    .then(users => {
        for(var user of users) {
            user = user.transform();
        }
        res.send(users);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    });
};


// Update a User identified by the userId in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.body) {
        return res.status(400).send({
            message: "request body can't be empty"
        });
    }

    // Find user and update it with the request body
    User.findByIdAndUpdate(req.params.userId, {
        username : req.body.username,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        profile: req.body.profile,
    }, {new: true})
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });
        }
        res.send(user.transform());
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
            if (!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId
                });
            }
            res.send({message: "User deleted successfully!"});
        }).catch(err => {
        if (err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });
        }
        return res.status(500).send({
            message: "Could not delete user with id " + req.params.userId
        });
    });
};
exports.login = async (req, res) =>{
    // Validation of the data before adding a user
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    // Making sure the email exists
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Email or password is wrong');
    // Password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send('Invalid password');

    // Create and assign a token
    const token = jwt.sign({id: user._id}, process.env.TOKEN_SECRET );
   // res.header('auth-token',token).send(token);
    res.status(200).json({ user: user.transform(), token: token });

};


