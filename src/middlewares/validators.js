import { validationResult, check } from "express-validator";
import User from "../models/user.js";

//armar una función que maneje el resultado de las validaciones
export const handleValidationErrors = (req, res, next) => {
  // Voy a preguntarme si NO hay errores

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Si hay errores los mando en la respuesta al cliente
    return res.status(400).json({
      ok: false,
      errors: errors.mapped(),
    });
  }
  // Si no hay errores entonces indico que el flujo continue al controlador
  next();
};

//Validar Registro
export const registerValidation = () => [
  check("username")
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario no puede ser vacío")
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      console.log(user);
      if (user) {
        throw new Error("El usuario ya existe");
      }
    }),
  check("email")
    .trim()
    .isEmail()
    .withMessage("Proveer un email válido")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("El email ya se encuentra registrado");
      }
    })
    .normalizeEmail(),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("La contraseña debe tener mayúsculas, minúsculas y números"),
  handleValidationErrors,
];

//Validar Login
export const loginValidation = () => [
  check("email")
    .trim()
    .isEmail()
    .withMessage("Por favor, provea un email válido")
    .normalizeEmail(),
  check("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener mínimo 6 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("La contraseña debe tener mayúsculas, minúsculas y números"),
  handleValidationErrors,
];

export const verifyEmailValidation = () => [
  check("code")
    .notEmpty()
    .withMessage("El código de verificación es necesario")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("El código debe tener 6 dígitos")
    .isNumeric()
    .withMessage("El código debe ser un número"),
  check("email")
    .notEmpty()
    .withMessage("El correo es requerido")
    .trim()
    .isEmail()
    .withMessage("Ingrese un mail válido")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user.emailVerified) {
        throw new Error("El usuario ya está verificado");
      }
    })
    .normalizeEmail(),

  handleValidationErrors,
];
