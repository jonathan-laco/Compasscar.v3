import { body } from "express-validator";

export const createUserValidator = [
  body("fullName").notEmpty().withMessage("Nome completo é obrigatório"),
  body("fullName").isString().withMessage("Nome deve ser uma string."),
  body("email").isEmail().withMessage("E-mail inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("A senha deve ter no mínimo 6 caracteres"),
];
