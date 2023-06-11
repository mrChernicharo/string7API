import { config } from "dotenv";
import express from "express";
import cors from "cors";
import routes from "./routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

const env = process.env.NODE_ENV || "development";
const { PORT } = config().parsed;

app.listen({ host: "0.0.0.0", port: Number(PORT) || 3333 }, () => {
  console.log(process.env);
  console.log(`server listening on port ${PORT}:: ${env} environment`);
});
