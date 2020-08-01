const mongoose = require('mongoose');
const addressSchema = mongoose.Schema({
    city : String,
    postal_code : Number,
    street : String,
    country :  String,
});

// transform the predefined _id attribue to id in response
addressSchema.method('transform', function() {
    var obj = this.toObject();
 
    // Rename field
    obj.id = obj._id;
    delete obj._id;
    
    return obj;
 });

const Address = mongoose.model('Address', addressSchema);
module.exports ={Address, addressSchema};


