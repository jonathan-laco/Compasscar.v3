import Joi from 'joi';

export const createOrderSchema = Joi.object({
  carId: Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'ID de carro inválido',
    'any.required': 'Carro é obrigatório',
  }),
  clientId: Joi.string().guid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'ID de cliente inválido',
    'any.required': 'Cliente é obrigatório',
  }),
  zipcode: Joi.string().allow(null),
  city: Joi.string().allow(null),
  state: Joi.string().allow(null),
});

export const updateOrderSchema = Joi.object({
  startDate: Joi.date().greater('now').allow(null),
  endDate: Joi.date().greater(Joi.ref('startDate')).allow(null),
  zipcode: Joi.string().length(8).optional(),
  city: Joi.string().optional(),
  state: Joi.string().valid('AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE').optional(),
  status: Joi.string().valid('APROVED', 'CANCELED').optional(),
});
