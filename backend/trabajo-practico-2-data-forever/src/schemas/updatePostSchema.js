const Joi = require("joi");

const updatePostSchema = Joi.object({
  description: Joi.string().trim().min(1).required().messages({
    "string.empty": "La descripción no puede estar vacía.",
    "any.required": "La descripción es obligatoria.",
  }),
}).required();

module.exports = updatePostSchema;
