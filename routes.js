import { Router } from "express";
import { DB_getSkills, DB_getProjects, DB_getJobs } from "./db-helper.js";

const cache = {};

const routes = Router();

routes.get("/skills", async (req, res) => {
  try {
    let skills;

    if (cache.skills) {
      skills = cache.skills;
    } else {
      skills = await DB_getSkills();
      cache.skills = skills;
    }

    return res.json({ skills });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

routes.get("/projects", async (req, res) => {
  try {
    let projects;

    if (cache.projects) {
      projects = cache.projects;
    } else {
      projects = await DB_getProjects();
      cache.projects = projects;
    }

    return res.json({ projects });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

routes.get("/jobs", async (req, res) => {
  try {
    let jobs;

    if (cache.jobs) {
      jobs = cache.jobs;
    } else {
      jobs = await DB_getJobs();
      cache.jobs = jobs;
    }

    return res.json({ jobs });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

routes.get("/process-images", async (req, res) => {});

export default routes;
