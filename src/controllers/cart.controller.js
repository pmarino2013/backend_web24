import Cart from "../models/Cart.js";
import Producto from "../models/Product.js";

//Obtener Carrito del usuario
const traerItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ usuario: req.user._id }).populate(
      "items.producto",
    );
    res.status(200).json(cart || { items: [], total: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Agregar item al carrito
const agregarItem = async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;

    const producto = await Producto.findById(productoId);

    let cart = await Cart.findOne({ usuario: req.user._id });

    //si carrito no existe lo creo
    if (!cart) {
      cart = new Cart({ usuario: req.user._id, items: [] });
    }

    //si el carrito existe buscamos el id del producto en los items
    const itemExiste = cart.items.find(
      (item) => item.producto.toString() === productoId,
    );

    //si encontramos el item en el carrito
    if (itemExiste) {
      itemExiste.cantidad += cantidad;
    } else {
      console.log(cart.items);
      cart.items.push({
        producto: productoId,
        cantidad,
        precioUnitario: producto.precio,
      });
    }

    cart.calcularTotal();
    await cart.save();

    // const cartPopulate = await cart.populate("items.producto");

    res.json({
      ok: true,
      message: "Producto agregado al carrito",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Eliminar item del carrito
const borrarItem = async (req, res) => {
  try {
    const { productoId } = req.params;

    const cart = await Cart.findOne({ usuario: req.user._id });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.items = cart.items.filter(
      (item) => item.producto.toString() !== productoId,
    );

    cart.calcularTotal();
    await cart.save();

    const cartPopulate = await cart.populate("items.producto");

    res.json(cartPopulate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//actualizar cantidad
const actualizarCantidad = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({
        error: "La cantidad debe ser mayor a 0",
      });
    }

    const cart = await Cart.findOne({ usuario: req.user._id });

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const item = cart.items.find(
      (item) => item.producto.toString() === productoId,
    );

    if (!item) {
      return res
        .status(404)
        .json({ error: "Item no encontrado en el carrito" });
    }

    item.cantidad = cantidad;
    cart.calcularTotal();
    await cart.save();

    const cartPopulate = await cart.populate("items.producto");

    res.status(200).json(cartPopulate);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

//Vaciar el carrito
const borrarCarrito = async (req, res) => {
  try {
    const cart = await Cart.findOne({ usuario: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(200).json({
      ok: true,
      message: "Carrito vacio",
      cart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  agregarItem,
  traerItems,
  borrarItem,
  actualizarCantidad,
  borrarCarrito,
};
