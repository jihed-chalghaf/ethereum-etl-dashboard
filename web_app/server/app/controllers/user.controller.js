const User = require('../models/user.model.js').User;
const bcrypt = require ('bcryptjs');
const Address = require('../models/address.model.js').Address;
const Profile = require('../models/profile.model.js').Profile;

const addressController = require('../controllers/address.controller.js');
const profileController = require('../controllers/profile.controller.js');
const {registerValidation}= require ('../models/validation.js');

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
            profileController.create(profile_from_req.gender, profile_from_req.phoneNumber, profile_from_req.birthDate, address)
                .then(profile => {

                    console.log("> Created new Profile\n", profile);

                    // Create a user
                    const user =  new User({
                        username : req.body.username,
                        password : hashedPassword,
                        firstName : req.body.firstName,
                        lastName : req.body.lastName,
                        email : req.body.email,
                        role : "USER",
                        deleted: false,
                        profile: profile ,
                    });


                    // Save User in the database
                    try {
                        user.save()
                        .then(newUser => {
                            console.log('user created : ', newUser);
                            res.send(newUser);
                        })
                        .catch(err => console.log(err));
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
exports.update = async(req, res) => {
    // Validate Request
    if(!req.body) {
        return res.status(400).send({
            message: "request body can't be empty"
        });
    }

    new_profile = req.body.profile;
    console.log("new_profile inside user controller => ", new_profile);
    // Updating user's address
    addressController.update(new_profile.address)
        .then(address => {
            if(address == false) {
                console.log("address is false");
                return res.status(404).send({
                    message: "failed to update the user's address"
                });
            }
            new_profile.address = address;
            console.log("Address Updated => ", address);
            // updated user's address successfully
            // Updating User's profile
            profileController.update(new_profile)
                .then(profile => {
                    if(profile == false) {
                        console.log("profile is false");
                        return res.status(404).send({
                            message: "failed to update the user's profile"
                        });
                    }
                    console.log("Profile Updated => ", profile);
                    // updated profile and address successfully
                    // updating user object in db finally
                    User.findByIdAndUpdate(
                        { _id: req.params.userId },
                        {
                            username: req.body.username,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            profile: profile,
                        },
                        { new: true }
                        ).then(user => {
                        if(!user) {
                            return res.status(404).send({
                                message: "User not found with id " + req.params.userId
                            });
                        }
                        res.json({user: user.transform()});
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
                }
            ).catch(err => {
                if(err.kind === 'ObjectId') {
                    return res.status(404).send({
                        message: "Profile not found with id " + new_profile.id
                    });                
                }
                return res.status(500).send({
                    message: "Error updating profile with id " + new_profile.id
                });
            });
        }
    ).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Address not found with id " + new_profile.address.id
            });                
        }
        return res.status(500).send({
            message: "Error updating address with id " + new_profile.address.id
        });
    });
};


// Delete a User with the specified userId in the request
exports.delete = async(req, res) => {
    // get full user to get his profile.id and address.id
    User.findById(req.params.userId)
    .then(user => {
        if(!user) {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });
        }
        var formatted_user = user.transform();
        // delete address
        addressController.delete(formatted_user.profile.address.id);
        // delete profile
        profileController.delete(formatted_user.profile.id);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + req.params.userId
            });
        }
    });
    // address and profile were deleted successfully
    // delete user finally
    User.findByIdAndRemove(req.params.userId)
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.userId
                });
            }
            console.log("User deleted successfully!");
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

// Create and Save a new User
exports.createAdmin = async (admin) => {
    empty_address = new Address();
    empty_profile = new Profile();
    empty_profile.address = empty_address;
    admin.profile = empty_profile;
    // Validation of the data before adding a user
    const {error} = registerValidation(admin);
    if(error) {
        console.log("Admin creation validation is erronous", error);
        return false;
    }

    // Checking if the user is already in the database
    const emailExist = await User.findOne({email: admin.email});
    if(emailExist) { 
        console.log('Email already exists');
        return false;
    }

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(admin.password, salt);

    console.log('before profile');
    // Create an address
    // Get the address from the request
    adr = admin.profile.address;
    console.log('address from request',adr);
    addressController.create(adr.city, adr.postal_code,adr.street,adr.country)
        .then (address => {
            console.log("> Created new Address\n", address);

            // Create a profile
            // Get the profile from the request
            profl = admin.profile;
            console.log('profile from request', profl);
            profileController.create(profl.gender, profl.phoneNumber, profl.birthDate, address)
                .then(profile => {

                    console.log("> Created new Profile\n", profile);

                    // Create a user
                    const new_admin =  new User({
                        username : admin.username,
                        password : hashedPassword,
                        firstName : admin.firstName,
                        lastName : admin.lastName,
                        email : admin.email,
                        role: "ADMIN",
                        deleted: false,
                        profile: profile,
                    });


                    // Save Admin in the database
                    try {
                        new_admin.save()
                        .then(newAdmin => {
                            console.log('admin created : ', newAdmin);
                            return true;
                        })
                        .catch(err => console.log(err));
                    } catch (err) {
                        console.log(err);
                        return false;
                    }
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err));

};