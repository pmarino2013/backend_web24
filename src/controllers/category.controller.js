import Categoria from "../models/category.js";

const traerCategorias = async (req, res) => {
  const categorias = await Categoria.find({ estado: true }).populate(
    "usuario",
    "username email role",
  );
  const total = await Categoria.countDocuments({ estado: true });

  res.json({
    total,
    categorias,
  });
};

const crearCategoria = async (req, res) => {
  const nombre = req.body.nombre.toUpperCase();

  const validarNombre = await Categoria.findOne({ nombre });

  if (validarNombre) {
    return res.status(400).json({
      ok: false,
      message: `La categoría ${nombre} ya existe`,
    });
  }

  const usuario = req.user._id;

  const categoria = new Categoria({ nombre, usuario });

  categoria.save();

  res.status(201).json({
    message: "Categoría guardada",
    categoria,
  });
};

const actualizarCategoria = async (req, res) => {
  const { id } = req.params;

  // const { nombre } = req.body;
  const nombre = req.body.nombre.toUpperCase();

  //validar nombre
  const validarNombre = await Categoria.findOne({ nombre });
  if (validarNombre) {
    return res.status(400).json({
      ok: false,
      message: "Ya existe una categoría con ese nombre",
    });
  }

  //validar que el id exista en la BD (pasarlo a un middleware a futuro)
  const existeCategoria = await Categoria.findById(id);

  if (!existeCategoria) {
    return res.status(400).json({
      ok: false,
      message: `El id ${id} No existe`,
    });
  }
  if (!existeCategoria.estado) {
    return res.status(400).json({
      ok: false,
      message: `La categoria ${existeCategoria.nombre} no está activa`,
    });
  }
  //----------------------------------------------

  const datos = {
    nombre,
    usuario: req.user._id,
  };

  const categoria = await Categoria.findByIdAndUpdate(id, datos, {
    returnDocument: "after",
  });

  res.status(200).json({
    message: "Categoría actualizada",
    categoria,
  });
};

//borrar categoría------------------------------------
const eliminarCategoria = async (req, res) => {
  const { id } = req.params;

  //validar que el id exista en la BD (pasarlo a un middleware a futuro)
  const existeCategoria = await Categoria.findById(id);

  if (!existeCategoria) {
    return res.status(400).json({
      ok: false,
      message: `El id ${id} No existe`,
    });
  }
  if (!existeCategoria.estado) {
    return res.status(400).json({
      ok: false,
      message: `La categoria ${existeCategoria.nombre} no está activa`,
    });
  }
  //----------------------------------------------

  const categoriaBorrada = await Categoria.findByIdAndUpdate(
    id,
    { estado: false },
    { returnDocument: "after" },
  );

  res.status(200).json({
    message: "Categoria eliminada",
    categoriaBorrada,
  });
};

export {
  traerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};
