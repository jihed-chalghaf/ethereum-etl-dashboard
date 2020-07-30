const mongoose = require('mongoose');
const addressSchema = mongoose.Schema({

        city : String,
        postal_code : Number,
        street : String,
        country :  String,
    },
   );
const Address = mongoose.model('Address', addressSchema);
module.exports ={Address, addressSchema};


