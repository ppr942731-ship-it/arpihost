const { kv } = require('@vercel/kv');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' });

  try {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { webName, projectName, html } = JSON.parse(body);

    if (!webName || !projectName || !html) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const cleanWeb = webName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
    const cleanProject = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
    const fullUrl = `${cleanWeb}.${cleanProject}.arpihost.vercel.app`;
    const key = `project:${cleanWeb}:${cleanProject}`;

    const existing = await kv.get(key);
    if (existing) return res.status(409).json({ error: 'Nama ini sudah dipakai, pilih yang lain!' });

    await kv.set(key, {
      webName: cleanWeb,
      projectName: cleanProject,
      url: fullUrl,
      html,
      createdAt: new Date().toISOString()
    });

    await kv.sadd('projects:all', key);
    return res.status(200).json({ success: true, url: fullUrl, message: '✅ DEPLOY BERHASIL!' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
