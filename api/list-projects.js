const { kv } = require('@vercel/kv');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const keys = await kv.smembers('projects:all');
    const projects = [];
    for (const key of keys) {
      const p = await kv.get(key);
      if (p) projects.push(p);
    }
    return res.status(200).json({ projects });
  } catch (err) {
    return res.status(200).json({ projects: [] });
  }
}
