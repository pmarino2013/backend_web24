import { Router } from "express";
import { check } from "express-validator";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  traerCategorias,
} from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.js";
import {
  handleValidationErrors,
  validarRolAdmin,
} from "../middlewares/validators.js";

const router = Router();

router.get("/", traerCategorias);
router.post(
  "/",

  [
    authenticate,
    //validación del admin
    validarRolAdmin,
    check("nombre", "El nombre es obligatorio").notEmpty(),
    handleValidationErrors,
  ],
  crearCategoria,
);
router.put(
  "/:id",
  [
    authenticate,
    validarRolAdmin,
    check("id", "El id es requerido y debe ser válido").isMongoId(),
    // check("id").custom(existeCategoriaPorId),
    check("nombre", "El nombre no puede estar vacio").notEmpty(),
    handleValidationErrors,
  ],
  actualizarCategoria,
);
router.delete(
  "/:id",
  [
    authenticate,
    validarRolAdmin,
    check("id", "El id es requerido y debe ser válido").isMongoId(),
    // check("id").custom(existeCategoriaPorId),
    handleValidationErrors,
  ],
  eliminarCategoria,
);

export default router;
