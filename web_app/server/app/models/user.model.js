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

// transform the predefined _id attribue to id in response
userSchema.method('transform', function() {
   var obj = this.toObject();

   // Rename fields - basically assign new attributes with the same value and remove old attributes
   // 1 - userID
   obj.id = obj._id;
   delete obj._id;
   // 2 - profileID
   obj.profile.id = obj.profile._id;
   delete obj.profile._id;
   // 3 - AddressID
   obj.profile.address.id = obj.profile.address._id;
   delete obj.profile.address._id;
   
   return obj;
});

const User = mongoose.model('User', userSchema);
module.exports= {User, userSchema};
