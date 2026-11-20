const express = require("express");
const cors = require("cors");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const swaggerDocument = YAML.load(path.join(__dirname, "../openapi.yaml"));

const { connectDB } = require("./models");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const tagRoutes = require("./routes/tagRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tags", tagRoutes);

app.get("/", (req, res) => {
  res.send("¡El servidor está funcionando correctamente!");
});

app.use((err, req, res, next) => {
  if (
    (err instanceof SyntaxError && err.status === 400 && "body" in err) ||
    err.type === "entity.parse.failed"
  ) {
    return res.status(400).json({
      error: "El cuerpo de la solicitud no contiene un JSON válido.",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: "Ya existe un registro con ese valor único.",
    });
  }

  console.error(err.stack);
  res.status(500).json({ error: "Ocurrió un error interno en el servidor" });
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("✅ Base de datos y modelos conectados correctamente.");
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar la base de datos:", error);
  });
