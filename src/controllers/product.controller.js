import { request, response } from "express";
import Producto from "../models/Product.js";

//obtener la lista de productos
const obtenerProductos = async (req, res) => {
  const { limite = 5, desde = 0 } = req.query;

  const [total, productos] = await Promise.all([
    Producto.countDocuments({ estado: true }),
    Producto.find({ estado: true })
      .limit(limite)
      .skip(desde)
      .populate("usuario", "username email role")
      .populate("categoria", "nombre"),
  ]);

  res.json({
    total,
    productos,
  });
};

//crear un producto
const crearProducto = async (req, res) => {
  try {
    const { precio, categoria, descripcion, img } = req.body;
    const nombre = req.body.nombre.toUpperCase();

    //validar si ya existe un producto con ese nombre
    const productoDB = await Producto.findOne({ nombre });

    if (productoDB) {
      return res.status(400).json({
        message: `El producto con el nombre ${productoDB.nombre} ya existe`,
      });
    }

    const data = {
      nombre,
      categoria,
      precio,
      descripcion,
      img,
      usuario: req.user._id,
    };

    const producto = new Producto(data);

    await producto.save();

    res.status(201).json({
      ok: true,
      message: `El producto ${data.nombre} se guardó con éxito!!`,
    });
  } catch (error) {
    res.status(500).json({
      erro: error.message,
    });
  }
};
//actualizar un producto
const actualizarProducto = async (req = request, res = response) => {
  const { id } = req.params;

  const { precio, categoria, descripcion, disponible } = req.body;
  const usuario = req.user._id;

  let data = {
    precio,
    categoria,
    descripcion,
    disponible,
    usuario,
  };
  if (req.body.nombre) {
    data.nombre = req.body.nombre.toUpperCase();
  }

  await Producto.findByIdAndUpdate(id, data);

  res.status(200).json({
    ok: true,
    message: "Producto actualizado!",
  });
};

//Borrar un producto
const borrarProducto = async (req, res) => {
  const { id } = req.params;

  // const productoPorId = await Producto.findById(id);

  // if (!productoPorId) {
  //   return res.status(400).json({
  //     ok: false,
  //     message: "No existe el producto",
  //   });
  // }

  await Producto.findByIdAndUpdate(id, { estado: false });

  res.status(200).json({
    ok: true,
    message: "Producto eliminado",
  });
};

export { crearProducto, obtenerProductos, actualizarProducto, borrarProducto };
