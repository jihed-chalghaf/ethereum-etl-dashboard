const Address = require('../models/address.model.js');
const Profile = require('../models/profile.model.js').Profile;
const multer = require('multer');
const { func } = require('@hapi/joi');
const upload = multer({dest: 'img/'});


// Create a profile
exports.create =  function (gender, phoneNumber,birthDate,address){
    const profile = new Profile ({
        gender,
        phoneNumber,
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

// Update a Profile
exports.update = async(profile) => {
     //   upload.single('userImage'),
    console.log("Inside Profile update fct");
    var profl = new Profile();
    console.log("PROFL## => ", profl);
    // Find profile and update it with the request body
    await Profile.findByIdAndUpdate(
        { _id: profile.id },
        {
            gender: profile.gender,
            phoneNumber: profile.phoneNumber,
            birthDate: profile.birthDate,
            address: profile.address,
        },
        { new: true }
        ).then(new_profile => {
            console.log("NEW PROFILE Transformed => ", new_profile.transform());
            profl = new_profile;
            console.log("PROFL FINAL## => ", profl);
        })
        .catch(err => {
            if(err.kind === 'ObjectId') {
                console.log("No profile found with id: ", profile.id);
            }
        });
    return profl;
};

// Delete a Profile
exports.delete = function(profileId) {
    // delete user finally
    Profile.findByIdAndRemove(profileId)
        .then(profile => {
            if (!profile) {
                console.log("Profile not found with id ", profileId);
            }
            console.log("Profile deleted successfully!");
        }).catch(err => {
        if (err.kind === 'ObjectId' || err.name === 'NotFound') {
           console.log("Profile not found with id ", profileId)
        }
        console.log("Could not delete profile with id ", profileId);
    });
};

/*
exports.updateProfile = (req, res) => {
    upload.single('userImage'),

    // Find note and update it with the request body
    Profile.findByIdAndUpdate(req.params.profileId, {
        gender: req.body.gender,
        phoneNumber: req.body.phoneNumber,
        birthDate: req.body.birthDate,
        address: req.body.address,
    }, {new: true})
        .then(profile => {
            console.log('SUCCESS')
            if(!profile) {
                return res.status(404).send({
                    message: "Note not found with id " + req.params.profileId
                });
            }
            res.send(Profile);
        }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.profileId
            });
        }
        return res.status(500).send({
            message: "Error updating note with id " + req.params.profileId
        });
    });
};

 */