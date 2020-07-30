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
            res.send(address);
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
