import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Encriptación de la contraseña
// transforma la contraseña de un usuario en una cadena de longitud fija de caracteres mezclados que no se puede revertir ni descifrar fácilmente.

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Generación de código
UserSchema.methods.generateVerificationCode = function () {
  //codigo de 6 digitos
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // codigo de 6 digitos

  this.verificationCode = code;
  this.verificationCodeExpires = Date.now() + 15 * 60 * 1000; //15 minutos
  return code;
};

// Comparar las contraseñas (no es una función asincrona y se usa compareSync)
UserSchema.methods.comparePassword = function (userPassword) {
  return bcrypt.compareSync(userPassword, this.password); // Devuelve un booleano.
};

export default model("User", UserSchema);
