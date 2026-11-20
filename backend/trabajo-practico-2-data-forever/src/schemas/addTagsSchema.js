const Joi = require("joi");

const addTagsSchema = Joi.object({
  tags: Joi.array()
    .items(Joi.string().trim().min(1).required())
    .min(1)
    .required(),
}).required();

module.exports = addTagsSchema;
