const mongoose = require('mongoose');
const profileSchema = require('../models/profile.model.js').profileSchema;

const userSchema = mongoose.Schema({

 username :{
    type: String,
    required: true
   },
 password : {
    type: String,
    required: true
   },
 firstName : {
    type: String,
    required: true
   },
 lastName : {
    type: String,
    required: true
   },
 email : {
    type: String,
    required: true
   },

    role : String,
    profile:profileSchema
 },

 {
    timestamps: true
});
const User = mongoose.model('User', userSchema);
module.exports= {User, userSchema};
