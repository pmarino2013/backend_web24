// 1 - importar a jwt
import jwt from "jsonwebtoken";

// 2- Una función que me ayude a generar el token
export const generateToken = (userId) => {
  //la función me retorne un token
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "1h",
  });
};

// 3 - Una función que me sirva para verificar un token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Token inválido o expirado");
  }
};
