const mongoose = require('mongoose');
const subscriptionSchema = mongoose.Schema({
    blockchain_url : {
        type: String,
        required: false
    },
    contract_address : {
        type: String,
        required: false
    },
    event_topic : {
        type: String,
        required: false
    }
});

// transform the predefined _id attribue to id in response
subscriptionSchema.method('transform', function() {
    var obj = this.toObject();
 
    // Rename field
    obj.id = obj._id;
    delete obj._id;
    
    return obj;
 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports ={Subscription, subscriptionSchema};