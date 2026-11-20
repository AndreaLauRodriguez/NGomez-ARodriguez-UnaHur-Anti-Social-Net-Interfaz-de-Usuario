const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const createPostSchema = Joi.object({
  description: Joi.string().trim().min(1).required().messages({
    "string.empty": "La descripción es obligatoria.",
    "any.required": "La descripción es obligatoria.",
  }),
  userId: objectId.required().messages({
    "string.base": "El userId debe ser un identificador válido.",
    "string.hex": "El userId debe ser un identificador válido.",
    "string.length": "El userId debe tener 24 caracteres.",
    "any.required": "El userId es obligatorio.",
  }),
  images: Joi.array().items(Joi.string().trim().uri()).optional(),
  tags: Joi.array().items(Joi.string().trim().min(1).required()).optional(),
}).required();

const createCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).required().messages({
    "string.empty": "El contenido del comentario no puede estar vacío.",
    "any.required": "El contenido del comentario es obligatorio.",
  }),
  userId: objectId.required().messages({
    "string.base": "El userId debe ser un identificador válido.",
    "string.hex": "El userId debe ser un identificador válido.",
    "string.length": "El userId debe tener 24 caracteres.",
    "any.required": "El userId es obligatorio.",
  }),
  date: Joi.date().optional(),
}).required();

const updateCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).required().messages({
    "string.empty": "El contenido del comentario no puede estar vacío.",
    "any.required": "El contenido del comentario es obligatorio.",
  }),
}).required();

module.exports = {
  createPostSchema,
  createCommentSchema,
  updateCommentSchema,
};
