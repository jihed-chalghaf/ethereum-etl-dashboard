const mongoose = require('mongoose');
const addressSchema = require('../models/address.model.js').addressSchema;

const profileSchema = mongoose.Schema({

        gender : String,
        phone_number : Number,
        birthDate : String,
        address: addressSchema,
        userImage: String

    },
   );
const Profile = mongoose.model('Profile', profileSchema);
module.exports = {Profile, profileSchema};
