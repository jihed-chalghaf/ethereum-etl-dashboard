const mongoose = require('mongoose');
const addressSchema = require('../models/address.model.js').addressSchema;

const profileSchema = mongoose.Schema({
    gender : String,
    phoneNumber : Number,
    birthDate : String,
    address: addressSchema,
    userImage: String
});

// transform the predefined _id attribue to id in response
profileSchema.method('transform', function() {
    var obj = this.toObject();
 
    // Rename field
    obj.id = obj._id;
    delete obj._id;
    
    return obj;
 });

const Profile = mongoose.model('Profile', profileSchema);
module.exports = {Profile, profileSchema};
