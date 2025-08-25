const Joi = require("joi");

// ================= Listing Validation =================
module.exports.listingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  country: Joi.string().required(),
  price: Joi.number().required().min(0),
  image: Joi.string().allow("", null) // optional, can be empty
});

// ================= Review Validation =================
module.exports.reviewsSchema = Joi.object({
  rating: Joi.number().required().min(1).max(5),
  comment: Joi.string().required()
});
