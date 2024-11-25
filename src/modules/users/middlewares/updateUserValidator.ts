import { checkSchema } from "express-validator";

const updateUserValidator = checkSchema({
  fullName: {
    optional: true,
    notEmpty: {
      errorMessage: "O nome não pode ser vazio.",
    },
    isString: {
      errorMessage: "O nome deve ser uma string.",
    },
  },
  email: {
    optional: true,
    isEmail: {
      errorMessage: "O email deve ser válido.",
    },
  },
  password: {
    optional: true,
    isLength: {
      options: { min: 6 },
      errorMessage: "A senha deve ter pelo menos 6 caracteres.",
    },
  },
});

export default updateUserValidator;
