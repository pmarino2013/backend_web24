import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import {
  actualizarProducto,
  crearProducto,
  obtenerProductos,
  borrarProducto,
} from "../controllers/product.controller.js";
import {
  handleValidationErrors,
  validarIdProducto,
  validarRolAdmin,
} from "../middlewares/validators.js";

const router = Router();

router.get("/", obtenerProductos);

router.post(
  "/",
  [
    authenticate,
    validarRolAdmin,
    check("nombre", "El nombre es obligatorio").notEmpty(),
    check("categoria")
      .notEmpty()
      .withMessage("La categoría es obligatoria")
      .isMongoId()
      .withMessage("No es un id de mongo válido"),

    handleValidationErrors,
  ],
  crearProducto,
);

router.put(
  "/:id",
  [
    authenticate,
    validarRolAdmin,
    check("id", "No es un id válido").isMongoId(),
    // check("id").custom(validarIdProducto),
    handleValidationErrors,
  ],
  actualizarProducto,
);
router.delete(
  "/:id",
  [
    authenticate,
    validarRolAdmin,
    check("id", "No es un id válido").isMongoId(),
    check("id").custom(validarIdProducto),
    handleValidationErrors,
  ],
  borrarProducto,
);
export default router;
