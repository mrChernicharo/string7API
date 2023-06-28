import { Router } from "express";
import { getJobs, getProjects, getSkills, getSmallImages } from "./handlers.js";

const routes = Router();

/**
 *   {
      id: '377c4709-712c-4a86-8d4c-3447cb7fd831',
      name: 'd3-electrorating',
      site_url: 'https://mrchernicharo.github.io/d3-electrorating/no-financieros.html',
      github_url: 'https://github.com/mrChernicharo/d3-electrorating',
      created_at: 2021-12-05T22:00:24.000Z,
      updated_at: 2022-03-26T19:48:27.000Z,
      description: null,
      main_language: 'JavaScript',
      image_urls: [Array],
      video_url: undefined
    },
 */

routes.get("/skills", getSkills);

routes.get("/projects", getProjects);

routes.get("/jobs", getJobs);

// *** FOR LOCAL USAGE ONLY ***
// routes.get("/small-images", getSmallImages);

export default routes;
