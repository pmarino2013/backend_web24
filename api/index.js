import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "../src/routes/auth.routes.js";
import categoryRoutes from "../src/routes/category.routes.js";
import productRoutes from "../src/routes/product.routes.js";

import { dbConnect } from "../src/config/database.js";
const app = express();
const PORT = 4500;

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

//Rutas---------------------------
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);

// await dbConnect();
dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server online en puerto: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      "No se pudo iniciar el servidor por error en la base de datos:",
      err,
    );
    process.exit(1);
  });
// app.listen(PORT, () => console.log(`Server online, port: ${PORT}`));

export default app;
