const express = require("express");
const morgan = require("morgan");
const { getConnection } = require("./database");
const cors = require("cors");

// Configuracion inicial
const app = express();
app.set("port", 4000);
app.listen(app.get("port"), () => {
  console.log(`Server is running on port ${app.get("port")}`);
});

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:4000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));

// Rutas
app.get("/productos", async (req, res) => {
  const connection = await getConnection();
  const result = await connection.query("SELECT * FROM productos");

  res.json(result);
});
