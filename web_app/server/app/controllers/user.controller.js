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
const { exit } = require('process');

const nedb = require('nedb');
const subs_db = new nedb('subscriptions.db');
// load data from the file
subs_db.loadDatabase();

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
    User.find({role: 'USER'})
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
    // force a subscription to have blockchain url & contract address not empty
    if(req.body.blockchain_url !== '' && req.body.contract_address == '') {
        console.log("You need to also provide the contract address");
        return res.status(400).send({
            message: "You need to also provide the contract address"
        });
    }
    else if(req.body.blockchain_url == '' && req.body.contract_address !== '') {
        console.log("You need to also provide the blockchain url");
        return res.status(400).send({
            message: "You need to also provide the blockchain url"
        });
    }
    else if(req.body.blockchain_url == '' && req.body.contract_address == '') {
        console.log("You need to provide the blockchain url & the contract address");
        return res.status(400).send({
            message: "You need to provide the blockchain url & the contract address"
        });
    }
    // Now everything is good
    // Begin with the update process
    else {
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
                    // check if the subscription already exists in nedb, in this case update it
                    // in the other case, create a new entry
                    new_sub = {
                        "blockchain_url": subscription.blockchain_url,
                        "contract_address": subscription.contract_address
                    };
                    if(subscription.event_topic) {
                        new_sub["event_topic"] = subscription.event_topic;
                    }
                    // add the new subscription to nedb subs if it's not already existant
                    subs_db.findOne(
                        {
                            userId: req.params.userId,
                            subscription: new_sub
                        },
                        function(err, doc) {
                            if(!doc) {
                                // we don't have a duplicate for the new subscription, so we insert it
                                subs_db.insert({
                                    userId: req.params.userId,
                                    subscription: new_sub
                                });
                            }
                        }
                    );
                    // retrieve the subs array for the user
                    subs_db.find(
                        {
                            userId: req.params.userId
                        },
                        function(err, docs) {
                            if(docs) {
                                for(doc in docs) {
                                    doc = doc.subscription;
                                }
                            }
                            res.json({user: user.transform(), subscriptions: docs});
                        }
                    );
                    //res.json({user: user.transform(), subscriptions: });
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
    }
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

// local function for building/updating our pipeline for the changeStream
function setupPipeline(subscription) {
    var pipeline = [
        {
          '$match': { 'fullDocument.url': subscription.blockchain_url, 'fullDocument.address': subscription.contract_address }
        }
    ];
    // If the user mentioned an event_topic in his subscription, then add it in our pipeline match filter
    if(subscription.event_topic) {
        pipeline[0]['$match']['fullDocument.topics'] = [subscription.event_topic];
    }
    return pipeline;
}

// update the collection for the subscription controller, then emit metrics
function emitMetrics(socket, subscription, collection) {
    subscriptionController.setEventsCollection(collection);
    subscriptionController.getMetrics(subscription)
    .then((metrics) => {
        socket.emit('metrics', metrics);
        console.log('> Sent an emit() metrics..');
        //console.log('metrics = ', metrics);
    });
}

// Connect to the replicaSet
exports.connectToReplicaSet = async() => {
    const connectionString = dbConfig.url_rs;

    return MongoClient.connect(
        connectionString,
        {
            useUnifiedTopology: false,
            useNewUrlParser: true
        }
    );
};

// Start Change Stream
exports.initChangeStream = async(socket, subscription) => {
    // Validate request
    if(!subscription) {
        console.log("Subscription Object is empty.. no changeStream for you");
        exit(0);
    }
    // Define our pipeline
    var pipeline = setupPipeline(subscription);
    console.log("[i] ChangeStream Pipeline => ", pipeline);
    this.connectToReplicaSet()
    .then(client => {
        console.log("Connected successfully to the replica set");
        // specify db and collections
        const db = client.db("EventsDB");
        const collection = db.collection("Events");
        // this emit is necessary otherwise if we leave requestMetrics in dashboard component
        // it won't wait for this connection to be established then it won't display correct data
        // so I ended up forcing the dashboard to look for the previous url which I send only after
        // subscribing
        emitMetrics(socket, subscription, collection);
        var changeStream = collection.watch(pipeline);    // start listening to changes
        changeStream.on("change", function(change) {
          console.log(change);
          // send data using socket.io to the client app
          socket.emit('newEvent', change.fullDocument);
          console.log('> Sent an emit() newEvent..');
          // update the collection for our metrics to be in real time, might not be needed
          emitMetrics(socket, subscription, collection);
        });

        // if there's a requestMetrics event launched by the client, we'll send him the metrics
        socket.on('requestMetrics', () => {
            console.log('> Got a requestMetrics event in changeStream'); 
            emitMetrics(socket, subscription, collection);
        });

        // close changeStream and MongoClient when user disconnects
        socket.on('closeChangeStreamAndDBConnection', () => {
            console.log('User disconnecting, closing changeStream and MongoClient..');
            changeStream.close().then(() => {
                client.close();
            });
        });
    })
    .catch(err => {
        console.log("failed to update the user's subscription");
        console.error(err);
        exit(0);
    });
};

exports.getSubscriptions = async(req, res) => {
    subs_db.find(
        {
            userId: req.params.userId
        },
        function(err, docs) {
            res.json({subscriptions: docs});
        }
    );
}

function compareSubs(sub1,sub2) {
    return(
        sub1.blockchain_url == sub2.blockchain_url &&
        sub1.contract_address == sub2.contract_address &&
        sub1.event_topic == sub2.event_topic
    );
}

exports.deleteSubscription = async(req, res) => {
    // delete the subscription from nedb
    console.log('req.body');
    console.log(req.body);
    subs_db.remove(
        {
            userId: req.params.userId,
            subscription: req.body
        }, 
        function (err, numRemoved) {
            console.log('removed => ', numRemoved);
            console.log('error => ', err);
        }
    );
    // reset the user's subscription if the deleted sub is active
    User.findById(req.params.userId).then(
        user => {
            if(!user) {
                console.log("User not found..");
                exit(0);
            }
            // compare user's subscription with the one that'll be deleted
            if(compareSubs(user.subscription, req.body)) {
                // we need to make the active sub empty
                console.log(`the sub you're trying to delete is your active sub..`);
                empty_sub = {
                    id: user.subscription.id,
                    blockchain_url: '',
                    contract_address: '',
                    event_topic: ''
                };
                console.log('empty sub ==>');
                console.log(empty_sub);
                subscriptionController.update(empty_sub).then(
                    new_sub => {
                        if(new_sub == false) {
                            console.log("subscription is false");
                            return res.status(404).send({
                                message: "failed to update the user's subscription"
                            });
                        }
                        console.log('new sub =>');
                        console.log(new_sub);
                        // subscription updated, now we need to push that change in user object
                        User.findByIdAndUpdate(
                            { _id: req.params.userId },
                            {
                                'subscription': new_sub
                            },
                            { new: true }
                            ).then(user => {
                                if(!user) {
                                    return res.status(404).send({
                                        message: "User not found with id " + req.params.userId
                                    });
                                }
                                console.log('user updated => ');
                                console.log(user);
                                // retrieve the subs array for the user
                                subs_db.find(
                                    {
                                        userId: req.params.userId
                                    },
                                    function(err, docs) {
                                        if(docs) {
                                            for(doc in docs) {
                                                doc = doc.subscription;
                                            }
                                        }
                                        res.json({user: user.transform(), subscriptions: docs});
                                    }
                                );
                            })
                    }
                )
            }
            else {
                // the deleted subscription is not the active one, return directly the user and subs
                User.findById(
                    { _id: req.params.userId }
                ).then(
                    user => {
                        subs_db.find(
                            {
                                userId: req.params.userId
                            },
                            function(err, docs) {
                                if(docs) {
                                    for(doc in docs) {
                                        doc = doc.subscription;
                                    }
                                }
                                res.json({user: user.transform(), subscriptions: docs});
                            }
                        ); 
                    }
                )
            }
        }
    )
}