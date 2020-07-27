const mongoose = require('mongoose');
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
 address:{
     city :{
         type: String,
         required: true
     },
     postal_code : {
         type: Number,
         required: true
     },
     street : {
         type: String,
         required: true
     },
     country : {
         type: String,
         required: true
     },
     state : {
         type: String,
         required: true
     }
 },
 role : String,
 age : String,
 gender : String
}, {
    timestamps: true
});
module.exports = mongoose.model('User', userSchema);
