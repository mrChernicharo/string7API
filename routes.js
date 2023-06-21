import { Router } from 'express';
import postgres from 'postgres';
import { ENV } from './envConfig.js';

const routes = Router();
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = ENV.PGHOST
	? ENV
	: process.env;

const DB_URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}`;
console.log(DB_URL);
const sql = postgres(DB_URL, { ssl: 'require' });

routes.use('/skills', async (req, res) => {
	try {
		const skills = await sql`select * from skills`;

		return res.json({ skills });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
});

routes.use('/projects', async (req, res) => {
	try {
		const projectImgs = await sql`
			select * from project_images
		`;

		const projectVideos = await sql`
			select * from project_videos
		`;

		const projects = await sql`
			select * from projects
		`;

		const videosByProj = {};
		for (const video of projectVideos.values()) {
			videosByProj[video.project_id] = video.url;
		}

		const imgsByProj = {};
		for (const img of projectImgs.values()) {
			if (!(img.project_id in imgsByProj)) {
				imgsByProj[img.project_id] = [];
			}
			imgsByProj[img.project_id].push(img.url);
		}

		const finalData = projects.map(proj => {
			return {
				...proj,
				image_urls: imgsByProj[proj.id],
				video_url: videosByProj[proj.id],
			};
		});

		return res.json({
			projects: finalData,
		});

		// 	const projects = await sql`
		//   select proj.*, videos.url as video_url
		//   from projects as proj
		//   left join project_videos as videos
		//   on videos.project_id = proj.id;
		// `;
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
});

routes.use('/jobs', async (req, res) => {
	try {
		const jobs = await sql`select * from jobs`;

		return res.json({ jobs });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
});

export default routes;
