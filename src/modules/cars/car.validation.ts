import Joi from 'joi';

export const carSchema = Joi.object({
  plate: Joi.string().required().messages({
    'string.empty': 'A placa não pode estar vazia.',
    'any.required': 'A placa é obrigatória.',
  }),
  brand: Joi.string().required().messages({
    'string.empty': 'A marca não pode estar vazia.',
    'any.required': 'A marca é obrigatória.',
  }),
  model: Joi.string().required().messages({
    'string.empty': 'O modelo não pode estar vazio.',
    'any.required': 'O modelo é obrigatório.',
  }),
  km: Joi.number().integer().required().messages({
    'number.base': 'KM deve ser um número.',
    'any.required': 'KM é obrigatório.',
  }),
  year: Joi.number().integer().min(new Date().getFullYear() - 11).required().messages({
    'number.base': 'Ano deve ser um número.',
    'number.min': 'O ano não pode ser superior a 11 anos.',
    'any.required': 'Ano é obrigatório.',
  }),
  Items: Joi.array().items(Joi.string()).max(5).unique().required().messages({
    'array.max': 'Items não pode conter mais que 5 itens.',
    'array.unique': 'Items não pode ter itens duplicados.',
    'any.required': 'Items é obrigatório.',
  }),
  price: Joi.number().required().messages({
    'number.base': 'Preço deve ser um número.',
    'any.required': 'Preço é obrigatório.',
  }),
  status: Joi.string().valid('ACTIVED', 'INACTIVED', 'DELETED').required().messages({
    'any.only': 'Status deve ser ACTIVED, INACTIVED ou DELETED.',
    'any.required': 'Status é obrigatório.',
  }),
});
