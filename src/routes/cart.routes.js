import { Router } from "express";
import { check } from "express-validator";
import { authenticate } from "../middlewares/auth.js";
import {
  handleValidationErrors,
  validarIdProducto,
} from "../middlewares/validators.js";
import {
  actualizarCantidad,
  agregarItem,
  borrarCarrito,
  borrarItem,
  traerItems,
} from "../controllers/cart.controller.js";

const router = Router();

router.get("/", authenticate, traerItems);
router.post(
  "/",
  [
    authenticate,
    check("productoId").custom(validarIdProducto),
    check("cantidad", "La cantidad no puede estar vacia").notEmpty(),
    check("cantidad", "La cantidad debe ser mayor que 0").isInt({ min: 1 }),
    handleValidationErrors,
  ],
  agregarItem,
);
router.put(
  "/:productoId",
  [
    authenticate,
    // check("poductoId", "Debe enviar el id").notEmpty(),
    check("productoId", "Deber ser un id válido").isMongoId(),
    handleValidationErrors,
  ],
  actualizarCantidad,
);
router.delete("/:productoId", authenticate, borrarItem);
router.delete("/", authenticate, borrarCarrito);

export default router;
