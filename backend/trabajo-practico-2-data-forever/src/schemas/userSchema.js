const Joi = require("joi");

const createUserSchema = Joi.object({
  nickName: Joi.string().trim().min(1).required().messages({
    "string.empty": "El nickName es obligatorio.",
    "any.required": "El nickName es obligatorio.",
  }),
}).required();

const updateUserSchema = Joi.object({
  nickName: Joi.string().trim().min(1).required().messages({
    "string.empty": "El nickName es obligatorio.",
    "any.required": "El nickName es obligatorio.",
  }),
}).required();

const followUserSchema = Joi.object({
  followerId: Joi.string().hex().length(24).required().messages({
    "string.base": "El followerId debe ser un identificador válido.",
    "string.hex": "El followerId debe ser un identificador válido.",
    "string.length": "El followerId debe tener 24 caracteres.",
    "any.required": "El followerId es obligatorio.",
  }),
}).required();

module.exports = { createUserSchema, updateUserSchema, followUserSchema };
