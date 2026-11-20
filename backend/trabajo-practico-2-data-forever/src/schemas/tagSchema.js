const Joi = require("joi");

const tagSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    "string.empty": "El nombre de la etiqueta no puede estar vacío.",
    "any.required": "El nombre de la etiqueta es obligatorio.",
  }),
}).required();

module.exports = tagSchema;
