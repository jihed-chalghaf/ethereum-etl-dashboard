
const Address = require('../models/address.model.js');
const Profile = require('../models/profile.model.js').Profile;
const multer = require('multer');
const upload = multer({dest: 'img/'});


// Create a profile
exports.create =  function (gender, phone_number,birthDate,address){
    const profile = new Profile ({
        gender,
        phone_number,
        birthDate,
        address
    });

    return profile.save();
};

// Find a single Profile with a profileId
exports.findOne = (req, res) => {
    Profile.findById(req.params.profileId)
        .then(profile => {
            if(!profile) {
                return res.status(404).send({
                    message: "Profile not found with id " + req.params.profileId
                });
            }
            res.send(profile.transform());
        }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Profile not found with id " + req.params.profileId
            });
        }
        return res.status(500).send({
            message: "Error retrieving profile with id " + req.params.profileId
        });
    });
};

// Update a Profile identified by the profileId in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Profile content can not be empty"
        });
    }

    // Find profile and update it with the request body
    Profile.findByIdAndUpdate(req.params.profileId, {
        gender : req.body.gender,
        phone_number : req.body.phone_number,
        birthDate : req.body.birthDate,
        address: req.body.address,
    }, {new: true})
        .then(profile => {
            if(!profile) {
                return res.status(404).send({
                    message: "Profile not found with id " + req.params.profileId
                });
            }
            res.send(profile.transform());
        }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Profile not found with id " + req.params.profileId
            });
        }
        return res.status(500).send({
            message: "Error updating profile with id " + req.params.profileId
        });
    });
};