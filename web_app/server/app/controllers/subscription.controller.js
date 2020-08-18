const Subscription = require('../models/subscription.model.js').Subscription;


// Create a subscription
exports.create =  function (contract_address, event_topic){
    const subscription = new Subscription ({
        contract_address,
        event_topic
    });

    return subscription.save();
};

// Find a single Subscription with a subscriptionId
exports.findOne = (req, res) => {
    Subscription.findById(req.params.subscriptionId)
        .then(subscription => {
            if(!subscription) {
                return res.status(404).send({
                    message: "Subscription not found with id " + req.params.subscriptionId
                });
            }
            res.send(subscription.transform());
        }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Subscription not found with id " + req.params.subscriptionId
            });
        }
        return res.status(500).send({
            message: "Error retrieving subscription with id " + req.params.subscriptionId
        });
    });
};

// Update a Subscription
exports.update = async(subscription) => {
    console.log("Inside Subscription update fct");
    var sub = new Subscription();
    console.log("SUB## => ", sub);
    // Find Subscription and update it with the request body
    await Subscription.findByIdAndUpdate(
        { _id: subscription.id },
        {
            'contract_address': subscription.contract_address,
            'event_topic': subscription.event_topic
        },
        { new: true }
        ).then(new_subscription => {
            console.log("NEW SUBSCRIPTION Transformed => ", new_subscription.transform());
            sub = new_subscription;
            console.log("SUB FINAL## => ", sub);
        })
        .catch(err => {
            if(err.kind === 'ObjectId') {
                console.log("No Subscription found with id: ", subscription.id);
            }
        });
    return sub;
};

// Delete a Subscription
exports.delete = function(subscriptionId) {
    // delete user finally
    Subscription.findByIdAndRemove(subscriptionId)
        .then(subscription => {
            if (!subscription) {
                console.log("Subscription not found with id ", subscriptionId);
            }
            console.log("Subscription deleted successfully!");
        }).catch(err => {
        if (err.kind === 'ObjectId' || err.name === 'NotFound') {
           console.log("Subscription not found with id ", subscriptionId)
        }
        console.log("Could not delete Subscription with id ", subscriptionId);
    });
};