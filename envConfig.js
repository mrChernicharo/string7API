import * as dotenv from "dotenv";
const ENV = dotenv.config().parsed || process.env;

export { ENV };
