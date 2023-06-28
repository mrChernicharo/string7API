import postgres from "postgres";
import { ENV } from "./envConfig.js";

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = ENV.PGHOST ? ENV : process.env;

const DB_URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}`;
const sql = postgres(DB_URL, { ssl: "require" });

/**
 * @returns {Promise<Skill[]>} skills
 * */
export async function DB_getSkills() {
  return await sql`select * from skills`;
}

/**
 * @returns {Promise<Job[]>} jobs
 * */
export async function DB_getJobs() {
  return await sql`select * from jobs`;
}

/**
 * @returns {Promise<Project[]>} projects
 * */
export async function DB_getProjects() {
  const [projectImgs, projectVideos, projects] = await Promise.all([
    sql`select * from project_images`,
    sql`select * from project_videos`,
    sql`select * from projects`,
  ]);

  const videosByProj = {};
  const imgsByProj = {};

  for (const video of projectVideos.values()) {
    videosByProj[video.project_id] = video.url;
  }
  for (const img of projectImgs.values()) {
    if (!(img.project_id in imgsByProj)) {
      imgsByProj[img.project_id] = [];
    }
    imgsByProj[img.project_id].push(img.url);
  }

  return projects.map((proj) => {
    return {
      ...proj,
      image_urls: imgsByProj[proj.id],
      video_url: videosByProj[proj.id],
    };
  });
}
