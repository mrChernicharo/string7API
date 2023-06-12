import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { ENV } from "./envConfig.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

const env = process.env.NODE_ENV || "development";
const { PORT } = process.env;

app.listen({ host: "0.0.0.0", port: ENV.PORT }, () => {
  
  console.log(`server listening on port ${3333}:: ${env} environment`);
});
