import { Schema, model } from "mongoose";

//los items del carrito
//id del producto
//cantidad
//precio unitario

const CartItemSchema = new Schema({
  producto: {
    type: Schema.Types.ObjectId,
    ref: "Producto",
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1,
  },
  precioUnitario: {
    type: Number,
    required: true,
  },
});

//el carrito
//id del usuario
//items
//total
//fecha de creación

const CartSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
    total: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

CartSchema.methods.calcularTotal = function () {
  this.total = this.items.reduce(
    (suma, item) => suma + item.precioUnitario * item.cantidad,
    0,
  );

  return this.total;
};

export default model("Cart", CartSchema);
