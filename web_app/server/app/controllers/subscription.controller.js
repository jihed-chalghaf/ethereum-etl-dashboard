const { Collection } = require('mongoose');

const Subscription = require('../models/subscription.model.js').Subscription;

var eventsCollection = Collection;
var usersCollection = Collection;

// Create a subscription
exports.create =  function (blockchain_url, contract_address, event_topic){
    const subscription = new Subscription ({
        blockchain_url,
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
    // Find Subscription and update it with the request body
    await Subscription.findByIdAndUpdate(
        { _id: subscription.id },
        {
            'blockchain_url': subscription.blockchain_url,
            'contract_address': subscription.contract_address,
            'event_topic': subscription.event_topic
        },
        { new: true }
        ).then(new_subscription => {
            sub = new_subscription;
            console.log("[i] Updated Subscription => ", sub);
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

exports.setEventsCollection = function(collection) {
    eventsCollection = collection;
};

exports.setUsersCollection = function(collection) {
    usersCollection = collection;
};

exports.eventsEmittedPerBlock = async(subscription) => {
    var pipeline = [
        {
            $match: {'url': subscription.blockchain_url, 'address': subscription.contract_address}
        },
        {
            $group: { _id: '$blockNumber', events_count: { $sum: 1 } }
        },
        {
            $project: { blockNumber: '$_id', events_count: 1, _id: 0 }
        },
        { 
            $sort: { blockNumber: 1 } 
        }
    ];
    // toArray() returns the documents in an array instead of returning the cursor
    return eventsCollection.aggregate(pipeline).toArray();
};

exports.eventTypesEmittedPerBlock = async(subscription) => {
    var pipeline = [
        {
            $match: {'url': subscription.blockchain_url, 'address': subscription.contract_address}
        },
        {
            $group: { _id: {blockNumber: '$blockNumber', event_id: '$id'} }
        },
        {
            $project: { blockNumber: '$_id.blockNumber', events_id: '$_id.event_id', _id: 0 }
        },
        {
            $group: { _id: '$blockNumber', events_count: { $sum: 1 } }
        },
        {
            $project: { blockNumber: '$_id', events_count: 1, _id: 0 }
        },
        { 
            $sort: { blockNumber: 1 } 
        }
    ];
    // toArray() returns the documents in an array instead of returning the cursor
    return eventsCollection.aggregate(pipeline).toArray();
};

exports.transactionsEmittedPerBlock = async(subscription) => {
    var pipeline = [
        {
            $match: {'url': subscription.blockchain_url, 'address': subscription.contract_address}
        },
        {
            $group: { _id: {blockNumber: '$blockNumber', transactionHash: '$transactionHash'} }
        },
        {
            $project: { blockNumber: '$_id.blockNumber', transactionHash: '$_id.transactionHash', _id: 0 }
        },
        {
            $group: { _id: '$blockNumber', transactions_count: { $sum: 1 } }
        },
        {
            $project: { blockNumber: '$_id', transactions_count: 1, _id: 0 }
        },
        { 
            $sort: { blockNumber: 1 } 
        }
    ];
    // toArray() returns the documents in an array instead of returning the cursor
    return eventsCollection.aggregate(pipeline).toArray();
};

exports.eventTopicsEmitted = async(subscription) => {
    var pipeline = [
        {
            $match: {'url': subscription.blockchain_url, 'address': subscription.contract_address}
        },
        { // event topics count per contract address, not per blockNumber
            $group: { _id: { address: '$address', topic: '$topics' } }
        },
        {
            $project: { address: '$_id.address', topic: '$_id.topic', _id: 0 }
        },
        {
            $group: { _id: '$address', topics_count: { $sum: 1 } }
        },
        {
            $project: { contract_address: '$_id', topics_count: 1, _id: 0 }
        }
    ];
    // toArray() returns the documents in an array instead of returning the cursor
    return eventsCollection.aggregate(pipeline).toArray();
};

exports.subscribedUsersCount = async(subscription) => {
    var pipeline = [
        {
            $match: {'subscription.blockchain_url': subscription.blockchain_url, 'subscription.contract_address': subscription.contract_address}
        },
        {
            $group: { _id: { address: '$subscription.contract_address', url: '$subscription.blockchain_url' }, subscribers_count: { $sum: 1 } }
        },
        {
            $project: { contract_address: '$_id.address', blockchain_url: '$_id.url', subscribers_count: 1, _id: 0 }
        }
    ];
    // toArray() returns the documents in an array instead of returning the cursor
    return usersCollection.aggregate(pipeline).toArray();
};

// function that returns some metrics in a json object
exports.getMetrics = async(subscription) => {
    var metrics = {
        eventsEmittedPerBlock: await this.eventsEmittedPerBlock(subscription),
        eventTypesEmittedPerBlock: await this.eventTypesEmittedPerBlock(subscription),
        transactionsEmittedPerBlock: await this.transactionsEmittedPerBlock(subscription),
        eventTopicsEmitted: await this.eventTopicsEmitted(subscription),
        subscribedUsersCount: await this.subscribedUsersCount(subscription)
    };
    return JSON.stringify(metrics);
};