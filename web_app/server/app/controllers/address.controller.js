const Address = require('../models/address.model.js').Address;



//Create an address
exports.create =  function (city, postal_code,street,country){
    const address = new Address ({
        city,
        postal_code,
        street,
        country
    });

    return address.save();
};

// Find a single Address with an addressId
exports.findOne = (req, res) => {
    Address.findById(req.params.addressId)
        .then(address => {
            if(!address) {
                return res.status(404).send({
                    message: "Address not found with id " + req.params.addressId
                });
            }
            res.send(address.transform());
        }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Address not found with id " + req.params.addressId
            });
        }
        return res.status(500).send({
            message: "Error retrieving address with id " + req.params.addressId
        });
    });
};

// Update an address
exports.update = async(address) => {
    console.log("Inside Address update fct");
    var adr = new Address();
    console.log("ADR## => ", adr);
    // Find address and update it with the request body
    await Address.findByIdAndUpdate(
        { _id: address.id },
        { 
            street: address.street,
            postal_code: address.postal_code,
            city: address.city,
            country: address.country
        }, 
        { new: true }
        ).then(new_address => {
            if(!new_address) {
                console.log("No address found with id: ", address.id);
                return false;
            }
            console.log("NEW ADDRESS Transformed => ", new_address.transform());
            adr = new_address;
            console.log("ADR FINAL## => ", adr);
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                console.log("No address found with id: ", address.id);
                return false;
            }
        });
    return adr;
};

// Delete an address
exports.delete = function(addressId) {
    // delete user finally
    Address.findByIdAndRemove(addressId)
        .then(address => {
            if (!address) {
                console.log( "address not found with id ", addressId);
            }
            console.log("address deleted successfully!");
        }).catch(err => {
        if (err.kind === 'ObjectId' || err.name === 'NotFound') {
            console.log("address not found with id ", addressId);
        }
        console.log("Could not delete address with id ", addressId);
    });
};