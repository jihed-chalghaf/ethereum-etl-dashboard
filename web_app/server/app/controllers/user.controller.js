const User = require('../models/user.model.js').User;
const bcrypt = require ('bcryptjs');
const Address = require('../models/address.model.js').Address;
const Profile = require('../models/profile.model.js').Profile;

const addressController = require('../controllers/address.controller.js');
const profileController = require('../controllers/profile.controller.js');
const subscriptionController = require ('../controllers/subscription.controller.js');
const {registerValidation}= require ('../models/validation.js');

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const dbConfig = require('./../../config/database.config.js');

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

                    // Create a subscription
                    sub = req.body.subscription;
                    console.log('subscription from request',sub);
                    subscriptionController.create(sub.contract_address, sub.event_topic)
                        .then(subscription => {
                            console.log("> Created new Subscription\n", subscription);
                            // Create a user
                            const user =  new User({
                                username : req.body.username,
                                password : hashedPassword,
                                firstName : req.body.firstName,
                                lastName : req.body.lastName,
                                email : req.body.email,
                                role : "USER",
                                deleted: false,
                                profile: profile,
                                subscription: subscription
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
                        }) // subscription catch
                        .catch(err => console.log(err));
                }) // profile catch
                .catch(err => console.log(err));
        }) // address catch
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
                            'username': req.body.username,
                            'firstName': req.body.firstName,
                            'lastName': req.body.lastName,
                            'email': req.body.email,
                            'profile': profile,
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

// Updates only the user's subscription
exports.updateSubscription = async(req, res) => {
    // Validate Request
    if(!req.body) {
        return res.status(400).send({
            message: "request body can't be empty"
        });
    }
    // Begin with the update process
    subscriptionController.update(req.body)
        .then(subscription => {
            if(subscription == false) {
                console.log("subscription is false");
                return res.status(404).send({
                    message: "failed to update the user's subscription"
                });
            }
            console.log("Subscription Updated => ", subscription);
            // updated subscription successfully
            // updating user object in db finally
            User.findByIdAndUpdate(
                { _id: req.params.userId },
                {
                    'subscription': subscription
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
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Subscription not found with id " + req.body.id
                });                
            }
            return res.status(500).send({
                message: "Error updating subscription with id " + req.body.id
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
        // delete subscription
        subscriptionController.delete(formatted_user.subscription.id);
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

// Start Change Stream
exports.initChangeStream = async(req, res) => {
    // Validate request
    if(!req.body) {
        return res.status(400).send({
            message: "request body can't be empty, no subscription mentioned"
        });
    }
    // Define our pipeline
    const pipeline = [
        {
          '$match': { 'fullDocument.address': req.body.contract_address }
        }
    ];
    // If the user mentioned an event_topic in his subscription, then add it in our pipeline match filter
    if(req.body.event_topic) {
        pipeline[0]['$match']['fullDocument.topics'] = [req.body.event_topic];
    }
    console.log("##PIPELINE## => ", pipeline);
    // Connection String for our replicaSet
    const connectionString = dbConfig.url_rs;

    MongoClient.connect(
        connectionString,
        {
            useUnifiedTopology: false,
            useNewUrlParser: true
        }
    )
    .then(client => {
        console.log("Connected correctly to the replica set");
        // specify db and collections
        const db = client.db("EventsDB");
        const collection = db.collection("Events");
    
        const changeStream = collection.watch(pipeline);    // start listen to changes
        changeStream.on("change", function(change) {
          console.log(change);
          // send data using socket.io to the client app
          res.json({event_data: change.fullDocument});
        });
        // SHOULD END HERE, I'LL DELETE THE REST WHEN EVERYTHING IS TESTED
        // testing some inserts
        var events = [];
        events[0] = {
            address: '0x7983A52866ab5f48de61F1DECD3F79A5DfE9C1d1',
            topics: [
                '0x3990db2d31862302a685e8086b5755072a6e2b5b780af1ee81ece35ee3cd3345'
            ],
            blockNumber: 14354,
            logIndex: 0,
            removed: false,
            id: 'log_80b3cef1',
            transactionHash: '0xaf2ee33f68a1908e7528e08899d9b85afdea839c7bf35d82f4aee23d148d17e6',
            blockHash: '0x34860c9c54d792cbfc9536d61a4cdc81558e46a7c730e23451ea253565259af2',
            result: {
                '0': '0xe062C6acEF6e44a009dfF67bCBdDf2C780DdbC91',
                '1': '0xe062C6acEF6e44a009dfF67bCBdDf2C780DdbC91',
                '2': '50',
                _length_: 3
            }
        };

        events[1] = {
            address: '0x7983A52866ab5f48de61F1DECD3F79A5DfE9C1d1',
            topics: [
                '0x3990db2d31862302a685e8086b5755072a6e2b5b780af1ee81ece35ee3cd3345'
            ],
            blockNumber: 14354,
            logIndex: 0,
            removed: false,
            id: 'log_80b3cef2',
            transactionHash: '0xaf2ee33f68a1908e7528e08899d9b85afdea839c7bf35d82f4aee23d148d17f7',
            blockHash: '0x34860c9c54d792cbfc9536d61a4cdc81558e46a7c730e23451ea253565259af2',
            result: {
                '0': '0xe062C6acEF6e44a009dfF67bCBdDf2C780EdFD52',
                '1': '0xe062C6acEF6e44a009dfF67bCBdDf2C780EdFD52',
                '2': '60',
                _length_: 3
            }
        };
        // insert few data with timeout so that we can watch it happening
        setTimeout(function() {
        collection.insertOne(events[0], function(err) {
            assert.ifError(err);
        });
        }, 10000);
        setTimeout(function() {
            collection.insertOne(events[1], function(err) {
                assert.ifError(err);
            });
        }, 15000);
    })
    .catch(err => {
        console.error(err);
        return res.status(404).send({
            message: "failed to update the user's subscription",
            error: err
        });
    });
};