import mongoose from "mongoose";

// const MONGO_URI = "mongodb://127.0.0.1:27017/web24_api";

export const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅Base de datos conectada");
  } catch (error) {
    console.error("❌Error de conexión", error);
  }
};
