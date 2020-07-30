const Joi = require('@hapi/joi');

// Register validation
const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(6).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
        address: Joi.object(),
        profile: Joi.object()
    });
    return schema.validate(data);
}

const loginValidation = (data) => {
     const schema = Joi.object ({
            email: Joi.string() .min(6) .required() .email(),
            password: Joi.string() .min(6) .required()

      });

    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;