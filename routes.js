import { Router } from "express";
import postgres from "postgres";

const routes = Router();
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

const URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}`;
const sql = postgres(URL, { ssl: "require" });


routes.use("/skills", async (req, res) => {
  try {
    const skills = await sql`select * from skills`;

    return res.json({ skills });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

routes.use("/projects", async (req, res) => {
  try {
    const projects = await sql`select * from projects`;

    return res.json({ projects });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

routes.use("/jobs", async(req, res) => {
  try {
    const jobs = await sql`select * from jobs`;

    return res.json({ jobs });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default routes;