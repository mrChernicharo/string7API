import { Router } from "express";
import { DB_getSkills, DB_getProjects, DB_getJobs } from "./db-helper.js";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const cache = {};

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

const execAsync = promisify(exec);

const downloadImageAndSaveToFolder = (url, filepath) => {
  let client = http;
  if (url.toString().indexOf("https") === 0) {
    client = https;
  }
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      res
        .pipe(fs.createWriteStream(filepath))
        .on("error", reject)
        .once("close", () => resolve(filepath));
    });
  });
};

routes.get("/small-images", async (req, res) => {
  if (!cache.projects) {
    console.warn("No data in the cache");
    return res.end("done!");
  }

  // get a list of imgUrls
  const { projects } = cache;
  const projectImgUrls = projects.map((proj) => (proj.image_urls instanceof Array ? proj.image_urls : [])).flat();

  // prepare list of promises
  const imgPromises = projectImgUrls.map((imgUrl) => {
    const filename = imgUrl.replace("https://string7devfiles.s3.amazonaws.com/projects/images/", "");
    const path = `./.data/original_images/${filename}`;
    return downloadImageAndSaveToFolder(imgUrl, path);
  });
  // execute promises #1 -> download imgs from urls, save them to .data/original_images
  await Promise.all(imgPromises);

  // read all files from folder
  const files = await fs.promises.readdir("./.data/original_images");
  console.log(files);
  res.end("done!");

  // prepare ffmpeg scaling command for each image
  const smallFilesPromises = [];
  for (const file of files) {
    const command = `ffmpeg -i ./.data/original_images/${file} -vf "scale=20:-1" ././.data/small_images/${file}`;
    smallFilesPromises.push(execAsync(command));
  }

  // execute promises #2 -> create a shrink version of each image and save it to the small_images folder
  Promise.all(smallFilesPromises)
    .then(() => {
      console.log("success");
    })
    .finally(() => {
      res.end("done!");
    });
});

export default routes;
