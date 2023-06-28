import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { DB_getSkills, DB_getJobs, DB_getProjects } from "./db.js";

const cache = {};

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

export const getJobs = async (req, res) => {
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
};

export const getSkills = async (req, res) => {
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
};

export const getProjects = async (req, res) => {
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
};

// *** FOR LOCAL USAGE ONLY ***
export const getSmallImages = async (req, res) => {
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
};
