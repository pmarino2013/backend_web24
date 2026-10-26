import {
  sendVerificationEmail,
  sendUpdatePassword,
} from "../config/nodemailer.js";
import { generateToken } from "../utils/jwt.js";
import User from "../models/User.js";

const getAuth = async (req, res) => {
  const users = await User.find();
  const total = await User.countDocuments();

  return res.status(200).json({
    total,
    users,
  });
};

// El controlador para el registro----------------------------------------
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //crear el usuario
    const user = new User({
      username,
      email,
      password,
    });

    // Generar el codigo de verificación
    const verificationCode = user.generateVerificationCode();

    // Guardar el usuario
    await user.save(); // aca se está guardando el usuario en mongo

    // enviamos el email de verificacion
    try {
      await sendVerificationEmail(email, username, verificationCode);
    } catch (error) {
      console.error("Error al enviar el email", error);
    }
    //envio la respuesta al cliente
    return res.status(201).json({
      ok: true,
      message: "Usuario creado correctamente",
      data: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

// EL controlador para el Login

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales incorrectas",
      });
    }

    // chequear que la password coincida
    const isPasswordValid = user.comparePassword(password);
    // const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(403).json({
        ok: false,
        message: "Credenciales incorrectas",
      });
    }

    //Chequear si tiene código verificado (por mi)
    if (!user.emailVerified) {
      return res.status(403).json({
        ok: false,
        message: "El email no está verificado",
      });
    }

    //generar el token------------------------------------------
    /*
Un JWT (JSON Web Token) es un estándar abierto (RFC 7519) que permite transmitir información de forma segura y compacta entre dos partes mediante un objeto JSON.

Estructura de un JWT
Un token se compone de tres partes separadas por puntos (.):
1. Encabezado (Header): Contiene el tipo de token (JWT) y el algoritmo de cifrado utilizado (como HS256).
2. Carga útil (Payload): Almacena las declaraciones o claims (información del usuario, roles y fecha de expiración). No está cifrada, solo codificada en Base64, por lo que no debes guardar datos sensibles como contraseñas.
3. Firma (Signature): Combina el encabezado, el payload y una clave secreta del servidor para verificar que el contenido no haya sido alterado.
*/
    /*
Ventajas de usar Cookies para Tokens
• Protección contra XSS: Al marcar la cookie como HttpOnly, el código en el lado del cliente (navegador) no puede leerla ni modificarla.
• Envío automático: El navegador adjunta la cookie en cada solicitud HTTP subsiguiente sin que debas manipular encabezados manualmente en JavaScript.
• Control de sesión: Permite definir tiempos de vida precisos y políticas estrictas de origen cruzado.

    */
    const token = generateToken(user._id);

    //setear la cookie
    /*

  httpOnly: true: impide que JavaScript del navegador lea la cookie. Ayuda a reducir el riesgo de robo mediante ataques XSS.
secure: process.env.NODE_ENV === "production": la cookie solo se envía por HTTPS cuando la aplicación está en producción. En desarrollo puede enviarse por HTTP.
sameSite: "lax": limita el envío de la cookie en solicitudes iniciadas desde otros sitios, lo que ayuda a mitigar ataques CSRF. Aun así, suele enviarse en navegaciones normales hacia el sitio.
maxAge: 60 * 60 * 1000: establece la duración en milisegundos: 3.600.000 ms, es decir, 1 hora.
    */
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hs
    };

    res.cookie("token", token, cookieOptions);
    //-----------------------------------------------------------------

    //envio la respuesta al cliente------------------------------------
    return res.status(200).json({
      ok: true,
      message: "Login exitoso!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

// El controlador para verificar el email (por mi)-----------------------------------
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    //buscar a ese usuario---------------
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }
    //-----------------------------------

    //verificar que el código coincida----------------
    if (user.verificationCode !== code) {
      return res.status(400).json({
        ok: false,
        message: "Código de verificación incorrecto",
      });
    }
    //----------------------------------------------

    //verificar que el usuario no esté ya validado
    if (user.emailVerified) {
      return res.status(400).json({
        ok: false,
        message: "El usuario ya está verificado",
      });
    }
    //------------------------------------------

    //verificar que el código no haya expirado
    if (user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({
        ok: false,
        message: "El código de verificación ya expiró",
      });
    }
    //----------------------------------------

    //Marcar el email como verificado y limpiar el código
    user.emailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;

    await user.save();

    return res.status(200).json({
      ok: true,
      message: "Email verificado correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

//---------------------------------------------------------------------------
//Cerrar sesión
const logOut = (req, res) => {
  //verificar si tiene token de inicio de sesión
  const token = req.cookies?.token;

  if (!token) {
    return res.status(400).json({
      ok: false,
      message: "La sesión no fue iniciada",
    });
  }

  //limpiar la cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  return res.status(200).json({
    ok: true,
    message: "Sesión cerrada con éxito!",
  });
};

// Ver perfil del usuario
const getProfile = (req, res) => {
  try {
    const { username, email, role, emailVerified } = req.user;
    res.json({
      success: true,
      data: {
        username,
        email,
        role,
        emailVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

//-----------------------------------------------------------------------
const updatePassword = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      ok: false,
      message: "No existe el usuario",
    });
  }

  if (!user.emailVerified) {
    return res.status(400).json({
      ok: false,
      message: "El email no está verificado",
    });
  }

  //Uso función de Utils
  await sendUpdatePassword(user.email, user.username);
  user.password = password;

  await user.save();

  return res.status(200).json({
    ok: true,
    message: "Contraseña actualizada",
    password,
  });
};

//------------------------------------------------------
const resendCodeVerificationMail = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(400).json({
      ok: false,
      message: "Las credenciales no son correctas",
    });
  }
  const isPasswordValid = user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(400).json({
      ok: false,
      message: "Las credenciales no son correctas",
    });
  }

  // Generar el codigo de verificación
  const verificationCode = user.generateVerificationCode();

  await user.save()

  try {
    await sendVerificationEmail(user.email, user.username, verificationCode);
    return res.status(200).json({
      ok: true,
      message: "Se envió un nuevo código de verificación",
    });
  } catch (error) {
    console.error("Error al enviar el email", error);
    return res.status(500).json({
      ok: false,
      message: "Error al enviar el email",
      error,
    });
  }
};

export {
  getAuth,
  register,
  login,
  verifyEmail,
  logOut,
  getProfile,
  updatePassword,
  resendCodeVerificationMail,
};
//-------------------------------------------------------------------------------------
